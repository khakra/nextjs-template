import Link from "next/link";

export default function CTA() {
  return (
    <div className="">
      <div className="px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-semibold text-4xl text-secondary-foreground tracking-tight sm:text-5xl">
            Boost your productivity. Start using our app today.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-muted-foreground">
            Incididunt sint fugiat pariatur cupidatat consectetur sit cillum
            anim id veniam aliqua proident excepteur commodo do ea.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              className="rounded-md bg-primary px-3.5 py-2.5 font-semibold text-primary-foreground text-sm shadow-xs hover:bg-primary focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
              href="/register"
            >
              {" "}
              Get started{" "}
            </Link>
            <Link
              className="font-semibold text-secondary-foreground text-sm/6"
              href="#"
            >
              Learn more
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
