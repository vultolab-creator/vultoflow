import React, { useState, useEffect } from 'react';
import { MessageSquare, Copy, ExternalLink, X, Check, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { useFlow } from '../../context/FlowContext';
import { formatBRL, buildWhatsAppUrl } from '../../utils/formatters';

export const WhatsAppCallModal: React.FC = () => {
  const {
    callingClient,
    setCallingClient,
    templates,
    registerWhatsAppContact,
    setNextContact,
  } = useFlow();

  const [step, setStep] = useState<'message' | 'schedule'>('message');
  const [selectedType, setSelectedType] = useState<'curta' | 'consultiva'>('curta');
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);
  const [customDate, setCustomDate] = useState('');
  const [scheduledFeedback, setScheduledFeedback] = useState('');

  useEffect(() => {
    if (callingClient) {
      setStep('message');
      setScheduledFeedback('');
      const templateObj = templates.find((t) => t.type === selectedType) || templates[0];
      const firstName = callingClient.name.split(' ')[0] || 'Cliente';
      const filled = templateObj.template.replace('{nome}', firstName);
      setMessageText(filled);
      setCopied(false);
    }
  }, [callingClient, selectedType, templates]);

  if (!callingClient) return null;

  const handleSelectTemplate = (type: 'curta' | 'consultiva') => {
    setSelectedType(type);
    const templateObj = templates.find((t) => t.type === type) || templates[0];
    const firstName = callingClient.name.split(' ')[0] || 'Cliente';
    setMessageText(templateObj.template.replace('{nome}', firstName));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = async () => {
    // 1. Build sanitized URL with 55+DDD+number
    const url = buildWhatsAppUrl(callingClient.phone, messageText);
    
    // 2. Open wa.me in new tab
    window.open(url, '_blank');

    // 3. Register contact interaction and activity in Supabase
    await registerWhatsAppContact(callingClient, callingClient.primaryOpportunityId, messageText);

    // 4. Offer "Quando deseja chamar novamente?"
    setStep('schedule');
  };

  const handleScheduleNext = async (days: number) => {
    const target = new Date();
    target.setDate(target.getDate() + days);
    await setNextContact(callingClient.id, callingClient.primaryOpportunityId || null, target.toISOString());
    setScheduledFeedback(`Agendado para ${days === 0 ? 'hoje' : days === 1 ? 'amanhã' : `daqui a ${days} dias`}!`);
    setTimeout(() => {
      setCallingClient(null);
    }, 1000);
  };

  const handleScheduleCustom = async () => {
    if (!customDate) return;
    const target = new Date(customDate);
    await setNextContact(callingClient.id, callingClient.primaryOpportunityId || null, target.toISOString());
    setScheduledFeedback('Data agendada com sucesso!');
    setTimeout(() => {
      setCallingClient(null);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-[#121212] border border-[#262626] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222222]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#C6FF00]/10 flex items-center justify-center text-[#C6FF00]">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-tight">
                {step === 'message' ? 'Chamar no WhatsApp' : 'Contato Realizado!'}
              </h3>
              <p className="text-xs text-[#8E8E93]">
                {callingClient.name} · {callingClient.phone}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCallingClient(null)}
            className="text-[#8E8E93] hover:text-white transition-colors p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* STEP 1: MESSAGE CHOICE & WHATSAPP REDIRECT */}
        {step === 'message' && (
          <div className="p-6 space-y-4">
            {/* Client summary box */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#171717] border border-[#222222] text-xs">
              <div>
                <span className="text-[#8E8E93]">Serviço: </span>
                <span className="text-white font-medium">{callingClient.service}</span>
              </div>
              <div>
                <span className="text-[#8E8E93]">Valor: </span>
                <span className="text-white font-semibold font-mono tabular-nums">
                  {formatBRL(callingClient.value)}
                </span>
              </div>
            </div>

            {/* Template choices */}
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-2 uppercase tracking-wider">
                Escolha o modelo de mensagem:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('curta')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg text-left transition-colors border cursor-pointer ${
                    selectedType === 'curta'
                      ? 'bg-[#C6FF00]/10 border-[#C6FF00] text-[#C6FF00]'
                      : 'bg-[#171717] border-[#262626] text-[#8E8E93] hover:text-white'
                  }`}
                >
                  <div className="font-bold text-white">MENSAGEM CURTA</div>
                  <div className="text-[11px] text-[#8E8E93] truncate">Direta e rápida</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTemplate('consultiva')}
                  className={`py-2 px-3 text-xs font-medium rounded-lg text-left transition-colors border cursor-pointer ${
                    selectedType === 'consultiva'
                      ? 'bg-[#C6FF00]/10 border-[#C6FF00] text-[#C6FF00]'
                      : 'bg-[#171717] border-[#262626] text-[#8E8E93] hover:text-white'
                  }`}
                >
                  <div className="font-bold text-white">MENSAGEM CONSULTIVA</div>
                  <div className="text-[11px] text-[#8E8E93] truncate">Acolhedora com suporte</div>
                </button>
              </div>
            </div>

            {/* Message preview & edit */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#8E8E93] uppercase tracking-wider">
                  Texto da mensagem
                </label>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs flex items-center gap-1 text-[#8E8E93] hover:text-[#C6FF00] transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-[#C6FF00]" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copiado!' : 'Copiar texto'}
                </button>
              </div>
              <textarea
                rows={4}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg p-3 text-sm text-white focus:outline-hidden focus:border-[#C6FF00] transition-colors resize-none leading-relaxed"
              />
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#222222]">
              <button
                type="button"
                onClick={() => setCallingClient(null)}
                className="px-4 py-2 text-xs font-medium text-[#8E8E93] hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsApp}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold text-black bg-[#C6FF00] hover:bg-[#b2e600] active:scale-[0.98] rounded-lg transition-all shadow-sm cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>ABRIR NO WHATSAPP</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CENTRAL PRÓXIMO CONTATO SCHEDULING */}
        {step === 'schedule' && (
          <div className="p-6 space-y-5 animate-in fade-in duration-150">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#C6FF00]/10 text-[#C6FF00] mb-1">
                <Clock className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">
                Quando deseja chamar novamente?
              </h4>
              <p className="text-xs text-[#8E8E93]">
                Defina um lembrete para não perder a oportunidade de vista.
              </p>
            </div>

            {scheduledFeedback && (
              <div className="p-3 bg-[#C6FF00]/15 border border-[#C6FF00]/30 rounded-xl text-xs text-[#C6FF00] font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{scheduledFeedback}</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleScheduleNext(0)}
                className="py-3 px-2 rounded-xl bg-[#171717] hover:bg-[#202020] border border-[#2E2E2E] hover:border-[#C6FF00]/40 text-xs font-semibold text-white transition-all text-center cursor-pointer"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={() => handleScheduleNext(1)}
                className="py-3 px-2 rounded-xl bg-[#171717] hover:bg-[#202020] border border-[#2E2E2E] hover:border-[#C6FF00]/40 text-xs font-semibold text-white transition-all text-center cursor-pointer"
              >
                Amanhã
              </button>
              <button
                type="button"
                onClick={() => handleScheduleNext(2)}
                className="py-3 px-2 rounded-xl bg-[#171717] hover:bg-[#202020] border border-[#2E2E2E] hover:border-[#C6FF00]/40 text-xs font-semibold text-white transition-all text-center cursor-pointer"
              >
                Em 2 dias
              </button>
              <button
                type="button"
                onClick={() => handleScheduleNext(3)}
                className="py-3 px-2 rounded-xl bg-[#171717] hover:bg-[#202020] border border-[#2E2E2E] hover:border-[#C6FF00]/40 text-xs font-semibold text-white transition-all text-center cursor-pointer"
              >
                Em 3 dias
              </button>
              <button
                type="button"
                onClick={() => handleScheduleNext(7)}
                className="py-3 px-2 rounded-xl bg-[#171717] hover:bg-[#202020] border border-[#2E2E2E] hover:border-[#C6FF00]/40 text-xs font-semibold text-white transition-all text-center cursor-pointer"
              >
                Em 1 semana
              </button>
              <button
                type="button"
                onClick={() => setCustomDate(new Date().toISOString().split('T')[0])}
                className="py-3 px-2 rounded-xl bg-[#171717] hover:bg-[#202020] border border-[#2E2E2E] hover:border-[#C6FF00]/40 text-xs font-semibold text-[#C6FF00] transition-all text-center cursor-pointer"
              >
                Outra data
              </button>
            </div>

            {customDate && (
              <div className="flex gap-2 p-3 bg-[#181818] rounded-xl border border-[#2A2A2A]">
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="flex-1 bg-[#0A0A0A] border border-[#333333] rounded-lg px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={handleScheduleCustom}
                  className="px-4 py-1.5 bg-[#C6FF00] text-black font-bold text-xs rounded-lg hover:bg-[#b2e600]"
                >
                  Confirmar
                </button>
              </div>
            )}

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setCallingClient(null)}
                className="text-xs text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
              >
                Não agendar agora (fechar)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
