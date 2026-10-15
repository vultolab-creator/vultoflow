import React, { useState } from 'react';
import {
  FileText,
  Eye,
  ExternalLink,
  Copy,
  Check,
  MessageSquare,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { formatBRL } from '../utils/formatters';
import { ProposalStatus } from '../types';

export const PropostasPage: React.FC = () => {
  const { proposals, navigateTo, openWhatsAppModal, clients } = useFlow();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = (proposalId: string) => {
    const url = `${window.location.origin}/p/${proposalId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(proposalId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'visualizada':
        return (
          <span className="text-[11px] font-semibold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20 flex items-center gap-1">
            <Eye className="w-3 h-3" />
            Visualizada
          </span>
        );
      case 'aceita':
        return (
          <span className="text-[11px] font-semibold text-[#C6FF00] bg-[#C6FF00]/10 px-2.5 py-0.5 rounded-md border border-[#C6FF00]/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Aceita
          </span>
        );
      case 'recusada':
        return (
          <span className="text-[11px] font-semibold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-md border border-red-500/20 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Recusada
          </span>
        );
      case 'enviada':
        return (
          <span className="text-[11px] font-semibold text-yellow-400 bg-yellow-500/10 px-2.5 py-0.5 rounded-md border border-yellow-500/20 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Enviada
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold text-[#8E8E93] bg-[#222222] px-2.5 py-0.5 rounded-md">
            Rascunho
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Propostas Digitais
          </h1>
          <p className="text-sm text-[#8E8E93]">
            Veja quais clientes abriram a proposta e quantas vezes visualizaram.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigateTo('/orcamentos')}
          className="flex items-center gap-2 py-2 px-4 rounded-lg bg-[#C6FF00] hover:bg-[#b2e600] text-black text-xs font-bold transition-colors self-start sm:self-auto shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>NOVO ORÇAMENTO</span>
        </button>
      </div>

      {/* Proposals list */}
      <div className="bg-[#121212] border border-[#222222] rounded-xl overflow-hidden shadow-sm">
        {proposals.length === 0 ? (
          <div className="p-12 text-center text-[#8E8E93] space-y-3">
            <FileText className="w-8 h-8 mx-auto text-[#444444]" />
            <p className="text-sm">Nenhuma proposta gerada ainda.</p>
            <button
              onClick={() => navigateTo('/orcamentos')}
              className="text-xs text-[#C6FF00] hover:underline"
            >
              Criar primeiro orçamento
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[#1C1C1C]">
            {proposals.map((prop) => {
              const client = clients.find((c) => c.id === prop.clientId);

              return (
                <div
                  key={prop.id}
                  className="p-5 hover:bg-[#161616] transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-[#8E8E93] bg-[#1A1A1A] px-2 py-0.5 rounded">
                        {prop.code}
                      </span>
                      <h3 className="text-sm font-bold text-white">
                        {prop.clientName}
                      </h3>
                      {getStatusBadge(prop.status)}
                    </div>

                    <p className="text-xs text-[#8E8E93]">
                      {prop.service} · Criada em {prop.createdAt}
                    </p>

                    {/* View Tracker Indicator */}
                    {prop.viewCount > 0 && (
                      <div className="text-xs text-purple-400 font-medium flex items-center gap-1.5 pt-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>
                          Visualizada {prop.viewCount} vez{prop.viewCount > 1 ? 'es' : ''}
                        </span>
                        {prop.lastViewedAt && (
                          <span className="text-[#8E8E93]">
                            · Última visualização: {prop.lastViewedAt}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Value and Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-base font-extrabold text-white font-mono tabular-nums block">
                        {formatBRL(prop.totalValue)}
                      </span>
                      <span className="text-[11px] text-[#8E8E93]">
                        {prop.items.length} {prop.items.length === 1 ? 'item' : 'itens'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {client && (
                        <button
                          type="button"
                          onClick={() => openWhatsAppModal(client)}
                          className="p-2 rounded-lg bg-[#1C1C1C] hover:bg-[#262626] text-[#8E8E93] hover:text-[#C6FF00] transition-colors"
                          title="Chamar no WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleCopyLink(prop.id)}
                        className="p-2 rounded-lg bg-[#1C1C1C] hover:bg-[#262626] text-[#8E8E93] hover:text-white transition-colors"
                        title="Copiar link da proposta"
                      >
                        {copiedId === prop.id ? (
                          <Check className="w-4 h-4 text-[#C6FF00]" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => navigateTo(`/p/${prop.id}`)}
                        className="py-1.5 px-3 rounded-lg bg-[#222222] hover:bg-[#C6FF00] hover:text-black text-white text-xs font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>Ver</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
