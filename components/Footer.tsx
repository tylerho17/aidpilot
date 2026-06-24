import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-black/10 bg-white px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <p className="font-semibold">AidPilot</p>
          <p className="mt-1 text-sm text-black/50">
            Protect your financial aid. Find more college money every week.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-black/60">
          <Link href="/privacy" className="hover:text-black">
            Privacy Policy
          </Link>
          <Link href="/disclaimer" className="hover:text-black">
            Disclaimer
          </Link>
          <Link href="/dashboard" className="hover:text-black">
            Demo dashboard
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-xs leading-5 text-black/40">
        AidPilot is an independent service and is not affiliated with FAFSA,
        Federal Student Aid, the U.S. Department of Education, or any college or
        university.
      </p>
    </footer>
  );
}
