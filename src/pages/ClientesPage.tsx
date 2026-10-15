import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  MessageSquare,
  ChevronRight,
  Users,
  AlertCircle,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { formatBRL, getStatusLabel } from '../utils/formatters';
import { NewActionDropdown } from '../components/common/NewActionDropdown';

export const ClientesPage: React.FC = () => {
  const {
    clients,
    dataLoading,
    setSelectedClientId,
    openWhatsAppModal,
    setIsNewClientModalOpen,
  } = useFlow();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      // Search by name, service or phone
      const term = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !term ||
        client.name.toLowerCase().includes(term) ||
        client.service.toLowerCase().includes(term) ||
        client.phone.replace(/\D/g, '').includes(term.replace(/\D/g, '')) ||
        client.phone.includes(term);

      if (!matchesSearch) return false;

      // Filter by status or attention
      if (statusFilter === 'todos') return true;
      if (statusFilter === 'atencao') return client.needsAttention;
      
      // Match client primary status or any opportunity status
      if (client.status === statusFilter) return true;
      if (client.opportunities && client.opportunities.some((o) => o.status === statusFilter)) {
        return true;
      }
      return false;
    });
  }, [clients, searchTerm, statusFilter]);

  const filterOptions = [
    { id: 'todos', label: 'Todos' },
    { id: 'atencao', label: 'Precisa de atenção' },
    { id: 'novo', label: 'Novos' },
    { id: 'orcamento_enviado', label: 'Orçamento enviado' },
    { id: 'negociando', label: 'Em negociação' },
    { id: 'fechado', label: 'Fechados' },
  ];

  // Loading skeleton
  if (dataLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-[#1C1C1C]">
          <div className="space-y-2">
            <div className="h-7 w-32 bg-[#1A1A1A] rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-[#141414] rounded-md animate-pulse" />
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-10 bg-[#141414] rounded-xl animate-pulse" />
          <div className="h-64 bg-[#121212] border border-[#222222] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const hasNoClientsTotal = clients.length === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Clientes
          </h1>
          <p className="text-sm text-[#8E8E93] mt-0.5">
            Gerencie todos os clientes e contatos comerciais em um só lugar.
          </p>
        </div>

        <NewActionDropdown />
      </div>

      {/* Global Empty State */}
      {hasNoClientsTotal ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed border-[#222222] rounded-2xl bg-[#0F0F0F] text-center max-w-md mx-auto my-12 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C6FF00]/10 border border-[#C6FF00]/20 flex items-center justify-center text-[#C6FF00]">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">
              Nenhum cliente por aqui ainda.
            </h3>
            <p className="text-xs text-[#8E8E93]">
              Cadastre quem entrou em contato com você pelo WhatsApp para iniciar o controle.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsNewClientModalOpen(true)}
            className="py-2.5 px-5 bg-[#C6FF00] hover:bg-[#b2e600] active:scale-[0.98] text-black font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            + NOVO CONTATO
          </button>
        </div>
      ) : (
        <>
          {/* Search and Filters Bar */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#8E8E93] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome, serviço ou telefone..."
                className="w-full bg-[#121212] border border-[#222222] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-[#666666] focus:outline-hidden focus:border-[#C6FF00] transition-colors"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {filterOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setStatusFilter(opt.id)}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === opt.id
                      ? 'bg-[#C6FF00] text-black font-bold'
                      : 'bg-[#141414] border border-[#222222] text-[#8E8E93] hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clients List */}
          <div className="bg-[#121212] border border-[#222222] rounded-xl overflow-hidden shadow-sm">
            {filteredClients.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <p className="text-sm text-[#8E8E93]">Nenhum cliente encontrado com estes filtros.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('todos');
                  }}
                  className="text-xs text-[#C6FF00] hover:underline cursor-pointer"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#1C1C1C]">
                {filteredClients.map((client) => {
                  const isAttention = client.needsAttention;
                  return (
                    <div
                      key={client.id}
                      className="p-4 sm:px-6 hover:bg-[#161616] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
                      onClick={() => setSelectedClientId(client.id)}
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-[#C6FF00] transition-colors truncate">
                              {client.name}
                            </span>
                            {isAttention && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#1C1C1C] text-[#C6FF00] border border-[#C6FF00]/30 whitespace-nowrap">
                                Atenção
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-[#8E8E93] mt-0.5">
                            <span className="truncate">{client.service}</span>
                            <span>·</span>
                            <span className="font-mono">{client.phone}</span>
                          </div>
                        </div>
                      </div>

                      {/* Status, Value, and Action */}
                      <div
                        className="flex items-center justify-between sm:justify-end gap-4 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="text-left sm:text-right">
                          <div className="text-sm font-bold text-white font-mono tabular-nums">
                            {formatBRL(client.value)}
                          </div>
                          <span className="text-[11px] text-[#8E8E93]">
                            {client.lastContactDate}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openWhatsAppModal(client)}
                            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#C6FF00] hover:bg-[#b2e600] text-black text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                            title="Chamar no WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Chamar</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedClientId(client.id)}
                            className="p-2 rounded-lg bg-[#1C1C1C] hover:bg-[#262626] text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
                            title="Ver detalhes"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
