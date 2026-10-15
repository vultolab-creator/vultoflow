import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  CheckCircle2,
  XCircle,
  Plus,
  Clock,
  Calendar,
  AlertCircle,
  Trash2,
  Edit2,
  Kanban,
  Check,
  Loader2,
} from 'lucide-react';
import { useFlow } from '../../context/FlowContext';
import { formatBRL, getStatusLabel, formatDateTime, formatDateShort } from '../../utils/formatters';

export const ClientDrawer: React.FC = () => {
  const {
    selectedClient,
    setSelectedClientId,
    openWhatsAppModal,
    openCloseSaleModal,
    openLostSaleModal,
    openNewOpportunityModal,
    addTimelineNote,
    updateClient,
    deleteClient,
    setNextContact,
  } = useFlow();

  const [newNote, setNewNote] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  // Edit Client Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editService, setEditService] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editNextContact, setEditNextContact] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Confirmation State
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick Reschedule State
  const [showReschedule, setShowReschedule] = useState(false);
  const [customNextDate, setCustomNextDate] = useState('');

  if (!selectedClient) return null;

  const startEditing = () => {
    setEditName(selectedClient.name);
    setEditPhone(selectedClient.phone);
    setEditEmail(selectedClient.email || '');
    setEditService(selectedClient.service || '');
    setEditNotes(selectedClient.notes || '');
    setEditNextContact(
      selectedClient.nextContactAt
        ? new Date(selectedClient.nextContactAt).toISOString().split('T')[0]
        : ''
    );
    setEditError('');
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) {
      setEditError('Nome e telefone são obrigatórios.');
      return;
    }

    setIsSavingEdit(true);
    setEditError('');
    const res = await updateClient(selectedClient.id, {
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim() || null,
      service_interest: editService.trim() || null,
      notes: editNotes.trim() || null,
      next_contact_at: editNextContact ? new Date(editNextContact).toISOString() : null,
    });
    setIsSavingEdit(false);

    if (!res.success) {
      setEditError(res.error || 'Não foi possível atualizar o cliente.');
    } else {
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteClient(selectedClient.id);
    setIsDeleting(false);
    if (res.success) {
      setIsConfirmingDelete(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || isSubmittingNote) return;
    setIsSubmittingNote(true);
    await addTimelineNote(selectedClient.id, newNote.trim());
    setNewNote('');
    setIsSubmittingNote(false);
  };

  const handleQuickNextContact = async (days: number) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    await setNextContact(
      selectedClient.id,
      selectedClient.primaryOpportunityId || null,
      targetDate.toISOString()
    );
    setShowReschedule(false);
  };

  const handleCustomNextContact = async () => {
    if (!customNextDate) return;
    const targetDate = new Date(customNextDate);
    await setNextContact(
      selectedClient.id,
      selectedClient.primaryOpportunityId || null,
      targetDate.toISOString()
    );
    setShowReschedule(false);
    setCustomNextDate('');
  };

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'cliente_criado':
        return <Plus className="w-3.5 h-3.5 text-blue-400" />;
      case 'oportunidade_criada':
        return <Kanban className="w-3.5 h-3.5 text-amber-400" />;
      case 'contato_realizado':
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-[#C6FF00]" />;
      case 'venda_fechada':
      case 'fechado':
        return <CheckCircle2 className="w-3.5 h-3.5 text-[#C6FF00]" />;
      case 'venda_perdida':
      case 'perdido':
        return <XCircle className="w-3.5 h-3.5 text-red-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-[#8E8E93]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-xl bg-[#121212] border-l border-[#262626] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222222]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight truncate">
                  {selectedClient.name}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                    selectedClient.status === 'fechado'
                      ? 'bg-[#C6FF00]/15 text-[#C6FF00] border border-[#C6FF00]/30'
                      : selectedClient.status === 'perdido'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                      : 'bg-[#222222] text-[#F4F4F1]'
                  }`}
                >
                  {getStatusLabel(selectedClient.status)}
                </span>
              </div>
              <p className="text-xs text-[#8E8E93] truncate mt-0.5">
                {selectedClient.service}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {!isEditing && (
              <button
                type="button"
                onClick={startEditing}
                title="Editar cliente"
                className="p-1.5 text-[#8E8E93] hover:text-[#C6FF00] rounded-lg hover:bg-[#1C1C1C] transition-colors cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedClientId(null)}
              className="p-1.5 text-[#8E8E93] hover:text-white rounded-lg hover:bg-[#1C1C1C] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick action bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-3.5 bg-[#171717] border-b border-[#222222]">
          <button
            type="button"
            onClick={() => openWhatsAppModal(selectedClient)}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#C6FF00] hover:bg-[#b2e600] active:scale-[0.98] text-black font-extrabold text-[11px] rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="truncate">CHAMAR NO WHATSAPP</span>
          </button>

          <button
            type="button"
            onClick={() => openNewOpportunityModal(selectedClient.id)}
            className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#222222] hover:bg-[#2C2C2C] active:scale-[0.98] text-white font-semibold text-[11px] rounded-lg transition-all border border-[#333333] cursor-pointer"
          >
            <Kanban className="w-3.5 h-3.5 text-[#C6FF00]" />
            <span className="truncate">NOVA NEGOCIAÇÃO</span>
          </button>

          {selectedClient.status !== 'fechado' && (
            <button
              type="button"
              onClick={() => openCloseSaleModal(selectedClient)}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#1C1C1C] hover:bg-emerald-950/40 active:scale-[0.98] text-emerald-400 font-semibold text-[11px] rounded-lg transition-all border border-emerald-900/40 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="truncate">FECHOU</span>
            </button>
          )}

          {selectedClient.status !== 'perdido' && (
            <button
              type="button"
              onClick={() => openLostSaleModal(selectedClient)}
              className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#1C1C1C] hover:bg-red-950/40 active:scale-[0.98] text-red-400 font-semibold text-[11px] rounded-lg transition-all border border-red-900/40 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span className="truncate">PERDIDO</span>
            </button>
          )}
        </div>

        {/* Scrollable details */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Attention Banner if applicable */}
          {selectedClient.needsAttention && (
            <div className="p-3.5 bg-[#C6FF00]/10 border border-[#C6FF00]/30 rounded-xl flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-extrabold text-[#C6FF00] uppercase tracking-wider block">
                  Precisa de Atenção
                </span>
                <p className="text-xs text-white">
                  {selectedClient.attentionReason || 'Cliente precisa de retorno'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => openWhatsAppModal(selectedClient)}
                className="py-1.5 px-3 bg-[#C6FF00] text-black text-xs font-bold rounded-lg hover:bg-[#b2e600] transition-colors shrink-0 cursor-pointer"
              >
                Chamar Agora
              </button>
            </div>
          )}

          {/* EDIT FORM or DISPLAY CARD */}
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="p-4 rounded-xl bg-[#171717] border border-[#333333] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#262626]">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Editar Dados do Cliente
                </h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-[#8E8E93] hover:text-white"
                >
                  Cancelar
                </button>
              </div>

              {editError && (
                <div className="p-2.5 bg-red-950/30 border border-red-800/40 text-xs text-red-300 rounded-lg">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1">
                    WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1">
                    Serviço de interesse
                  </label>
                  <input
                    type="text"
                    value={editService}
                    onChange={(e) => setEditService(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1">
                    Próximo contato
                  </label>
                  <input
                    type="date"
                    value={editNextContact}
                    onChange={(e) => setEditNextContact(e.target.value)}
                    className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#8E8E93] uppercase mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-hidden focus:border-[#C6FF00] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-[#8E8E93] hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-4 py-1.5 bg-[#C6FF00] text-black font-bold text-xs rounded-lg hover:bg-[#b2e600] flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {isSavingEdit ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Salvando...</span>
                    </>
                  ) : (
                    <span>Salvar alterações</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 p-4 rounded-xl bg-[#171717] border border-[#262626]">
              <div>
                <span className="text-[10px] text-[#8E8E93] font-semibold uppercase tracking-wider block">
                  WhatsApp
                </span>
                <span className="text-xs font-semibold text-white flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-[#C6FF00]" />
                  {selectedClient.phone}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#8E8E93] font-semibold uppercase tracking-wider block">
                  E-mail
                </span>
                <span className="text-xs font-medium text-white flex items-center gap-1.5 mt-0.5 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#8E8E93]" />
                  {selectedClient.email || 'Não informado'}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#8E8E93] font-semibold uppercase tracking-wider block">
                  Valor em Negociação
                </span>
                <span className="text-sm font-bold text-white font-mono tabular-nums mt-0.5 block">
                  {formatBRL(selectedClient.value)}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#8E8E93] font-semibold uppercase tracking-wider block">
                  Serviço de Interesse
                </span>
                <span className="text-xs font-medium text-white mt-0.5 block truncate">
                  {selectedClient.service}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-[#8E8E93] font-semibold uppercase tracking-wider block">
                  Último Contato
                </span>
                <span className="text-xs font-medium text-white mt-0.5 block">
                  {selectedClient.lastContactDate}
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-[#8E8E93] font-semibold uppercase tracking-wider block">
                    Próximo Contato
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowReschedule(!showReschedule)}
                    className="text-[10px] text-[#C6FF00] hover:underline cursor-pointer"
                  >
                    Agendar
                  </button>
                </div>
                <span className="text-xs font-medium text-white mt-0.5 block">
                  {selectedClient.nextContactAt
                    ? formatDateTime(selectedClient.nextContactAt)
                    : 'Não agendado'}
                </span>
              </div>
            </div>
          )}

          {/* Quick Reschedule Drawer Section */}
          {showReschedule && (
            <div className="p-4 rounded-xl bg-[#141414] border border-[#2E2E2E] space-y-2.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Chamar novamente em:
                </span>
                <button
                  type="button"
                  onClick={() => setShowReschedule(false)}
                  className="text-xs text-[#8E8E93] hover:text-white"
                >
                  Fechar
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickNextContact(0)}
                  className="p-2 bg-[#1C1C1C] hover:bg-[#282828] text-white text-xs font-medium rounded-lg border border-[#2E2E2E] text-center"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickNextContact(1)}
                  className="p-2 bg-[#1C1C1C] hover:bg-[#282828] text-white text-xs font-medium rounded-lg border border-[#2E2E2E] text-center"
                >
                  Amanhã
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickNextContact(2)}
                  className="p-2 bg-[#1C1C1C] hover:bg-[#282828] text-white text-xs font-medium rounded-lg border border-[#2E2E2E] text-center"
                >
                  2 dias
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickNextContact(3)}
                  className="p-2 bg-[#1C1C1C] hover:bg-[#282828] text-white text-xs font-medium rounded-lg border border-[#2E2E2E] text-center"
                >
                  3 dias
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickNextContact(7)}
                  className="p-2 bg-[#1C1C1C] hover:bg-[#282828] text-white text-xs font-medium rounded-lg border border-[#2E2E2E] text-center"
                >
                  1 semana
                </button>
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="date"
                  value={customNextDate}
                  onChange={(e) => setCustomNextDate(e.target.value)}
                  className="flex-1 bg-[#0A0A0A] border border-[#2E2E2E] rounded-lg px-2.5 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  disabled={!customNextDate}
                  onClick={handleCustomNextContact}
                  className="px-3 py-1.5 bg-[#C6FF00] hover:bg-[#b2e600] disabled:opacity-40 text-black font-bold text-xs rounded-lg"
                >
                  Salvar data
                </button>
              </div>
            </div>
          )}

          {/* Observations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93] mb-2">
              Observações
            </h4>
            <div className="p-3 bg-[#171717] rounded-xl border border-[#222222] text-xs text-[#F4F4F1] leading-relaxed">
              {selectedClient.notes || 'Nenhuma observação cadastrada.'}
            </div>
          </div>

          {/* NEGOCIAÇÕES DAQUELE CLIENTE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
                Negociações ({selectedClient.opportunities?.length || 0})
              </h4>
              <button
                type="button"
                onClick={() => openNewOpportunityModal(selectedClient.id)}
                className="text-xs text-[#C6FF00] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nova negociação</span>
              </button>
            </div>

            <div className="space-y-2">
              {(!selectedClient.opportunities || selectedClient.opportunities.length === 0) ? (
                <div className="p-3.5 rounded-xl bg-[#171717] border border-[#222222] text-center text-xs text-[#8E8E93]">
                  Nenhuma negociação em andamento para este contato.
                </div>
              ) : (
                selectedClient.opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="p-3 rounded-xl bg-[#171717] border border-[#262626] flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {opp.title}
                      </div>
                      <div className="text-[11px] text-[#8E8E93] mt-0.5 flex items-center gap-2">
                        <span>{opp.service || 'Serviço sob medida'}</span>
                        <span>·</span>
                        <span className="font-mono text-white font-semibold">
                          {formatBRL(opp.estimated_value)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shrink-0 ${
                        opp.status === 'fechado'
                          ? 'bg-[#C6FF00]/15 text-[#C6FF00]'
                          : opp.status === 'perdido'
                          ? 'bg-red-500/10 text-red-400'
                          : 'bg-[#262626] text-white'
                      }`}
                    >
                      {getStatusLabel(opp.status)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* LINHA DO TEMPO (FLOW_ACTIVITIES) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
                Linha do Tempo
              </h4>
              <span className="text-[11px] text-[#8E8E93] font-mono">
                {selectedClient.timeline.length} {selectedClient.timeline.length === 1 ? 'registro' : 'registros'}
              </span>
            </div>

            {/* Quick Note Input */}
            <form onSubmit={handleAddNote} className="mb-3.5 flex gap-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Adicionar anotação ou resumo de conversa..."
                className="flex-1 bg-[#171717] border border-[#262626] rounded-lg px-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00]"
              />
              <button
                type="submit"
                disabled={!newNote.trim() || isSubmittingNote}
                className="px-3.5 py-2 bg-[#222222] hover:bg-[#333333] disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Salvar
              </button>
            </form>

            <div className="space-y-3 relative pl-3 border-l border-[#262626] ml-2">
              {selectedClient.timeline.length === 0 ? (
                <p className="text-xs text-[#8E8E93] italic">Nenhuma atividade registrada ainda.</p>
              ) : (
                selectedClient.timeline.map((event) => (
                  <div key={event.id} className="relative group">
                    <div className="absolute -left-[19px] top-1 w-4 h-4 rounded-full bg-[#171717] border border-[#333333] flex items-center justify-center">
                      {getTimelineIcon(event.type)}
                    </div>
                    <div className="ml-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {event.title}
                        </span>
                        <span className="text-[10px] text-[#8E8E93] font-mono">
                          {event.date} {event.time && `às ${event.time}`}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-xs text-[#8E8E93] mt-0.5 leading-relaxed">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Delete Client Section */}
          <div className="pt-4 border-t border-[#1C1C1C]">
            {isConfirmingDelete ? (
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 space-y-3">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-xs font-bold text-red-200">
                      Tem certeza que deseja excluir este cliente?
                    </h5>
                    <p className="text-[11px] text-red-300/80 mt-1 leading-relaxed">
                      As negociações e atividades vinculadas a este contato também serão removidas do banco de dados.
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingDelete(false)}
                    className="px-3 py-1.5 text-xs text-[#8E8E93] hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Excluindo...</span>
                      </>
                    ) : (
                      <span>Sim, excluir cliente</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="text-xs text-red-400/80 hover:text-red-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir cliente</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
