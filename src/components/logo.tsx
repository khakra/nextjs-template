// Generic placeholder mark — swap for your own brand asset.
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="currentColor" height="32" rx="8" width="32" />
      <path
        d="M9 21.5 16 9l7 12.5h-4.2L16 16.4l-2.8 5.1H9Z"
        fill="var(--background, #fff)"
      />
    </svg>
  );
}
