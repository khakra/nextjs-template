"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-semibold text-3xl tracking-tight">
        Something went wrong
      </h1>
      <p className="max-w-md text-muted-foreground">
        An unexpected error occurred. You can try again, or head back to the
        homepage.
      </p>
      {error.digest ? (
        <p className="text-muted-foreground text-xs">
          Error reference: {error.digest}
        </p>
      ) : null}
      <div className="flex gap-3">
        <Button onClick={reset} type="button">
          Try again
        </Button>
        <Button asChild variant="outline">
          <a href="/">Go home</a>
        </Button>
      </div>
    </div>
  );
}
