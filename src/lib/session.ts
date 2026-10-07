import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { isAdmin } from "@/lib/admin";
import { auth } from "@/lib/auth";

// Server components only. Each getSession is a database lookup, and a layout
// and its page both need the session, so cache() shares one lookup per
// request. Route handlers and server actions aren't covered by cache(); call
// auth.api.getSession there.
export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() })
);

/** The signed-in session, or a redirect to /login. */
export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

/** The signed-in admin's session; everyone else gets a 404. */
export async function requireAdmin() {
  const session = await getSession();
  if (!(session && isAdmin(session.user))) {
    notFound();
  }
  return session;
}
