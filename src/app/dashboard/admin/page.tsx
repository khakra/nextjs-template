import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImpersonateButton } from "@/components/impersonate-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false },
};

const PAGE_SIZE = 25;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pageHref(page: number, q: string) {
  const params = new URLSearchParams();
  if (q) {
    params.set("q", q);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const query = params.toString();
  return query ? `/dashboard/admin?${query}` : "/dashboard/admin";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const requestHeaders = await headers();
  // The dashboard layout only checks for a session; this page needs its own
  // role check because layouts and pages render independently.
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!(session && isAdmin(session.user))) {
    notFound();
  }

  const params = await searchParams;
  const q = firstParam(params.q)?.trim() ?? "";
  const page = Math.max(1, Number(firstParam(params.page)) || 1);

  const result = await auth.api.listUsers({
    headers: requestHeaders,
    query: {
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
      sortBy: "createdAt",
      sortDirection: "desc",
      ...(q && {
        searchValue: q,
        // Email rather than name: OTP sign-ups often have an empty name.
        searchField: "email",
        searchOperator: "contains",
      }),
    },
  });
  // listUsers is typed with the plugin's base user, but the rows also carry
  // this app's additional fields (credits, usage).
  const users = result.users as (typeof auth.$Infer.Session.user)[];
  const { total } = result;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-semibold text-xl">Users</h2>
          <p className="text-muted-foreground text-sm">
            {total} {total === 1 ? "user" : "users"}
            {q ? ` matching “${q}”` : ""}
          </p>
        </div>
        <form action="/dashboard/admin" className="flex gap-2">
          <Input
            aria-label="Search users"
            className="w-full sm:w-72"
            defaultValue={q}
            name="q"
            placeholder="Search by email"
          />
          <Button type="submit" variant="outline">
            Search
          </Button>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="bg-muted">
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Credits used</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell className="h-24 text-center" colSpan={6}>
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const userIsAdmin = isAdmin(user);
                const isSelf = user.id === session.user.id;
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={userIsAdmin ? "default" : "outline"}>
                        {user.role ?? "user"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Banned</Badge>
                      ) : (
                        <Badge variant="secondary">
                          {user.emailVerified ? "Verified" : "Unverified"}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {user.usage} / {user.credits}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("en-US", {
                        dateStyle: "medium",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      {/* The plugin refuses to impersonate admins by default */}
                      <ImpersonateButton
                        disabled={userIsAdmin || isSelf}
                        userId={user.id}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            {page > 1 ? (
              <Button asChild size="sm" variant="outline">
                <Link href={pageHref(page - 1, q)}>Previous</Link>
              </Button>
            ) : (
              <Button disabled size="sm" variant="outline">
                Previous
              </Button>
            )}
            {page < totalPages ? (
              <Button asChild size="sm" variant="outline">
                <Link href={pageHref(page + 1, q)}>Next</Link>
              </Button>
            ) : (
              <Button disabled size="sm" variant="outline">
                Next
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
