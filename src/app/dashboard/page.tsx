'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Lead } from '@/types'

export default function DashboardPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setLeads(data.leads || [])
    } catch (err) {
      console.error('Failed to fetch leads', err)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(leadId: string, newStatus: Lead['status']) {
    try {
      await fetch(`/api/leads`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      })
      fetchLeads()
    } catch (err) {
      console.error('Failed to update status', err)
    }
  }

  const statusColors: Record<Lead['status'], string> = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    booked: 'bg-green-100 text-green-800',
    lost: 'bg-red-100 text-red-800',
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-12 w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Dashboard</h1>
          <p className="text-zinc-500 mt-1">Manage your leads and follow-ups</p>
        </div>
        <Link
          href="/leads/new"
          className="inline-flex h-10 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          + Add Lead
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50">
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Service</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-zinc-500">Date</th>
                <th className="text-right py-3 px-4 text-sm font-medium text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-400">
                    No leads yet. Add your first lead to get started.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="py-3 px-4">
                      <Link href={`/leads/${lead.id}`} className="font-medium text-zinc-900 hover:text-zinc-600">
                        {lead.name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-zinc-600">{lead.phone}</td>
                    <td className="py-3 px-4 text-zinc-600">{lead.service}</td>
                    <td className="py-3 px-4">
                      <select
                        value={lead.status}
                        onChange={(e) => updateStatus(lead.id, e.target.value as Lead['status'])}
                        className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${statusColors[lead.status]}`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="booked">Booked</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-zinc-500 text-sm">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="text-sm text-zinc-500 hover:text-zinc-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}