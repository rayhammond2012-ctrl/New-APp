'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewLeadPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, service }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create lead')
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-12 w-full">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 mt-2">Add New Lead</h1>
        <p className="text-zinc-500 mt-1">
          Enter their details and ReplyFlow will send an instant SMS.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-6 space-y-5">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 123-4567"
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          />
        </div>

        <div>
          <label htmlFor="service" className="block text-sm font-medium text-zinc-700 mb-1.5">
            Service Needed
          </label>
          <input
            id="service"
            type="text"
            required
            value={service}
            onChange={(e) => setService(e.target.value)}
            placeholder="Roof repair, HVAC service, etc."
            className="w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent"
          />
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex h-11 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Adding Lead...' : 'Add Lead & Send SMS'}
        </button>
      </form>
    </div>
  )
}