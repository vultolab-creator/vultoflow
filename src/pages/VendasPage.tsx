import React, { useState } from 'react';
import {
  Kanban as KanbanIcon,
  MessageSquare,
  Plus,
  ArrowRight,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { formatBRL } from '../utils/formatters';
import { OpportunityStatus, FlowOpportunity } from '../types/database';
import { NewActionDropdown } from '../components/common/NewActionDropdown';

interface ColumnDef {
  id: OpportunityStatus;
  title: string;
  color: string;
}

const COLUMNS: ColumnDef[] = [
  { id: 'novo', title: 'NOVOS', color: 'border-[#262626] text-white' },
  {
    id: 'orcamento_enviado',
    title: 'ORÇAMENTO ENVIADO',
    color: 'border-[#262626] text-white',
  },
  {
    id: 'negociando',
    title: 'NEGOCIANDO',
    color: 'border-[#262626] text-white',
  },
  {
    id: 'fechado',
    title: 'FECHADOS',
    color: 'border-[#C6FF00]/30 text-[#C6FF00]',
  },
  {
    id: 'perdido',
    title: 'PERDIDOS',
    color: 'border-[#262626] text-[#8E8E93]',
  },
];

export const VendasPage: React.FC = () => {
  const {
    opportunities,
    clients,
    dataLoading,
    setSelectedClientId,
    openWhatsAppModal,
    openCloseSaleModal,
    openLostSaleModal,
    updateOpportunityStatus,
    openNewOpportunityModal,
  } = useFlow();

  const [draggedOppId, setDraggedOppId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleDragStart = (oppId: string) => {
    setDraggedOppId(oppId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetStatus: OpportunityStatus) => {
    if (!draggedOppId) return;
    const opp = opportunities.find((o) => o.id === draggedOppId);
    if (!opp || opp.status === targetStatus) {
      setDraggedOppId(null);
      return;
    }

    const client = clients.find((c) => c.id === opp.client_id) || {
      id: opp.client_id,
      name: opp.title,
      phone: '',
      service: opp.service || 'Serviço',
      value: opp.estimated_value,
      status: targetStatus,
      lastContactDaysAgo: 0,
      lastContactDate: 'Hoje',
      needsAttention: false,
      timeline: [],
    };

    if (targetStatus === 'fechado') {
      openCloseSaleModal(client, opp);
    } else if (targetStatus === 'perdido') {
      openLostSaleModal(client, opp);
    } else {
      setActionError(null);
      const res = await updateOpportunityStatus(opp.id, targetStatus);
      if (!res.success) {
        setActionError(res.error || 'Não foi possível mover a negociação.');
        setTimeout(() => setActionError(null), 3500);
      }
    }

    setDraggedOppId(null);
  };

  const getNextStatus = (current: OpportunityStatus): OpportunityStatus | null => {
    switch (current) {
      case 'novo':
        return 'orcamento_enviado';
      case 'orcamento_enviado':
        return 'negociando';
      case 'negociando':
        return 'fechado';
      default:
        return null;
    }
  };

  const handleAdvance = async (opp: FlowOpportunity, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = getNextStatus(opp.status);
    if (!next) return;

    const client = clients.find((c) => c.id === opp.client_id) || {
      id: opp.client_id,
      name: opp.title,
      phone: '',
      service: opp.service || 'Serviço',
      value: opp.estimated_value,
      status: next,
      lastContactDaysAgo: 0,
      lastContactDate: 'Hoje',
      needsAttention: false,
      timeline: [],
    };

    if (next === 'fechado') {
      openCloseSaleModal(client, opp);
    } else {
      setActionError(null);
      const res = await updateOpportunityStatus(opp.id, next);
      if (!res.success) {
        setActionError(res.error || 'Não foi possível avançar a negociação.');
        setTimeout(() => setActionError(null), 3500);
      }
    }
  };

  // Loading Skeleton
  if (dataLoading) {
    return (
      <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#1C1C1C]">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-[#1A1A1A] rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-[#141414] rounded-md animate-pulse" />
          </div>
        </div>
        <div className="flex items-start gap-3 h-full">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex-1 min-w-[200px] h-96 bg-[#121212] border border-[#1E1E1E] rounded-xl p-3 space-y-3">
              <div className="h-5 bg-[#181818] rounded-md animate-pulse" />
              <div className="h-20 bg-[#161616] rounded-lg animate-pulse" />
              <div className="h-20 bg-[#161616] rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Global Empty State when no opportunities exist
  const hasNoOpportunities = opportunities.length === 0;

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 overflow-hidden">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Vendas
          </h1>
          <p className="text-sm text-[#8E8E93]">
            Acompanhe o andamento das negociações sem jargões complicados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <NewActionDropdown />
        </div>
      </div>

      {actionError && (
        <div className="p-3 bg-red-950/30 border border-red-800/40 text-xs text-red-300 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Global Empty State Banner */}
      {hasNoOpportunities ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-[#222222] rounded-2xl bg-[#0F0F0F] text-center max-w-md mx-auto my-12 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C6FF00]/10 border border-[#C6FF00]/20 flex items-center justify-center text-[#C6FF00]">
            <KanbanIcon className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Nenhuma negociação em andamento.
            </h3>
            <p className="text-xs text-[#8E8E93]">
              Crie uma nova oportunidade ou cadastre um contato para começar a vender.
            </p>
          </div>
          <button
            type="button"
            onClick={() => openNewOpportunityModal()}
            className="py-2.5 px-5 bg-[#C6FF00] hover:bg-[#b2e600] active:scale-[0.98] text-black font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            + NOVA NEGOCIAÇÃO
          </button>
        </div>
      ) : (
        /* Board Columns Scroll Container */
        <div className="flex-1 overflow-x-auto pb-3 scrollbar-thin">
          <div className="flex items-start gap-2.5 sm:gap-3 lg:gap-3.5 min-w-[980px] xl:min-w-0 h-full">
            {COLUMNS.map((col) => {
              const columnOpps = opportunities.filter((o) => o.status === col.id);
              const totalValue = columnOpps.reduce(
                (acc, o) => acc + (Number(o.estimated_value) || 0),
                0
              );

              return (
                <div
                  key={col.id}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(col.id)}
                  className="flex-1 min-w-[195px] bg-[#121212] border border-[#222222] rounded-xl flex flex-col max-h-full transition-colors"
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-[#1C1C1C] flex items-center justify-between bg-[#151515] rounded-t-xl gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] sm:text-[11px] font-extrabold text-white tracking-wider truncate">
                        {col.title}
                      </span>
                      <span className="text-[10px] font-mono text-[#8E8E93] bg-[#222222] px-1.5 py-0.5 rounded shrink-0">
                        {columnOpps.length}
                      </span>
                    </div>
                    <div className="text-[11px] sm:text-xs font-mono font-bold text-[#8E8E93] tabular-nums shrink-0">
                      {formatBRL(totalValue)}
                    </div>
                  </div>

                  {/* Column Card List */}
                  <div className="p-2 sm:p-2.5 space-y-2 overflow-y-auto flex-1 min-h-[160px]">
                    {columnOpps.length === 0 ? (
                      <div className="h-24 border border-dashed border-[#222222] rounded-lg flex items-center justify-center text-center p-2.5">
                        <span className="text-[11px] text-[#555555]">
                          Arraste negociações aqui
                        </span>
                      </div>
                    ) : (
                      columnOpps.map((opp) => {
                        const nextStatus = getNextStatus(opp.status);
                        const client = clients.find((c) => c.id === opp.client_id);
                        const clientName = client?.name || opp.title;
                        const clientPhone = client?.phone || '';

                        // Days since last interaction
                        let diffDays = 0;
                        if (opp.last_interaction_at || opp.created_at) {
                          const date = new Date(opp.last_interaction_at || opp.created_at);
                          diffDays = Math.max(
                            0,
                            Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
                          );
                        }

                        return (
                          <div
                            key={opp.id}
                            draggable
                            onDragStart={() => handleDragStart(opp.id)}
                            onClick={() => {
                              if (client) setSelectedClientId(client.id);
                            }}
                            className="p-3 rounded-lg bg-[#181818] border border-[#262626] hover:border-[#383838] transition-all cursor-grab active:cursor-grabbing shadow-xs space-y-2 group"
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="text-xs font-bold text-white group-hover:text-[#C6FF00] transition-colors truncate">
                                {clientName}
                              </span>
                              <span className="text-xs font-bold text-white font-mono tabular-nums shrink-0">
                                {formatBRL(opp.estimated_value)}
                              </span>
                            </div>

                            <p className="text-[11px] text-[#8E8E93] truncate">
                              {opp.service || opp.title}
                            </p>

                            {opp.lost_reason && (
                              <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded block">
                                Motivo: {opp.lost_reason}
                              </span>
                            )}

                            {/* Time & Quick actions */}
                            <div className="pt-2 border-t border-[#222222] flex items-center justify-between text-[11px] text-[#8E8E93]">
                              <div className="flex items-center gap-1 font-mono text-[10px]">
                                <Clock className="w-3 h-3 text-[#666666]" />
                                <span>{diffDays === 0 ? 'Hoje' : `${diffDays}d`}</span>
                              </div>

                              <div
                                className="flex items-center gap-1"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {client && (
                                  <button
                                    type="button"
                                    onClick={() => openWhatsAppModal(client)}
                                    className="p-1 rounded bg-[#222222] hover:bg-[#C6FF00] hover:text-black text-[#C6FF00] transition-colors cursor-pointer"
                                    title="Chamar no WhatsApp"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                  </button>
                                )}

                                {nextStatus && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleAdvance(opp, e)}
                                    className="p-1 rounded bg-[#222222] hover:bg-[#333333] text-white transition-colors cursor-pointer"
                                    title="Avançar etapa"
                                  >
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
