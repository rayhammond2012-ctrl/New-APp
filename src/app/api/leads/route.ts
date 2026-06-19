import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/getSupabase()'
import { sendSms } from '@/lib/twilio'

// Demo business (no auth yet)
const DEMO_BUSINESS = { id: 'demo-001', name: 'Demo Roofing Co.', phone: '+15551234567' }

// GET /api/leads — list all leads, or get a single lead by id
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      const { data: lead, error } = await getSupabase()
        .from('leads')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return NextResponse.json({ lead })
    }

    const { data: leads, error } = await getSupabase()
      .from('leads')
      .select('*')
      .eq('business_id', DEMO_BUSINESS.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ leads })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// POST /api/leads — create a new lead and send instant SMS
export async function POST(request: NextRequest) {
  try {
    const { name, phone, service } = await request.json()

    if (!name || !phone || !service) {
      return NextResponse.json(
        { error: 'Name, phone, and service are required' },
        { status: 400 }
      )
    }

    // Create the lead in Supabase
    const { data: lead, error } = await getSupabase()
      .from('leads')
      .insert({
        business_id: DEMO_BUSINESS.id,
        name,
        phone,
        service,
        status: 'new',
      })
      .select()
      .single()

    if (error) throw error

    // Send instant SMS response
    const instantMessage = `Hi ${name}, thanks for reaching out to ${DEMO_BUSINESS.name}. We're reviewing your request and will contact you shortly. Reply STOP to opt out.`
    await sendSms(phone, instantMessage)

    // Log the outbound text
    await getSupabase().from('texts').insert({
      lead_id: lead.id,
      direction: 'outbound',
      body: instantMessage,
    })

    return NextResponse.json({ lead }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH /api/leads — update lead status
export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      )
    }

    const validStatuses = ['new', 'contacted', 'booked', 'lost']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    const { data: lead, error } = await getSupabase()
      .from('leads')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ lead })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}