// Agent-driven dependency upgrades: hands breaking-change upgrades to
// `claude -p`, which reads each package's llms.txt / migration guide,
// migrates the code idiomatically, and commits one group at a time.
//
//   pnpm upgrade:deps                 # every package with a new major
//   pnpm upgrade:deps better-auth     # specific packages, any version jump
//   pnpm upgrade:deps --dry-run       # print the prompt, don't run it
//   pnpm upgrade:deps --model opus    # override the default model (sonnet)
//
// Commits land on the current branch and are never pushed.

import { spawn, spawnSync } from "node:child_process";
import { createInterface } from "node:readline";

interface OutdatedEntry {
  current: string;
  dependencyType: "dependencies" | "devDependencies";
  latest: string;
}

interface Target {
  current: string;
  dev: boolean;
  latest: string;
  name: string;
}

// Packages that must move together: upgrading one without the others breaks
// peer dependencies or the generated code they share.
const FAMILIES: string[][] = [
  ["better-auth", "@better-auth/stripe", "better-auth-harmony", "stripe"],
  [
    "next",
    "@next/env",
    "react",
    "react-dom",
    "@types/react",
    "@types/react-dom",
  ],
  ["prisma", "@prisma/client", "@prisma/adapter-pg"],
  ["tailwindcss", "@tailwindcss/postcss", "@tailwindcss/typography"],
  ["react-email", "@react-email/ui"],
  ["@biomejs/biome", "ultracite"],
];

// LLM-oriented docs indexes. Packages not listed here fall back to release
// notes and changelogs.
const LLMS_TXT: Record<string, string> = {
  "better-auth": "https://www.better-auth.com/llms.txt",
  "@better-auth/stripe": "https://www.better-auth.com/llms.txt",
  next: "https://nextjs.org/docs/llms.txt",
  react: "https://react.dev/llms.txt",
  "react-dom": "https://react.dev/llms.txt",
  prisma: "https://www.prisma.io/docs/llms.txt",
  "@prisma/client": "https://www.prisma.io/docs/llms.txt",
  "@prisma/adapter-pg": "https://www.prisma.io/docs/llms.txt",
  stripe: "https://docs.stripe.com/llms.txt",
  shadcn: "https://ui.shadcn.com/llms.txt",
  "react-email": "https://react.email/docs/llms.txt",
  zod: "https://zod.dev/llms.txt",
};

const ALLOWED_TOOLS = [
  "Read",
  "Edit",
  "Write",
  "Glob",
  "Grep",
  "WebFetch",
  "WebSearch",
  "Bash(pnpm *)",
  "Bash(pnpx @better-auth/cli*)",
  "Bash(npx @next/codemod*)",
  "Bash(curl -sL https://*)",
  "Bash(gh release *)",
  "Bash(gh api repos/*)",
  "Bash(git status*)",
  "Bash(git diff*)",
  "Bash(git log*)",
  "Bash(git add *)",
  "Bash(git commit *)",
  "Bash(git restore *)",
  "Bash(diff *)",
  "Bash(ls *)",
  "Bash(cat *)",
];

// Deny rules win over allow rules, so these stay off even under `pnpm *`.
const DISALLOWED_TOOLS = [
  "Bash(git push*)",
  "Bash(pnpm dbpush*)",
  "Bash(pnpm db:*)",
  "Bash(pnpm dlx *)",
  "Bash(pnpm publish*)",
];

// Pinned so runs behave the same on every machine, whatever the local
// Claude Code default is. Override per run with --model.
const DEFAULT_MODEL = "sonnet";

const breakingJump = (current: string, latest: string): boolean => {
  const [cMajor, cMinor] = current.split(".").map(Number);
  const [lMajor, lMinor] = latest.split(".").map(Number);
  // In 0.x, a minor bump is the breaking one.
  return cMajor === 0 && lMajor === 0 ? lMinor > cMinor : lMajor > cMajor;
};

const readOutdated = (): Record<string, OutdatedEntry> => {
  // `pnpm outdated` exits 1 whenever something is outdated, so ignore status.
  const { stdout } = spawnSync("pnpm", ["outdated", "--format", "json"], {
    encoding: "utf8",
  });
  const outdated: Record<string, OutdatedEntry> = stdout.trim()
    ? JSON.parse(stdout)
    : {};
  // Some packages point the `latest` tag at a release candidate; never
  // upgrade to one of those.
  for (const [name, entry] of Object.entries(outdated)) {
    if (entry.latest.includes("-")) {
      console.warn(
        `Skipping ${name}: latest is a prerelease (${entry.latest})`
      );
      delete outdated[name];
    }
  }
  return outdated;
};

const selectTargets = (
  outdated: Record<string, OutdatedEntry>,
  requested: string[]
): Target[][] => {
  const toTarget = (name: string): Target => ({
    name,
    current: outdated[name].current,
    latest: outdated[name].latest,
    dev: outdated[name].dependencyType === "devDependencies",
  });

  const unknown = requested.filter((name) => !outdated[name]);
  if (unknown.length > 0) {
    console.warn(
      `Already up to date or not a dependency: ${unknown.join(", ")}`
    );
  }

  const seeds =
    requested.length > 0
      ? requested.filter((name) => outdated[name])
      : Object.keys(outdated).filter((name) =>
          breakingJump(outdated[name].current, outdated[name].latest)
        );

  // Expand each seed to its outdated family members, one group per family.
  const groups: Target[][] = [];
  const claimed = new Set<string>();
  for (const seed of seeds) {
    if (claimed.has(seed)) {
      continue;
    }
    const family = FAMILIES.find((f) => f.includes(seed)) ?? [seed];
    const members = family.filter(
      (name) => outdated[name] && !claimed.has(name)
    );
    for (const name of members) {
      claimed.add(name);
    }
    groups.push(members.map(toTarget));
  }
  return groups;
};

const describeGroup = (group: Target[], index: number): string => {
  const lines = group.map((t) => {
    const docs = LLMS_TXT[t.name] ? ` — llms.txt: ${LLMS_TXT[t.name]}` : "";
    return `   - ${t.name}${t.dev ? " (dev)" : ""}: ${t.current} → ${t.latest}${docs}`;
  });
  return `${index + 1}. ${group.map((t) => t.name).join(" + ")}\n${lines.join("\n")}`;
};

const buildPrompt = (
  groups: Target[][]
): string => `You are upgrading dependencies in this Next.js template. AGENTS.md is the source of truth for how this repo works — follow it.

Upgrade these groups, in order. Packages in a group move together and get one commit.

${groups.map(describeGroup).join("\n\n")}

For EACH group, work through these steps before starting the next group:

1. Research the breaking changes between the current and target versions.
   - Where an llms.txt is listed, fetch it (\`curl -sL <url>\` gives the raw index; WebFetch summarises) and use it to find the upgrade / migration guide and the pages for every API this repo uses. Fetch those pages.
   - Also read the release notes for every version in between: \`pnpm view <pkg> repository.url\` to find the repo, then \`gh release list\` / \`gh release view\`, or the CHANGELOG.
   - For next, after installing also read the upgrade guide shipped in node_modules/next/dist/docs/.
   - Grep src/, prisma/ and config files for every API mentioned as changed, renamed, removed or deprecated, so you know the blast radius before touching anything.

2. Install with \`pnpm add <pkg>@<version>\` (\`-D\` for dev). Keep the existing specifier style — exact pins stay exact, caret ranges stay caret. First check peer dependencies with \`pnpm view <dependent> peerDependencies\`: if another package here doesn't support the new version yet (for example, @better-auth/stripe pinning a stripe range), skip the group and say which package is holding it back.

3. Migrate the code idiomatically.
   - Run an official codemod where the migration guide recommends one, then review its output.
   - Adopt the pattern the new docs recommend. Don't add compatibility shims, \`as any\` casts, or @ts-expect-error to get things compiling, and replace deprecated APIs even if they still work.
   - Keep the change to what the upgrade needs. Don't refactor unrelated code.
   - If a convention described in AGENTS.md changes (commands, config, file locations), update AGENTS.md in the same commit.

4. Package-specific checks.
   - better-auth / @better-auth/stripe: run the schema-drift check from AGENTS.md, but pin the CLI to the installed better-auth version instead of @latest. Add any field the plugin now writes to prisma/schema.prisma. Re-read the credit-granting rules in AGENTS.md and confirm the Stripe hooks in src/lib/auth.ts still fire at the moments those rules depend on (onSubscriptionComplete, invoice.paid via onEvent, onSubscriptionUpdate, onSubscriptionDeleted).
   - prisma: if the schema changes, do NOT run any db command. Note in your report that a migration must be created with \`pnpm db:migrate\`.
   - Never run pnpm db:* or dbpush scripts, and never push.

5. Verify with \`pnpm lint\`, \`pnpm typecheck\` and \`pnpm build\`, and fix until all three pass. If the build fails only on missing env vars, rerun it with the dummy values from .github/workflows/ci.yml. Run \`pnpm format\` if lint flags formatting.

6. Commit only that group's changes with a short message in the form \`Bump <pkg> from <old> to <new>\`. For several packages, name the main one, e.g. \`Bump better-auth from 1.7.7 to 2.0.0\`.

If a group still can't pass after a genuine effort, \`git restore\` its changes (including package.json and pnpm-lock.yaml), leave it un-upgraded, and continue with the next group.

When finished, report the following for each group:
- whether it was upgraded or skipped, and why
- what changed in the code, and which docs pages drove each change
- anything a human must do: migrations to create, env vars to add, Stripe dashboard changes
- manual test steps for auth and billing changes, per AGENTS.md testing guidelines`;

const summarizeInput = (input: Record<string, unknown>): string => {
  const value =
    input.command ??
    input.file_path ??
    input.url ??
    input.pattern ??
    input.query ??
    "";
  return String(value).split("\n")[0].slice(0, 120);
};

const runClaude = (prompt: string, model: string): Promise<number> => {
  const args = [
    "-p",
    prompt,
    "--permission-mode",
    "acceptEdits",
    "--allowedTools",
    ...ALLOWED_TOOLS,
    "--disallowedTools",
    ...DISALLOWED_TOOLS,
    "--output-format",
    "stream-json",
    "--verbose",
    "--model",
    model,
  ];

  const child = spawn("claude", args, { stdio: ["ignore", "pipe", "inherit"] });

  // Stream progress: the agent's prose plus a one-line trace per tool call.
  createInterface({ input: child.stdout }).on("line", (line) => {
    let event: {
      type?: string;
      message?: { content?: Record<string, unknown>[] };
      result?: string;
      total_cost_usd?: number;
    };
    try {
      event = JSON.parse(line);
    } catch {
      return;
    }
    if (event.type === "assistant") {
      for (const block of event.message?.content ?? []) {
        if (block.type === "text") {
          console.log(`\n${block.text}`);
        } else if (block.type === "tool_use") {
          const input = (block.input ?? {}) as Record<string, unknown>;
          console.log(`  → ${block.name} ${summarizeInput(input)}`);
        }
      }
    } else if (event.type === "result") {
      const cost = event.total_cost_usd?.toFixed(2) ?? "?";
      console.log(`\n${"─".repeat(60)}\nDone (cost $${cost}).`);
    }
  });

  return new Promise((resolve) => {
    child.on("close", (code) => resolve(code ?? 1));
  });
};

const main = async (): Promise<void> => {
  const argv = process.argv.slice(2);
  const dryRun = argv.includes("--dry-run");
  const modelIndex = argv.indexOf("--model");
  const model = modelIndex === -1 ? DEFAULT_MODEL : argv[modelIndex + 1];
  const requested = argv.filter(
    (arg, i) =>
      !arg.startsWith("--") && (modelIndex === -1 || i !== modelIndex + 1)
  );

  const dirty = spawnSync("git", ["status", "--porcelain"], {
    encoding: "utf8",
  });
  if (!dryRun && dirty.stdout.trim()) {
    console.error(
      "Working tree is dirty. Commit or stash first so each upgrade is its own reviewable commit."
    );
    process.exit(1);
  }

  const groups = selectTargets(readOutdated(), requested);
  if (groups.length === 0) {
    console.log(
      requested.length > 0
        ? "Nothing to upgrade."
        : "No new majors. Dependabot covers minor and patch bumps."
    );
    return;
  }

  console.log("Upgrading:\n");
  console.log(groups.map(describeGroup).join("\n"));

  const prompt = buildPrompt(groups);
  if (dryRun) {
    console.log(`\n${"─".repeat(60)}\n${prompt}`);
    return;
  }

  const start = spawnSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).stdout.trim();
  const code = await runClaude(prompt, model);
  console.log("\nCommits from this run:");
  spawnSync("git", ["log", "--oneline", `${start}..HEAD`], {
    stdio: "inherit",
  });
  process.exit(code);
};

await main();
