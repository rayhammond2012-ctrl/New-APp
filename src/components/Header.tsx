import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-zinc-900">
          ReplyFlow
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-zinc-600 hover:text-zinc-900">
            Dashboard
          </Link>
          <Link href="/leads/new" className="text-sm text-zinc-600 hover:text-zinc-900">
            Add Lead
          </Link>
        </nav>
      </div>
    </header>
  )
}