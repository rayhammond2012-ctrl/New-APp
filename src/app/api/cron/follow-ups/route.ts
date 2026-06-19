import { NextResponse } from 'next/server'
import { getSupabase } from '@/lib/getSupabase()'
import { sendSms } from '@/lib/twilio'

const DEMO_BUSINESS = { id: 'demo-001', name: 'Demo Roofing Co.', phone: '+15551234567' }

const FOLLOW_UP_MESSAGES: Record<number, string> = {
  1: "Just checking in. Are you still looking for {service}?",
  3: "We have openings available this week. Would you like a free quote?",
  7: "Following up one last time before we close your request.",
}

export async function GET() {
  try {
    const results: { leadId: string; name: string; day: number; sent: boolean; error?: string }[] = []

    // Fetch all non-booked leads for the demo business
    const { data: leads, error } = await getSupabase()
      .from('leads')
      .select('*')
      .eq('business_id', DEMO_BUSINESS.id)
      .neq('status', 'booked')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch leads:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    for (const lead of leads) {
      const daysSinceCreation = Math.floor(
        (Date.now() - new Date(lead.created_at).getTime()) / (1000 * 60 * 60 * 24)
      )

      // Determine which follow-up day we're on (1, 3, or 7)
      let followUpDay: number | null = null
      if (daysSinceCreation >= 7) {
        followUpDay = 7
      } else if (daysSinceCreation >= 3) {
        followUpDay = 3
      } else if (daysSinceCreation >= 1) {
        followUpDay = 1
      }

      if (followUpDay === null) {
        // Lead is less than 1 day old, skip
        continue
      }

      // Check if this follow-up message was already sent for this day
      const { data: existingTexts } = await getSupabase()
        .from('texts')
        .select('body')
        .eq('lead_id', lead.id)
        .eq('direction', 'outbound')
        .order('sent_at', { ascending: false })

      const expectedMessage = FOLLOW_UP_MESSAGES[followUpDay].replace('{service}', lead.service)

      // Check if this exact message was already sent
      const alreadySent = existingTexts?.some(t => t.body === expectedMessage) ?? false

      if (alreadySent) {
        results.push({
          leadId: lead.id,
          name: lead.name,
          day: followUpDay,
          sent: false,
          error: 'Already sent',
        })
        continue
      }

      // Send the SMS
      const smsSent = await sendSms(lead.phone, expectedMessage)

      if (smsSent) {
        // Log the outbound text
        await getSupabase().from('texts').insert({
          lead_id: lead.id,
          direction: 'outbound',
          body: expectedMessage,
        })

        // Update lead status to 'contacted'
        await getSupabase()
          .from('leads')
          .update({ status: 'contacted', updated_at: new Date().toISOString() })
          .eq('id', lead.id)

        results.push({
          leadId: lead.id,
          name: lead.name,
          day: followUpDay,
          sent: true,
        })
      } else {
        results.push({
          leadId: lead.id,
          name: lead.name,
          day: followUpDay,
          sent: false,
          error: 'SMS send failed',
        })
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    console.error('Cron follow-up error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}