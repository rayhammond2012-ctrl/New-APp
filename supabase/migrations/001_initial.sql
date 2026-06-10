-- ReplyFlow Initial Schema
-- Creates businesses, leads, and texts tables with indexes and RLS policies.

-- ============================================================
-- UUID extension
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- Businesses table
-- ============================================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_businesses_phone ON businesses (phone);

-- ============================================================
-- Leads table
-- ============================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE texts ENABLE ROW LEVEL SECURITY;

-- For demo: allow the demo business to access its own data
-- In production, replace with auth.uid() checks
CREATE POLICY "Allow demo access to businesses"
  ON businesses FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow demo access to leads"
  ON leads FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow demo access to texts"
  ON texts FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- Seed demo business
-- ============================================================
INSERT INTO businesses (id, name, phone)
VALUES ('demo-001', 'Demo Roofing Co.', '+15551234567')
ON CONFLICT (id) DO NOTHING;