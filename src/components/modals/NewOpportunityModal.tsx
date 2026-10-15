import React, { useState, useEffect } from 'react';
import { Kanban, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useFlow } from '../../context/FlowContext';

export const NewOpportunityModal: React.FC = () => {
  const {
    isNewOpportunityModalOpen,
    setIsNewOpportunityModalOpen,
    newOpportunityTargetClientId,
    setNewOpportunityTargetClientId,
    clients,
    createOpportunity,
  } = useFlow();

  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [service, setService] = useState('');
  const [valueStr, setValueStr] = useState('');
  const [nextContactDate, setNextContactDate] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (newOpportunityTargetClientId) {
      setClientId(newOpportunityTargetClientId);
      const target = clients.find((c) => c.id === newOpportunityTargetClientId);
      if (target) {
        setTitle(target.service || 'Nova proposta sob medida');
        setService(target.service || '');
      }
    } else if (clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [newOpportunityTargetClientId, clients, clientId]);

  if (!isNewOpportunityModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!clientId) {
      setErrorMessage('Selecione um cliente para vincular a negociação.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Informe o título da negociação.');
      return;
    }

    const parsedValue = parseFloat(valueStr.replace(/\D/g, '')) || 0;

    setIsSubmitting(true);
    const res = await createOpportunity({
      client_id: clientId,
      title: title.trim(),
      service: service.trim() || undefined,
      estimated_value: parsedValue,
      next_contact_at: nextContactDate ? new Date(nextContactDate).toISOString() : null,
    });
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Não conseguimos salvar agora. Tente novamente.');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setTitle('');
      setService('');
      setValueStr('');
      setNextContactDate('');
      setSuccess(false);
      setIsNewOpportunityModalOpen(false);
      setNewOpportunityTargetClientId(null);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222222]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C6FF00]/10 flex items-center justify-center text-[#C6FF00]">
              <Kanban className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Nova Negociação</h3>
              <p className="text-[11px] text-[#8E8E93]">Inicie uma oportunidade no Flow</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsNewOpportunityModalOpen(false);
              setNewOpportunityTargetClientId(null);
            }}
            className="text-[#8E8E93] hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-[#C6FF00]/10 border border-[#C6FF00]/40 text-xs text-[#C6FF00] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Negociação iniciada com sucesso!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
              Cliente *
            </label>
            <select
              required
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-[#C6FF00] transition-colors"
            >
              <option value="" disabled>Selecione o cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {c.phone}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
              Título da negociação *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Móveis sob medida sala"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
                Serviço
              </label>
              <input
                type="text"
                placeholder="Ex: Marcenaria completa"
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
                Valor estimado (R$)
              </label>
              <input
                type="text"
                placeholder="Ex: 8500"
                value={valueStr}
                onChange={(e) => setValueStr(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
              Próximo contato (opcional)
            </label>
            <input
              type="date"
              value={nextContactDate}
              onChange={(e) => setNextContactDate(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-[#C6FF00] transition-colors"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1F1F1F]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                setIsNewOpportunityModalOpen(false);
                setNewOpportunityTargetClientId(null);
              }}
              className="px-4 py-2 text-xs font-medium text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="py-2.5 px-5 text-xs font-extrabold text-black bg-[#C6FF00] hover:bg-[#b2e600] active:scale-[0.98] rounded-lg transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
                  <span>CRIANDO...</span>
                </>
              ) : (
                <span>CRIAR NEGOCIAÇÃO</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
