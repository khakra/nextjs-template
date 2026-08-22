import { AuthSkeleton } from "@/components/auth-skeleton";

// The login and register pages resolve the session on the server, so a client
// navigation to them waits on a round trip. Without this the user stares at the
// previous page until it lands.
export default function Loading() {
  return (
    <div className="flex h-dvh w-screen items-start justify-center bg-background pt-12 md:items-center md:pt-0">
      <AuthSkeleton />
    </div>
  );
}
