-- ReplyFlow Initial Schema
-- Creates businesses, leads, and texts tables with indexes and RLS policies.

-- ============================================================
-- UUID extension (if not already enabled)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Businesses table
-- ============================================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_phone ON businesses (phone);

-- ============================================================
-- Leads table
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'booked', 'lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_leads_business_id ON leads (business_id);
CREATE INDEX idx_leads_status ON leads (status);
CREATE INDEX idx_leads_phone ON leads (phone);
CREATE INDEX idx_leads_created_at ON leads (created_at DESC);

-- ============================================================
-- Texts table (message history)
-- ============================================================
CREATE TABLE IF NOT EXISTS texts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('outbound', 'inbound')),
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_texts_lead_id ON texts (lead_id);
CREATE INDEX idx_texts_sent_at ON texts (sent_at ASC);

-- ============================================================
-- Auto-update updated_at on leads
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Row-Level Security (RLS) Policies
-- ============================================================

-- Businesses: enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own business
CREATE POLICY "Users can view their own business"
  ON businesses
  FOR SELECT
  USING (auth.uid() = id);

-- Leads: enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read leads belonging to their business
CREATE POLICY "Users can view leads for their business"
  ON leads
  FOR SELECT
  USING (auth.uid() = business_id);

-- Allow authenticated users to insert leads for their business
CREATE POLICY "Users can insert leads for their business"
  ON leads
  FOR INSERT
  WITH CHECK (auth.uid() = business_id);

-- Allow authenticated users to update leads for their business
CREATE POLICY "Users can update leads for their business"
  ON leads
  FOR UPDATE
  USING (auth.uid() = business_id);

-- Texts: enable RLS
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read texts for their leads
CREATE POLICY "Users can view texts for their leads"
  ON texts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = texts.lead_id
      AND leads.business_id = auth.uid()
    )
  );

-- Allow authenticated users to insert texts for their leads
CREATE POLICY "Users can insert texts for their leads"
  ON texts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads
      WHERE leads.id = texts.lead_id
      AND leads.business_id = auth.uid()
    )
  );

-- ============================================================
-- Seed demo business (used by the app in development)
-- ============================================================
INSERT INTO businesses (id, name, phone)
VALUES ('demo-001', 'Demo Roofing Co.', '+15551234567')
ON CONFLICT (id) DO NOTHING;