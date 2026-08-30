import validator from "validator";

/**
 * The address an account is identified by, once tagging is stripped.
 *
 * `validator.normalizeEmail` only removes `+tags` for the providers it knows —
 * Gmail, Outlook, Yahoo, iCloud — and leaves them intact everywhere else. That
 * makes `you+1@fastmail.com` and `you+2@fastmail.com` two accounts, each one
 * granted the free plan's credits. This strips the tag on every domain, and
 * the unique constraint on `normalizedEmail` does the rest.
 *
 * It does not close the general case: a catch-all domain still yields
 * `alice@`, `bob@` and so on with no tag involved. Nothing an address
 * normaliser can do reaches that; capping it is a rate-limiting problem.
 *
 * Returns false for an address `validator` cannot parse, which is the contract
 * better-auth-harmony expects from a normaliser.
 */
export function normalizeEmailForIdentity(email: string): string | false {
  const normalized = validator.normalizeEmail(email);

  if (!normalized) {
    return false;
  }

  const at = normalized.lastIndexOf("@");

  if (at <= 0) {
    return normalized;
  }

  const local = normalized.slice(0, at);
  const domain = normalized.slice(at + 1);
  const plus = local.indexOf("+");

  // A bare "+something@" would leave an empty local part, so leave it be and
  // let validation reject it rather than inventing an address.
  if (plus <= 0) {
    return normalized;
  }

  return `${local.slice(0, plus)}@${domain}`;
}
