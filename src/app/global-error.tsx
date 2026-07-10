"use client";

// Catches errors thrown by the root layout itself; must render its own
// html/body since the layout is replaced
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: "0 1.5rem",
        }}
      >
        <h1>Something went wrong</h1>
        <p>An unexpected error occurred.</p>
        {error.digest ? (
          <p style={{ fontSize: "0.75rem", color: "#737373" }}>
            Error reference: {error.digest}
          </p>
        ) : null}
        <button
          onClick={reset}
          style={{
            padding: "0.5rem 1rem",
            border: "1px solid currentColor",
            borderRadius: "0.375rem",
            background: "transparent",
            cursor: "pointer",
            font: "inherit",
          }}
          type="button"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
