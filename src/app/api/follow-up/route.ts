import { NextRequest, NextResponse } from 'next/server'
import { generateFollowUp } from '@/lib/openai'
import { supabase } from '@/lib/supabase'

// POST /api/follow-up — generate an AI follow-up message
export async function POST(request: NextRequest) {
  try {
    const { leadId, leadName, service, businessName } = await request.json()

    if (!leadId || !leadName || !service) {
      return NextResponse.json(
        { error: 'leadId, leadName, and service are required' },
        { status: 400 }
      )
    }

    // Get previous messages for context
    const { data: texts } = await supabase
      .from('texts')
      .select('body, direction')
      .eq('lead_id', leadId)
      .order('sent_at', { ascending: true })
      .limit(10)

    const conversationHistory = (texts || []).map(
      (t) => `${t.direction === 'outbound' ? 'Business' : 'Lead'}: ${t.body}`
    )

    const message = await generateFollowUp(
      leadName,
      service,
      businessName || 'Demo Roofing Co.',
      conversationHistory
    )

    return NextResponse.json({ message })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}