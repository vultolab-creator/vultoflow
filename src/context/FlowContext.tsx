import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Client,
  ClientStatus,
  CompanyProfile,
  Proposal,
  QuickMessageTemplate,
  TimelineEvent,
  LostReasonOption,
  LOST_REASON_MAP,
  REVERSE_LOST_REASON_MAP,
} from '../types';
import {
  FlowClient,
  FlowOpportunity,
  FlowActivity,
  OpportunityStatus,
  OpportunityLostReason,
} from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { useCompany } from './CompanyContext';
import {
  initialCompany,
  initialProposals,
  defaultTemplates,
} from '../data/mockData';
import { formatBRL, getAttentionReason } from '../utils/formatters';

interface FlowContextType {
  // Real Data
  clients: Client[];
  rawClients: FlowClient[];
  opportunities: FlowOpportunity[];
  activities: FlowActivity[];
  dataLoading: boolean;
  dataError: string | null;
  refreshData: () => Promise<void>;

  // Mocked for this step (proposals)
  proposals: Proposal[];
  company: CompanyProfile;
  templates: QuickMessageTemplate[];

  // Routing
  currentRoute: string;
  routeParams: Record<string, string>;
  navigateTo: (route: string) => void;

  // Drawer / Selection
  selectedClientId: string | null;
  selectedClient: Client | null;
  setSelectedClientId: (id: string | null) => void;

  // Modals
  callingClient: Client | null;
  setCallingClient: (client: Client | null) => void;
  closingClient: Client | null;
  setClosingClient: (client: Client | null) => void;
  closingOpportunity: FlowOpportunity | null;
  setClosingOpportunity: (opp: FlowOpportunity | null) => void;
  losingClient: Client | null;
  setLosingClient: (client: Client | null) => void;
  losingOpportunity: FlowOpportunity | null;
  setLosingOpportunity: (opp: FlowOpportunity | null) => void;

  isVultoModalOpen: boolean;
  setIsVultoModalOpen: (open: boolean) => void;
  isWhatsAppConnectModalOpen: boolean;
  setIsWhatsAppConnectModalOpen: (open: boolean) => void;
  isNewClientModalOpen: boolean;
  setIsNewClientModalOpen: (open: boolean) => void;
  isNewOpportunityModalOpen: boolean;
  setIsNewOpportunityModalOpen: (open: boolean) => void;
  newOpportunityTargetClientId: string | null;
  setNewOpportunityTargetClientId: (id: string | null) => void;

  // Real CRUD Actions
  addClient: (data: {
    name: string;
    phone: string;
    email?: string;
    service?: string;
    value?: number;
    notes?: string;
    nextContactAt?: string | null;
  }) => Promise<{ success: boolean; data?: FlowClient; error?: string }>;

  updateClient: (
    id: string,
    updates: Partial<FlowClient>
  ) => Promise<{ success: boolean; error?: string }>;

  deleteClient: (id: string) => Promise<{ success: boolean; error?: string }>;

  createOpportunity: (data: {
    client_id: string;
    title: string;
    service?: string;
    estimated_value: number;
    next_contact_at?: string | null;
  }) => Promise<{ success: boolean; data?: FlowOpportunity; error?: string }>;

  updateOpportunityStatus: (
    opportunityId: string,
    newStatus: OpportunityStatus,
    lostReason?: OpportunityLostReason | string
  ) => Promise<{ success: boolean; error?: string }>;

  changeClientStatus: (
    clientId: string,
    newStatus: ClientStatus,
    reason?: LostReasonOption | string
  ) => Promise<void>;

  setNextContact: (
    clientId: string,
    opportunityId: string | null,
    dateIso: string | null
  ) => Promise<{ success: boolean; error?: string }>;

  registerWhatsAppContact: (
    client: Client,
    opportunityId?: string | null,
    messageText?: string
  ) => Promise<void>;

  addTimelineNote: (clientId: string, note: string) => Promise<void>;

  openWhatsAppModal: (client: Client) => void;
  openCloseSaleModal: (client: Client, opportunity?: FlowOpportunity) => void;
  openLostSaleModal: (client: Client, opportunity?: FlowOpportunity) => void;
  openNewOpportunityModal: (clientId?: string | null) => void;

  // Real metrics calculated from Supabase
  metrics: {
    clientesParaChamar: Client[];
    clientesParaChamarCount: number;
    totalAttentionValue: number;
    novosContatosCount: number;
    emNegociacaoTotal: number;
    vendidosMesTotal: number;
    quantidadeVendas: number;
    ticketMedio: number;
    dynamicHeadline: string;
  };

  // Mocked actions for unchanged screens
  updateCompany: (profile: Partial<CompanyProfile>) => void;
  createProposal: (data: any) => Proposal;
  recordProposalView: (proposalId: string) => void;
  acceptProposal: (proposalId: string) => void;
}

const FlowContext = createContext<FlowContextType | undefined>(undefined);

export const FlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { company: dbCompany } = useCompany();

  // Supabase Data State
  const [rawClients, setRawClients] = useState<FlowClient[]>([]);
  const [opportunities, setOpportunities] = useState<FlowOpportunity[]>([]);
  const [activities, setActivities] = useState<FlowActivity[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Modals & UI Selection State
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [callingClient, setCallingClient] = useState<Client | null>(null);
  const [closingClient, setClosingClient] = useState<Client | null>(null);
  const [closingOpportunity, setClosingOpportunity] = useState<FlowOpportunity | null>(null);
  const [losingClient, setLosingClient] = useState<Client | null>(null);
  const [losingOpportunity, setLosingOpportunity] = useState<FlowOpportunity | null>(null);

  const [isVultoModalOpen, setIsVultoModalOpen] = useState(false);
  const [isWhatsAppConnectModalOpen, setIsWhatsAppConnectModalOpen] = useState(false);
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [isNewOpportunityModalOpen, setIsNewOpportunityModalOpen] = useState(false);
  const [newOpportunityTargetClientId, setNewOpportunityTargetClientId] = useState<string | null>(null);

  // Mocked state preserved for /orcamentos and /propostas
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    const saved = localStorage.getItem('vulto_flow_proposals');
    return saved ? JSON.parse(saved) : initialProposals;
  });
  const [templates] = useState<QuickMessageTemplate[]>(defaultTemplates);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>(() => {
    if (dbCompany) {
      return {
        name: dbCompany.name,
        representativeName: dbCompany.responsible_name || 'Responsável',
        phone: dbCompany.whatsapp || '',
        email: dbCompany.email || '',
        segment: dbCompany.segment || 'Serviços',
        brandColor: dbCompany.primary_color || '#C6FF00',
        logoUrl: dbCompany.logo_url || undefined,
        googleReviewUrl: dbCompany.google_review_url || 'https://g.page/r/review',
        whatsappConnected: false,
      };
    }
    return initialCompany;
  });

  // Sync dbCompany to companyProfile
  useEffect(() => {
    if (dbCompany) {
      setCompanyProfile({
        name: dbCompany.name,
        representativeName: dbCompany.responsible_name || 'Responsável',
        phone: dbCompany.whatsapp || '',
        email: dbCompany.email || '',
        segment: dbCompany.segment || 'Serviços',
        brandColor: dbCompany.primary_color || '#C6FF00',
        logoUrl: dbCompany.logo_url || undefined,
        googleReviewUrl: dbCompany.google_review_url || 'https://g.page/r/review',
        whatsappConnected: false,
      });
    }
  }, [dbCompany]);

  // SPA Routing
  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    if (path.startsWith('/p/')) return path;
    if (['/login', '/onboarding', '/clientes', '/vendas', '/orcamentos', '/propostas', '/configuracoes'].includes(path)) {
      return path;
    }
    return '/hoje';
  });
  const [routeParams, setRouteParams] = useState<Record<string, string>>({});

  const navigateTo = useCallback((route: string) => {
    if (route !== window.location.pathname) {
      window.history.pushState({}, '', route);
    }
    setCurrentRoute(route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentRoute(path || '/hoje');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (currentRoute.startsWith('/p/')) {
      const id = currentRoute.replace('/p/', '');
      setRouteParams({ proposalId: id });
    } else {
      setRouteParams({});
    }
  }, [currentRoute]);

  // =========================================================================
  // SUPABASE REAL DATA FETCHING
  // =========================================================================
  const fetchData = useCallback(async () => {
    if (!isSupabaseConfigured || !dbCompany?.id) {
      setDataLoading(false);
      return;
    }

    setDataLoading(true);
    setDataError(null);

    try {
      // 1. Fetch clients for active company
      const { data: clientsData, error: clientsErr } = await supabase
        .from('flow_clients')
        .select('*')
        .eq('company_id', dbCompany.id)
        .order('created_at', { ascending: false });

      if (clientsErr) {
        console.error('Erro ao carregar clientes:', clientsErr);
        setDataError('Não foi possível carregar seus clientes.');
      } else {
        setRawClients((clientsData as FlowClient[]) || []);
      }

      // 2. Fetch opportunities for active company
      const { data: oppsData, error: oppsErr } = await supabase
        .from('flow_opportunities')
        .select('*')
        .eq('company_id', dbCompany.id)
        .order('created_at', { ascending: false });

      if (oppsErr) {
        console.error('Erro ao carregar negociações:', oppsErr);
      } else {
        setOpportunities((oppsData as FlowOpportunity[]) || []);
      }

      // 3. Fetch activities for active company
      const { data: actData, error: actErr } = await supabase
        .from('flow_activities')
        .select('*')
        .eq('company_id', dbCompany.id)
        .order('created_at', { ascending: false });

      if (actErr) {
        console.error('Erro ao carregar atividades:', actErr);
      } else {
        setActivities((actData as FlowActivity[]) || []);
      }
    } catch (err) {
      console.error('Erro geral de conexão Supabase:', err);
      setDataError('Falha de comunicação com o servidor.');
    } finally {
      setDataLoading(false);
    }
  }, [dbCompany?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // =========================================================================
  // UNIFIED CLIENTS ADAPTER
  // Transforms rawClients + opportunities + activities into rich Client objects
  // =========================================================================
  const clients: Client[] = useMemo(() => {
    const now = new Date();

    return rawClients.map((rc) => {
      // Client's opportunities
      const clientOpps = opportunities.filter((o) => o.client_id === rc.id);
      
      // Determine primary opportunity (prefer open deals, else most recent)
      const openOpp = clientOpps.find(
        (o) => o.status === 'novo' || o.status === 'orcamento_enviado' || o.status === 'negociando'
      );
      const primaryOpp = openOpp || clientOpps[0];

      // Service and value
      const service = primaryOpp?.service || rc.service_interest || 'Serviço sob medida';
      const value = clientOpps.reduce((acc, curr) => acc + (Number(curr.estimated_value) || 0), 0);
      const status: ClientStatus = (primaryOpp?.status as ClientStatus) || 'novo';

      // Next contact and last interaction dates
      const nextContactAt = primaryOpp?.next_contact_at || rc.next_contact_at;
      const lastInteractionAt = primaryOpp?.last_interaction_at || rc.last_interaction_at || rc.created_at;

      // Last contact days ago calculation
      let lastContactDaysAgo = 0;
      let lastContactDate = 'Hoje';
      if (lastInteractionAt) {
        const lastDate = new Date(lastInteractionAt);
        const diffMs = now.getTime() - lastDate.getTime();
        lastContactDaysAgo = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
        if (lastContactDaysAgo === 0) lastContactDate = 'Hoje';
        else if (lastContactDaysAgo === 1) lastContactDate = 'Ontem';
        else lastContactDate = `há ${lastContactDaysAgo} dias`;
      }

      // Check if client needs attention:
      // "Um cliente precisa aparecer aqui quando possuir negociação aberta e: next_contact_at <= agora"
      // Or if no next_contact_at but it has been open for 3+ days
      const isOpenDeal = status === 'novo' || status === 'orcamento_enviado' || status === 'negociando';
      let needsAttention = false;
      let attentionReason = '';

      if (isOpenDeal) {
        if (nextContactAt) {
          const nextDate = new Date(nextContactAt);
          if (nextDate.getTime() <= now.getTime()) {
            needsAttention = true;
            attentionReason = getAttentionReason(nextContactAt, lastInteractionAt);
          }
        } else if (lastContactDaysAgo >= 3) {
          needsAttention = true;
          attentionReason = `Sem contato há ${lastContactDaysAgo} dias.`;
        }
      }

      // Timeline events from flow_activities
      const clientActivities = activities.filter((a) => a.client_id === rc.id);
      const timeline: TimelineEvent[] = clientActivities.map((act) => {
        const actDate = new Date(act.created_at);
        let timeLabel = actDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        let dateLabel = actDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
        
        let title = 'Atividade';
        switch (act.activity_type) {
          case 'cliente_criado':
            title = 'Cliente cadastrado';
            break;
          case 'oportunidade_criada':
            title = 'Negociação iniciada';
            break;
          case 'contato_realizado':
            title = 'Contato realizado no WhatsApp';
            break;
          case 'venda_fechada':
            title = 'Venda fechada 🎉';
            break;
          case 'venda_perdida':
            title = 'Venda perdida';
            break;
          case 'nota':
            title = 'Anotação interna';
            break;
          default:
            title = act.activity_type;
        }

        return {
          id: act.id,
          date: dateLabel,
          time: timeLabel,
          timestamp: actDate.getTime(),
          title,
          description: act.description,
          type: (act.activity_type as any) || 'nota',
        };
      });

      return {
        id: rc.id,
        name: rc.name,
        phone: rc.phone,
        email: rc.email,
        service,
        value,
        status,
        lastContactDaysAgo,
        lastContactDate,
        needsAttention,
        attentionReason,
        notes: rc.notes,
        lostReason: primaryOpp?.lost_reason
          ? REVERSE_LOST_REASON_MAP[primaryOpp.lost_reason as OpportunityLostReason] || String(primaryOpp.lost_reason)
          : undefined,
        nextContactAt,
        lastInteractionAt,
        createdAt: rc.created_at,
        timeline,
        opportunities: clientOpps,
        primaryOpportunityId: primaryOpp?.id,
        rawClient: rc,
      };
    });
  }, [rawClients, opportunities, activities]);

  // Selected client memoized
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // =========================================================================
  // METRICS (100% REAL FROM DATABASE)
  // =========================================================================
  const metrics = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const last24hMs = now.getTime() - 24 * 60 * 60 * 1000;

    // 1. Clientes para chamar:
    // "Um cliente precisa aparecer aqui quando possuir negociação aberta e: next_contact_at <= agora"
    // Ordenar os mais atrasados primeiro.
    const clientesParaChamar = clients
      .filter((c) => c.needsAttention)
      .sort((a, b) => {
        const timeA = a.nextContactAt ? new Date(a.nextContactAt).getTime() : 0;
        const timeB = b.nextContactAt ? new Date(b.nextContactAt).getTime() : 0;
        return timeA - timeB; // smaller timestamp = older / more delayed
      });

    // Total value in attention
    const totalAttentionValue = clientesParaChamar.reduce((acc, c) => acc + (c.value || 0), 0);

    // 2. Novos contatos (criados nas últimas 24h)
    const novosContatosCount = rawClients.filter((rc) => {
      const createdTime = new Date(rc.created_at).getTime();
      return createdTime >= last24hMs;
    }).length;

    // 3. Em negociação:
    // Somar estimated_value onde status em: novo, orcamento_enviado, negociando
    const emNegociacaoTotal = opportunities
      .filter((o) => o.status === 'novo' || o.status === 'orcamento_enviado' || o.status === 'negociando')
      .reduce((acc, o) => acc + (Number(o.estimated_value) || 0), 0);

    // 4. Vendidos este mês:
    // Somar estimated_value onde status = fechado e closed_at dentro do mês atual
    const vendasFechadasMes = opportunities.filter((o) => {
      if (o.status !== 'fechado') return false;
      const closedDate = o.closed_at ? new Date(o.closed_at) : new Date(o.updated_at);
      return closedDate.getMonth() === currentMonth && closedDate.getFullYear() === currentYear;
    });

    const vendidosMesTotal = vendasFechadasMes.reduce(
      (acc, o) => acc + (Number(o.estimated_value) || 0),
      0
    );
    const quantidadeVendas = vendasFechadasMes.length;
    const ticketMedio = quantidadeVendas > 0 ? Math.round(vendidosMesTotal / quantidadeVendas) : 0;

    // Dynamic Headline:
    // "Você tem X clientes para chamar hoje, representando R$ Y em negociações."
    // Se não existir ninguém: "Tudo em dia. Nenhum cliente precisa de retorno agora."
    let dynamicHeadline = 'Tudo em dia. Nenhum cliente precisa de retorno agora.';
    if (clientesParaChamar.length > 0) {
      dynamicHeadline = `Você tem ${clientesParaChamar.length} ${
        clientesParaChamar.length === 1 ? 'cliente' : 'clientes'
      } para chamar hoje, representando ${formatBRL(totalAttentionValue)} em negociações.`;
    }

    return {
      clientesParaChamar,
      clientesParaChamarCount: clientesParaChamar.length,
      totalAttentionValue,
      novosContatosCount,
      emNegociacaoTotal,
      vendidosMesTotal,
      quantidadeVendas,
      ticketMedio,
      dynamicHeadline,
    };
  }, [clients, rawClients, opportunities]);

  // =========================================================================
  // SUPABASE REAL MUTATIONS
  // =========================================================================

  // 1. ADD CLIENT & OPTIONAL INITIAL OPPORTUNITY
  const addClient = async (data: {
    name: string;
    phone: string;
    email?: string;
    service?: string;
    value?: number;
    notes?: string;
    nextContactAt?: string | null;
  }): Promise<{ success: boolean; data?: FlowClient; error?: string }> => {
    if (!isSupabaseConfigured || !dbCompany?.id || !user?.id) {
      return { success: false, error: 'Sessão expirada ou empresa não selecionada.' };
    }

    try {
      // Insert into flow_clients
      const { data: newClient, error: clientErr } = await supabase
        .from('flow_clients')
        .insert({
          company_id: dbCompany.id,
          name: data.name.trim(),
          phone: data.phone.trim(),
          email: data.email?.trim() || null,
          service_interest: data.service?.trim() || null,
          notes: data.notes?.trim() || null,
          source: 'manual',
          next_contact_at: data.nextContactAt || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (clientErr || !newClient) {
        console.error('Erro ao inserir cliente:', clientErr);
        return { success: false, error: 'Não conseguimos salvar agora. Tente novamente.' };
      }

      // Insert activity: cliente_criado
      await supabase.from('flow_activities').insert({
        company_id: dbCompany.id,
        client_id: newClient.id,
        activity_type: 'cliente_criado',
        description: 'Cliente cadastrado manualmente.',
        created_by: user.id,
      });

      // If service or estimated value was provided, create initial opportunity
      if (data.service?.trim() || (data.value && data.value > 0)) {
        const { data: newOpp } = await supabase
          .from('flow_opportunities')
          .insert({
            company_id: dbCompany.id,
            client_id: newClient.id,
            title: data.service?.trim() || 'Nova negociação',
            service: data.service?.trim() || null,
            estimated_value: data.value || 0,
            status: 'novo',
            next_contact_at: data.nextContactAt || null,
            created_by: user.id,
          })
          .select()
          .single();

        if (newOpp) {
          await supabase.from('flow_activities').insert({
            company_id: dbCompany.id,
            client_id: newClient.id,
            opportunity_id: newOpp.id,
            activity_type: 'oportunidade_criada',
            description: `Negociação criada: ${data.service?.trim() || 'Nova negociação'} (${formatBRL(data.value || 0)})`,
            created_by: user.id,
          });
        }
      }

      // Refresh data
      await fetchData();
      return { success: true, data: newClient as FlowClient };
    } catch (err) {
      console.error('Falha ao adicionar cliente:', err);
      return { success: false, error: 'Erro de comunicação ao salvar cliente.' };
    }
  };

  // 2. UPDATE CLIENT
  const updateClient = async (
    id: string,
    updates: Partial<FlowClient>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !dbCompany?.id) {
      return { success: false, error: 'Configuração do Supabase pendente.' };
    }

    try {
      // Prevent updating company_id
      const safeUpdates = {
        name: updates.name,
        phone: updates.phone,
        email: updates.email,
        service_interest: updates.service_interest,
        notes: updates.notes,
        next_contact_at: updates.next_contact_at,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('flow_clients')
        .update(safeUpdates)
        .eq('id', id)
        .eq('company_id', dbCompany.id);

      if (error) {
        console.error('Erro ao atualizar cliente:', error);
        return { success: false, error: 'Não foi possível atualizar o cliente.' };
      }

      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Erro de conexão ao salvar alterações.' };
    }
  };

  // 3. DELETE CLIENT
  const deleteClient = async (id: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !dbCompany?.id) {
      return { success: false, error: 'Configuração do Supabase pendente.' };
    }

    try {
      // Delete activities & opportunities first to guarantee no orphan constraints
      await supabase.from('flow_activities').delete().eq('client_id', id).eq('company_id', dbCompany.id);
      await supabase.from('flow_opportunities').delete().eq('client_id', id).eq('company_id', dbCompany.id);
      
      const { error } = await supabase
        .from('flow_clients')
        .delete()
        .eq('id', id)
        .eq('company_id', dbCompany.id);

      if (error) {
        console.error('Erro ao excluir cliente:', error);
        return { success: false, error: 'Não foi possível excluir o cliente.' };
      }

      if (selectedClientId === id) {
        setSelectedClientId(null);
      }

      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Erro ao processar exclusão.' };
    }
  };

  // 4. CREATE OPPORTUNITY
  const createOpportunity = async (data: {
    client_id: string;
    title: string;
    service?: string;
    estimated_value: number;
    next_contact_at?: string | null;
  }): Promise<{ success: boolean; data?: FlowOpportunity; error?: string }> => {
    if (!isSupabaseConfigured || !dbCompany?.id || !user?.id) {
      return { success: false, error: 'Sessão expirada ou empresa não selecionada.' };
    }

    try {
      const { data: newOpp, error: oppErr } = await supabase
        .from('flow_opportunities')
        .insert({
          company_id: dbCompany.id,
          client_id: data.client_id,
          title: data.title.trim(),
          service: data.service?.trim() || null,
          estimated_value: data.estimated_value || 0,
          status: 'novo',
          next_contact_at: data.next_contact_at || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (oppErr || !newOpp) {
        console.error('Erro ao criar oportunidade:', oppErr);
        return { success: false, error: 'Não conseguimos salvar a negociação.' };
      }

      // Activity: oportunidade_criada
      await supabase.from('flow_activities').insert({
        company_id: dbCompany.id,
        client_id: data.client_id,
        opportunity_id: newOpp.id,
        activity_type: 'oportunidade_criada',
        description: `Negociação criada: ${data.title.trim()} (${formatBRL(data.estimated_value || 0)})`,
        created_by: user.id,
      });

      await fetchData();
      return { success: true, data: newOpp as FlowOpportunity };
    } catch (err) {
      return { success: false, error: 'Erro de comunicação ao criar negociação.' };
    }
  };

  // 5. UPDATE OPPORTUNITY STATUS (KANBAN & MODALS)
  const updateOpportunityStatus = async (
    opportunityId: string,
    newStatus: OpportunityStatus,
    lostReason?: OpportunityLostReason | string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !dbCompany?.id || !user?.id) {
      return { success: false, error: 'Configuração do Supabase pendente.' };
    }

    const prevOpps = [...opportunities];
    const targetOpp = opportunities.find((o) => o.id === opportunityId);
    if (!targetOpp) return { success: false, error: 'Negociação não encontrada.' };

    const isClosed = newStatus === 'fechado';
    const isLost = newStatus === 'perdido';
    const nowIso = new Date().toISOString();

    // Optimistic local update
    setOpportunities((prev) =>
      prev.map((o) =>
        o.id === opportunityId
          ? {
              ...o,
              status: newStatus,
              lost_reason: isLost ? (lostReason || null) : null,
              closed_at: isClosed || isLost ? nowIso : null,
              updated_at: nowIso,
            }
          : o
      )
    );

    try {
      const updatePayload: Record<string, any> = {
        status: newStatus,
        lost_reason: isLost ? (lostReason || null) : null,
        closed_at: isClosed || isLost ? nowIso : null,
        updated_at: nowIso,
      };

      const { error } = await supabase
        .from('flow_opportunities')
        .update(updatePayload)
        .eq('id', opportunityId)
        .eq('company_id', dbCompany.id);

      if (error) {
        console.error('Erro ao atualizar status da oportunidade:', error);
        // Rollback
        setOpportunities(prevOpps);
        return { success: false, error: 'Não foi possível mover a negociação.' };
      }

      // Record activity in flow_activities
      let actType = 'oportunidade_status';
      let actDesc = `Status alterado para ${newStatus}`;

      if (isClosed) {
        actType = 'venda_fechada';
        actDesc = `Venda fechada 🎉 no valor de ${formatBRL(targetOpp.estimated_value)}`;
      } else if (isLost) {
        actType = 'venda_perdida';
        const reasonLabel = lostReason ? ` (Motivo: ${lostReason})` : '';
        actDesc = `Venda perdida${reasonLabel}`;
      }

      await supabase.from('flow_activities').insert({
        company_id: dbCompany.id,
        client_id: targetOpp.client_id,
        opportunity_id: targetOpp.id,
        activity_type: actType,
        description: actDesc,
        created_by: user.id,
      });

      // Refetch to sync timestamps
      await fetchData();
      return { success: true };
    } catch (err) {
      setOpportunities(prevOpps);
      return { success: false, error: 'Falha ao salvar status.' };
    }
  };

  // Helper bridging client-level status change to its opportunity
  const changeClientStatus = async (
    clientId: string,
    newStatus: ClientStatus,
    reason?: LostReasonOption | string
  ): Promise<void> => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    let targetOpp = opportunities.find(
      (o) => o.client_id === clientId && (o.status === 'novo' || o.status === 'orcamento_enviado' || o.status === 'negociando')
    ) || opportunities.find((o) => o.client_id === clientId);

    // If client has no opportunity yet, create one first
    if (!targetOpp) {
      const created = await createOpportunity({
        client_id: clientId,
        title: client.service || 'Negociação',
        service: client.service,
        estimated_value: client.value || 0,
      });
      targetOpp = created.data;
    }

    if (targetOpp) {
      let mappedReason: OpportunityLostReason | string | undefined = undefined;
      if (newStatus === 'perdido') {
        mappedReason = (LOST_REASON_MAP as any)[reason as string] || reason || 'outro';
      }
      await updateOpportunityStatus(targetOpp.id, newStatus, mappedReason);
    }
  };

  // 6. PRÓXIMO CONTATO & RESCHEDULING
  const setNextContact = async (
    clientId: string,
    opportunityId: string | null,
    dateIso: string | null
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !dbCompany?.id || !user?.id) {
      return { success: false, error: 'Supabase desconectado.' };
    }

    try {
      // Update client
      await supabase
        .from('flow_clients')
        .update({
          next_contact_at: dateIso,
          updated_at: new Date().toISOString(),
        })
        .eq('id', clientId)
        .eq('company_id', dbCompany.id);

      // Update opportunity if provided
      if (opportunityId) {
        await supabase
          .from('flow_opportunities')
          .update({
            next_contact_at: dateIso,
            updated_at: new Date().toISOString(),
          })
          .eq('id', opportunityId)
          .eq('company_id', dbCompany.id);
      }

      // Activity
      if (dateIso) {
        const dateFormatted = new Date(dateIso).toLocaleDateString('pt-BR');
        await supabase.from('flow_activities').insert({
          company_id: dbCompany.id,
          client_id: clientId,
          opportunity_id: opportunityId || null,
          activity_type: 'contato_realizado',
          description: `Próximo contato agendado para ${dateFormatted}`,
          created_by: user.id,
        });
      }

      await fetchData();
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Falha ao agendar próximo contato.' };
    }
  };

  // 7. REGISTER WHATSAPP CONTACT ACTION
  const registerWhatsAppContact = async (
    client: Client,
    opportunityId?: string | null,
    messageText?: string
  ): Promise<void> => {
    if (!isSupabaseConfigured || !dbCompany?.id || !user?.id) return;

    const nowIso = new Date().toISOString();

    try {
      // Update last_interaction_at on client
      await supabase
        .from('flow_clients')
        .update({
          last_interaction_at: nowIso,
          updated_at: nowIso,
        })
        .eq('id', client.id)
        .eq('company_id', dbCompany.id);

      // Update opportunity if exists
      const oppId = opportunityId || client.primaryOpportunityId;
      if (oppId) {
        await supabase
          .from('flow_opportunities')
          .update({
            last_interaction_at: nowIso,
            updated_at: nowIso,
          })
          .eq('id', oppId)
          .eq('company_id', dbCompany.id);
      }

      // Record activity: contato_realizado
      await supabase.from('flow_activities').insert({
        company_id: dbCompany.id,
        client_id: client.id,
        opportunity_id: oppId || null,
        activity_type: 'contato_realizado',
        description: messageText
          ? `Mensagem WhatsApp enviada: "${messageText.slice(0, 60)}..."`
          : 'Contato realizado via WhatsApp.',
        created_by: user.id,
      });

      await fetchData();
    } catch (err) {
      console.error('Erro ao registrar contato:', err);
    }
  };

  // 8. ADD ACTIVITY NOTE
  const addTimelineNote = async (clientId: string, note: string): Promise<void> => {
    if (!isSupabaseConfigured || !dbCompany?.id || !user?.id || !note.trim()) return;

    try {
      await supabase.from('flow_activities').insert({
        company_id: dbCompany.id,
        client_id: clientId,
        activity_type: 'nota',
        description: note.trim(),
        created_by: user.id,
      });

      await fetchData();
    } catch (err) {
      console.error('Erro ao adicionar anotação:', err);
    }
  };

  // =========================================================================
  // MODAL CONTROLLERS
  // =========================================================================
  const openWhatsAppModal = (client: Client) => {
    setCallingClient(client);
  };

  const openCloseSaleModal = (client: Client, opportunity?: FlowOpportunity) => {
    setClosingClient(client);
    setClosingOpportunity(opportunity || client.opportunities?.[0] || null);
  };

  const openLostSaleModal = (client: Client, opportunity?: FlowOpportunity) => {
    setLosingClient(client);
    setLosingOpportunity(opportunity || client.opportunities?.[0] || null);
  };

  const openNewOpportunityModal = (clientId?: string | null) => {
    setNewOpportunityTargetClientId(clientId || null);
    setIsNewOpportunityModalOpen(true);
  };

  // =========================================================================
  // MOCKED PROPOSALS / COMPANY METHODS PRESERVED
  // =========================================================================
  const updateCompany = (profile: Partial<CompanyProfile>) => {
    setCompanyProfile((prev) => ({ ...prev, ...profile }));
  };

  const createProposal = (proposalData: any): Proposal => {
    const newId = `prop-${Date.now()}`;
    const newProp: Proposal = {
      ...proposalData,
      id: newId,
      code: `PROP-${1000 + proposals.length + 1}`,
      createdAt: new Date().toISOString(),
      viewCount: 0,
      status: 'enviada',
    };
    const updated = [newProp, ...proposals];
    setProposals(updated);
    localStorage.setItem('vulto_flow_proposals', JSON.stringify(updated));
    return newProp;
  };

  const recordProposalView = (proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            viewCount: p.viewCount + 1,
            lastViewedAt: 'Agora há pouco',
            status: p.status === 'enviada' ? 'visualizada' : p.status,
          };
        }
        return p;
      })
    );
  };

  const acceptProposal = (proposalId: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === proposalId ? { ...p, status: 'aceita' } : p))
    );
  };

  return (
    <FlowContext.Provider
      value={{
        clients,
        rawClients,
        opportunities,
        activities,
        dataLoading,
        dataError,
        refreshData: fetchData,

        proposals,
        company: companyProfile,
        templates,

        currentRoute,
        routeParams,
        navigateTo,

        selectedClientId,
        selectedClient,
        setSelectedClientId,

        callingClient,
        setCallingClient,
        closingClient,
        setClosingClient,
        closingOpportunity,
        setClosingOpportunity,
        losingClient,
        setLosingClient,
        losingOpportunity,
        setLosingOpportunity,

        isVultoModalOpen,
        setIsVultoModalOpen,
        isWhatsAppConnectModalOpen,
        setIsWhatsAppConnectModalOpen,
        isNewClientModalOpen,
        setIsNewClientModalOpen,
        isNewOpportunityModalOpen,
        setIsNewOpportunityModalOpen,
        newOpportunityTargetClientId,
        setNewOpportunityTargetClientId,

        addClient,
        updateClient,
        deleteClient,
        createOpportunity,
        updateOpportunityStatus,
        changeClientStatus,
        setNextContact,
        registerWhatsAppContact,
        addTimelineNote,

        openWhatsAppModal,
        openCloseSaleModal,
        openLostSaleModal,
        openNewOpportunityModal,

        metrics,

        updateCompany,
        createProposal,
        recordProposalView,
        acceptProposal,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
};

export const useFlow = (): FlowContextType => {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
};
