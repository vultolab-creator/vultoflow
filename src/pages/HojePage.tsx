import React from 'react';
import {
  MessageSquare,
  Clock,
  ChevronRight,
  TrendingUp,
  UserPlus,
  CheckCircle2,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { useAuth } from '../context/AuthContext';
import { formatBRL } from '../utils/formatters';
import { NewActionDropdown } from '../components/common/NewActionDropdown';

export const HojePage: React.FC = () => {
  const {
    company,
    clients,
    metrics,
    dataLoading,
    openWhatsAppModal,
    setSelectedClientId,
    setIsNewClientModalOpen,
    navigateTo,
  } = useFlow();
  const { profile } = useAuth();

  const firstName =
    profile?.full_name?.split(' ')[0] ||
    company.representativeName.split(' ')[0] ||
    'Comercial';

  // Skeleton loading state
  if (dataLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
        <div className="flex items-start justify-between gap-4 pb-2 border-b border-[#1C1C1C]">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-[#1A1A1A] rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-[#141414] rounded-md animate-pulse" />
          </div>
          <div className="h-9 w-24 bg-[#181818] rounded-lg animate-pulse" />
        </div>
        <div className="space-y-3">
          <div className="h-5 w-48 bg-[#161616] rounded-md animate-pulse" />
          <div className="h-24 bg-[#121212] border border-[#222222] rounded-xl animate-pulse" />
          <div className="h-24 bg-[#121212] border border-[#222222] rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="h-28 bg-[#121212] border border-[#222222] rounded-xl animate-pulse" />
          <div className="h-28 bg-[#121212] border border-[#222222] rounded-xl animate-pulse" />
          <div className="h-28 bg-[#121212] border border-[#222222] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const hasNoClientsTotal = clients.length === 0;
  const attentionClients = metrics.clientesParaChamar;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-7">
      {/* Top Header with greeting, dynamic actionable sentence, and single + NOVO action */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-1 border-b border-[#1C1C1C]">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Bom dia, {firstName}.
          </h1>
          <p className="text-sm font-medium text-[#F4F4F1] flex flex-wrap items-center gap-1.5">
            {metrics.clientesParaChamarCount > 0 ? (
              <>
                <span>Você tem</span>
                <strong className="text-[#C6FF00] font-bold">
                  {metrics.clientesParaChamarCount} {metrics.clientesParaChamarCount === 1 ? 'cliente' : 'clientes'} para chamar hoje
                </strong>
                <span>, representando</span>
                <strong className="text-white font-mono tabular-nums font-bold">
                  {formatBRL(metrics.totalAttentionValue)}
                </strong>
                <span>em negociações.</span>
              </>
            ) : (
              <span className="text-[#8E8E93]">
                {metrics.dynamicHeadline}
              </span>
            )}
          </p>
        </div>

        <div className="shrink-0 self-start sm:self-auto">
          <NewActionDropdown />
        </div>
      </div>

      {/* Global Empty State when no clients exist yet */}
      {hasNoClientsTotal ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-[#222222] rounded-2xl bg-[#0F0F0F] text-center max-w-md mx-auto my-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C6FF00]/10 border border-[#C6FF00]/20 flex items-center justify-center text-[#C6FF00]">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Seu Flow está pronto.
            </h3>
            <p className="text-xs text-[#8E8E93]">
              Cadastre seu primeiro cliente para começar a organizar orçamentos e vendas sem complicação.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsNewClientModalOpen(true)}
            className="py-2.5 px-5 bg-[#C6FF00] hover:bg-[#b2e600] active:scale-[0.98] text-black font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            + NOVO CLIENTE
          </button>
        </div>
      ) : (
        <>
          {/* PRIORIDADE 1: CLIENTES QUE PRECISAM DA SUA ATENÇÃO */}
          <section className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-extrabold uppercase tracking-wider text-white">
                  CLIENTES QUE PRECISAM DA SUA ATENÇÃO
                </h2>
                <span
                  className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                    attentionClients.length > 0
                      ? 'bg-[#C6FF00] text-black'
                      : 'bg-[#222222] text-[#8E8E93]'
                  }`}
                >
                  {attentionClients.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigateTo('/clientes')}
                className="text-xs text-[#8E8E93] hover:text-[#C6FF00] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todos</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {attentionClients.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#121212] border border-[#222222] text-center text-xs text-[#8E8E93]">
                Nenhum cliente precisando de contato imediato hoje. Tudo em dia!
              </div>
            ) : (
              <div className="space-y-2.5">
                {attentionClients.map((client) => {
                  return (
                    <div
                      key={client.id}
                      className="p-4 sm:px-5 sm:py-4 rounded-xl bg-[#121212] border border-[#222222] hover:border-[#333333] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      {/* Client info */}
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-baseline gap-2">
                          <span
                            onClick={() => setSelectedClientId(client.id)}
                            className="text-sm sm:text-base font-bold text-white group-hover:text-[#C6FF00] transition-colors cursor-pointer"
                          >
                            {client.name}
                          </span>
                          <span className="text-xs text-[#8E8E93]">·</span>
                          <span className="text-xs text-[#8E8E93] truncate">
                            {client.service}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {/* Reason for attention */}
                          <span className="text-[#F4F4F1] font-medium">
                            “{client.attentionReason || 'Orçamento enviado sem retorno recente.'}”
                          </span>

                          <span className="text-[#555555]">·</span>

                          {/* Time since last interaction */}
                          <span className="text-[#8E8E93] flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-[#666666]" />
                            {client.lastContactDaysAgo === 0
                              ? 'Hoje'
                              : `Último contato há ${client.lastContactDaysAgo} dia${client.lastContactDaysAgo > 1 ? 's' : ''}`}
                          </span>
                        </div>
                      </div>

                      {/* Value & Primary CTA */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#1C1C1C]">
                        <div className="text-left sm:text-right">
                          <div className="text-base sm:text-lg font-black text-white font-mono tabular-nums">
                            {formatBRL(client.value)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedClientId(client.id)}
                            className="hidden md:inline-flex px-3 py-2 text-xs font-semibold text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
                          >
                            Histórico
                          </button>

                          <button
                            type="button"
                            onClick={() => openWhatsAppModal(client)}
                            className="flex items-center gap-2 py-2 px-4 bg-[#C6FF00] hover:bg-[#b2e600] active:scale-[0.98] text-black text-xs font-bold rounded-lg transition-all shadow-sm cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>CHAMAR NO WHATSAPP</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* PANORAMA OPERACIONAL: DINHEIRO EM NEGOCIAÇÃO, NOVOS CONTATOS, VENDAS DO MÊS */}
          <section className="space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[#8E8E93]">
              Panorama Comercial
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Em negociação */}
              <div
                onClick={() => navigateTo('/vendas')}
                className="p-4 rounded-xl bg-[#121212] border border-[#222222] hover:border-[#333333] transition-colors cursor-pointer group space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs text-[#8E8E93]">
                  <span className="font-semibold uppercase tracking-wider">
                    Em Negociação
                  </span>
                  <TrendingUp className="w-3.5 h-3.5 text-[#8E8E93] group-hover:text-white transition-colors" />
                </div>
                <div className="text-2xl font-black text-white font-mono tabular-nums">
                  {formatBRL(metrics.emNegociacaoTotal)}
                </div>
                <p className="text-[11px] text-[#8E8E93]">
                  Negociações ativas aguardando fechamento
                </p>
              </div>

              {/* Novos contatos (últimas 24h) */}
              <div
                onClick={() => navigateTo('/clientes')}
                className="p-4 rounded-xl bg-[#121212] border border-[#222222] hover:border-[#333333] transition-colors cursor-pointer group space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs text-[#8E8E93]">
                  <span className="font-semibold uppercase tracking-wider">
                    Novos Contatos
                  </span>
                  <UserPlus className="w-3.5 h-3.5 text-[#8E8E93] group-hover:text-white transition-colors" />
                </div>
                <div className="text-2xl font-black text-white font-mono tabular-nums">
                  {metrics.novosContatosCount}
                </div>
                <p className="text-[11px] text-[#8E8E93]">
                  Chegaram nas últimas 24 horas
                </p>
              </div>

              {/* Vendidos este mês */}
              <div
                onClick={() => navigateTo('/vendas')}
                className="p-4 rounded-xl bg-[#121212] border border-[#222222] hover:border-[#333333] transition-colors cursor-pointer group space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs text-[#8E8E93]">
                  <span className="font-semibold uppercase tracking-wider">
                    Vendido Este Mês
                  </span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C6FF00]" />
                </div>
                <div className="text-2xl font-black text-[#C6FF00] font-mono tabular-nums">
                  {formatBRL(metrics.vendidosMesTotal)}
                </div>
                <p className="text-[11px] text-[#8E8E93]">
                  {metrics.quantidadeVendas} {metrics.quantidadeVendas === 1 ? 'venda fechada' : 'vendas fechadas'} com sucesso
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};
