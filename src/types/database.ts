export interface FlowProfile {
  id: string;
  full_name: string | null;
  email?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FlowCompany {
  id: string;
  name: string;
  responsible_name: string | null;
  whatsapp: string | null;
  email: string | null;
  segment: string | null;
  primary_color: string | null;
  logo_url?: string | null;
  google_review_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface FlowCompanyMember {
  id: string;
  company_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | string;
  created_at?: string;
}

export interface FlowClient {
  id: string;
  company_id: string;
  name: string;
  phone: string;
  email: string | null;
  service_interest: string | null;
  notes: string | null;
  source: string;
  last_interaction_at: string | null;
  next_contact_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export type OpportunityStatus =
  | 'novo'
  | 'orcamento_enviado'
  | 'negociando'
  | 'fechado'
  | 'perdido';

export type OpportunityLostReason =
  | 'preco'
  | 'concorrente'
  | 'sem_resposta'
  | 'adiado'
  | 'outro';

export interface FlowOpportunity {
  id: string;
  company_id: string;
  client_id: string;
  title: string;
  service: string | null;
  estimated_value: number;
  status: OpportunityStatus;
  lost_reason: OpportunityLostReason | string | null;
  last_interaction_at: string | null;
  next_contact_at: string | null;
  closed_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // joined or populated client
  client?: FlowClient;
}

export type ActivityType =
  | 'cliente_criado'
  | 'oportunidade_criada'
  | 'contato_realizado'
  | 'venda_fechada'
  | 'venda_perdida'
  | 'nota'
  | string;

export interface FlowActivity {
  id: string;
  company_id: string;
  client_id: string | null;
  opportunity_id: string | null;
  activity_type: ActivityType;
  description: string;
  created_by: string | null;
  created_at: string;
}
