import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/texts?leadId=xxx — get message history for a lead
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('leadId')

    if (!leadId) {
      return NextResponse.json(
        { error: 'leadId query parameter is required' },
        { status: 400 }
      )
    }

    const { data: texts, error } = await supabase
      .from('texts')
      .select('*')
      .eq('lead_id', leadId)
      .order('sent_at', { ascending: true })

    if (error) throw error
    return NextResponse.json({ texts })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}