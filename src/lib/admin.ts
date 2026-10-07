// Shared by server pages and client components. Mirrors the admin plugin's
// default `adminRoles: ["admin"]`; roles are stored comma-separated.
export function isAdmin(user: { role?: string | null } | null | undefined) {
  return !!user?.role?.split(",").some((role) => role.trim() === "admin");
}
