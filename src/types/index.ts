// Database type definitions for ReplyFlow

export interface Business {
  id: string;
  name: string;
  phone: string;
  created_at: string;
}

export type LeadStatus = 'new' | 'contacted' | 'booked' | 'lost';

export interface Lead {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  service: string;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface Text {
  id: string;
  lead_id: string;
  direction: 'outbound' | 'inbound';
  body: string;
  sent_at: string;
}

// Form input type for new leads
export interface NewLeadInput {
  name: string;
  phone: string;
  service: string;
}