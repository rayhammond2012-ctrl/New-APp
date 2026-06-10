import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-8">
        <div className="flex flex-col items-center gap-8 text-center">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900">
            ReplyFlow
          </h1>
          <p className="text-xl text-zinc-600 max-w-md">
            Automated SMS follow-ups for service businesses. Never lose a
            $500–$10,000 sale to a forgotten lead again.
          </p>
          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="inline-flex h-12 items-center justify-center rounded-full bg-zinc-900 px-8 text-base font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/leads/new"
              className="inline-flex h-12 items-center justify-center rounded-full border border-zinc-300 bg-white px-8 text-base font-medium text-zinc-900 transition-colors hover:bg-zinc-100"
            >
              Add New Lead
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}