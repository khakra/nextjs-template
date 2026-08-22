import { ImageResponse } from "next/og";

// Rendering is CPU-heavy, so cap the input and let the response be cached —
// otherwise every crawler hit and every social unfurl re-renders at the origin.
const MAX_TITLE_LENGTH = 120;

export function GET(request: Request) {
  const url = new URL(request.url);
  const title = (
    url.searchParams.get("title") ||
    process.env.NEXT_PUBLIC_PROJECT_NAME ||
    ""
  ).slice(0, MAX_TITLE_LENGTH);

  return new ImageResponse(
    <div tw="flex flex-col w-full h-full items-center justify-center bg-white">
      <div tw="flex flex-col md:flex-row w-full py-12 px-4 md:items-center justify-between p-8">
        <h2 tw="flex flex-col text-4xl font-bold tracking-tight text-left">
          {title}
        </h2>
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, immutable, no-transform, max-age=31536000",
      },
    }
  );
}
