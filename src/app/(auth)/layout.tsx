import { Toaster } from "@/components/ui/sonner";

// Toaster is mounted per-route-group rather than in the root layout so the
// sonner runtime doesn't ship to marketing and content pages that never toast.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Toaster position="top-center" />
    </>
  );
}
