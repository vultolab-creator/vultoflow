import React, { useState } from 'react';
import { UserPlus, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useFlow } from '../../context/FlowContext';

export const NewClientModal: React.FC = () => {
  const {
    isNewClientModalOpen,
    setIsNewClientModalOpen,
    addClient,
    setSelectedClientId,
  } = useFlow();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [service, setService] = useState('');
  const [valueStr, setValueStr] = useState('');
  const [notes, setNotes] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isNewClientModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Informe o nome do cliente.');
      return;
    }
    if (!phone.trim()) {
      setErrorMessage('Informe o WhatsApp do cliente.');
      return;
    }

    const parsedValue = parseFloat(valueStr.replace(/\D/g, '')) || 0;

    setIsSubmitting(true);
    const res = await addClient({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      service: service.trim() || undefined,
      value: parsedValue > 0 ? parsedValue : undefined,
      notes: notes.trim() || undefined,
    });
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Não conseguimos salvar agora. Tente novamente.');
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      setName('');
      setPhone('');
      setEmail('');
      setService('');
      setValueStr('');
      setNotes('');
      setSuccess(false);
      setIsNewClientModalOpen(false);
      if (res.data?.id) {
        setSelectedClientId(res.data.id);
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222222]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C6FF00]/10 flex items-center justify-center text-[#C6FF00]">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Novo Contato</h3>
              <p className="text-[11px] text-[#8E8E93]">Cadastre quem acabou de chamar</p>
            </div>
          </div>
          <button
            onClick={() => setIsNewClientModalOpen(false)}
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
              <span>Contato salvo com sucesso!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
              Nome do contato *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Carlos Henrique"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
                WhatsApp *
              </label>
              <input
                type="text"
                required
                placeholder="(11) 99123-4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
                E-mail (opcional)
              </label>
              <input
                type="email"
                placeholder="cliente@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00] transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
                Serviço de interesse
              </label>
              <input
                type="text"
                placeholder="Ex: Fechamento de varanda"
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
                placeholder="Ex: 4800"
                value={valueStr}
                onChange={(e) => setValueStr(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] uppercase tracking-wider mb-1">
              Observações
            </label>
            <textarea
              rows={2}
              placeholder="Detalhes, medidas ou informações importantes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00] resize-none transition-colors"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#1F1F1F]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setIsNewClientModalOpen(false)}
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
                  <span>SALVANDO...</span>
                </>
              ) : (
                <span>SALVAR CONTATO</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
