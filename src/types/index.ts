import { FlowClient, FlowOpportunity, FlowActivity, OpportunityStatus, OpportunityLostReason } from './database';

export type ClientStatus =
  | 'novo'
  | 'orcamento_enviado'
  | 'negociando'
  | 'fechado'
  | 'perdido';

export type TimelineEventType =
  | 'novo'
  | 'orcamento'
  | 'proposta_vista'
  | 'whatsapp'
  | 'fechado'
  | 'perdido'
  | 'nota'
  | 'contato_realizado'
  | 'oportunidade_criada'
  | 'cliente_criado'
  | 'venda_fechada'
  | 'venda_perdida';

export interface TimelineEvent {
  id: string;
  date: string;
  time?: string;
  timestamp: number;
  title: string;
  description?: string;
  type: TimelineEventType;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  service: string;
  value: number;
  status: ClientStatus;
  lastContactDaysAgo: number;
  lastContactDate: string;
  needsAttention: boolean;
  attentionReason?: string;
  notes?: string | null;
  lostReason?: string | null;
  nextContactAt?: string | null;
  lastInteractionAt?: string | null;
  createdAt?: string;
  timeline: TimelineEvent[];
  opportunities?: FlowOpportunity[];
  primaryOpportunityId?: string;
  proposalId?: string;
  proposalViews?: number;
  rawClient?: FlowClient;
}

export interface ProposalItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type ProposalStatus =
  | 'rascunho'
  | 'enviada'
  | 'visualizada'
  | 'aceita'
  | 'recusada';

export interface Proposal {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  service: string;
  description: string;
  items: ProposalItem[];
  totalValue: number;
  paymentTerms: string;
  deadlineDays: string;
  validityDays: string;
  notes?: string;
  status: ProposalStatus;
  viewCount: number;
  lastViewedAt?: string;
  createdAt: string;
}

export interface CompanyProfile {
  name: string;
  representativeName: string;
  phone: string;
  email: string;
  segment: string;
  brandColor: string;
  logoUrl?: string;
  googleReviewUrl: string;
  whatsappConnected: boolean;
}

export type LostReasonOption =
  | 'Preço'
  | 'Escolheu concorrente'
  | 'Parou de responder'
  | 'Adiou o projeto'
  | 'Outro';

export const LOST_REASON_MAP: Record<LostReasonOption, OpportunityLostReason> = {
  'Preço': 'preco',
  'Escolheu concorrente': 'concorrente',
  'Parou de responder': 'sem_resposta',
  'Adiou o projeto': 'adiado',
  'Outro': 'outro',
};

export const REVERSE_LOST_REASON_MAP: Record<OpportunityLostReason, LostReasonOption> = {
  preco: 'Preço',
  concorrente: 'Escolheu concorrente',
  sem_resposta: 'Parou de responder',
  adiado: 'Adiou o projeto',
  outro: 'Outro',
};

export interface QuickMessageTemplate {
  id: string;
  title: string;
  type: 'curta' | 'consultiva';
  template: string;
}

export * from './database';
