'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Lead, Text } from '@/types'

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [lead, setLead] = useState<Lead | null>(null)
  const [texts, setTexts] = useState<Text[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [aiMessage, setAiMessage] = useState('')

  useEffect(() => {
    if (id) {
      fetchLead()
      fetchTexts()
    }
  }, [id])

  async function fetchLead() {
    try {
      const res = await fetch(`/api/leads?id=${id}`)
      const data = await res.json()
      setLead(data.lead || null)
    } catch (err) {
      console.error('Failed to fetch lead', err)
    } finally {
      setLoading(false)
    }
  }

  async function fetchTexts() {
    try {
      const res = await fetch(`/api/texts?leadId=${id}`)
      const data = await res.json()
      setTexts(data.texts || [])
    } catch (err) {
      console.error('Failed to fetch texts', err)
    }
  }

  async function handleGenerateAI() {
    if (!lead) return
    setGenerating(true)
    try {
      const res = await fetch('/api/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: lead.id,
          leadName: lead.name,
          service: lead.service,
          businessName: 'Demo Roofing Co.',
        }),
      })
      const data = await res.json()
      setAiMessage(data.message || '')
    } catch (err) {
      console.error('Failed to generate AI message', err)
    } finally {
      setGenerating(false)
    }
  }

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    booked: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-zinc-400">Loading...</p>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-zinc-500">Lead not found.</p>
        <Link href="/dashboard" className="text-zinc-900 underline mt-2 inline-block">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 w-full">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
        &larr; Back to Dashboard
      </Link>

      <div className="mt-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-zinc-900">{lead.name}</h1>
          <span className={`text-xs font-medium rounded-full px-3 py-1 ${statusColors[lead.status]}`}>
            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
          </span>
        </div>
        <div className="mt-2 text-zinc-600 space-y-1">
          <p>Phone: {lead.phone}</p>
          <p>Service: {lead.service}</p>
          <p className="text-sm text-zinc-400">
            Added: {new Date(lead.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* AI Message Generator */}
      <div className="bg-white rounded-xl border border-zinc-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-zinc-900 mb-3">AI Follow-Up Generator</h2>
        <button
          onClick={handleGenerateAI}
          disabled={generating}
          className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate Follow Up'}
        </button>
        {aiMessage && (
          <div className="mt-4 p-4 bg-zinc-50 rounded-lg border border-zinc-200">
            <p className="text-sm text-zinc-700">{aiMessage}</p>
          </div>
        )}
      </div>

      {/* Message History */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-200">
          <h2 className="text-lg font-semibold text-zinc-900">Message History</h2>
        </div>
        <div className="divide-y divide-zinc-100">
          {texts.length === 0 ? (
            <div className="px-6 py-8 text-center text-zinc-400">
              No messages yet. Add a lead to trigger the first SMS.
            </div>
          ) : (
            texts.map((text) => (
              <div key={text.id} className="px-6 py-4">
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      text.direction === 'outbound'
                        ? 'bg-zinc-100 text-zinc-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {text.direction === 'outbound' ? 'Sent' : 'Received'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-700">{text.body}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {new Date(text.sent_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}