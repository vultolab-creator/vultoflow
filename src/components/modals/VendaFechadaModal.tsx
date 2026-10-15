import React from 'react';
import { Sparkles, Star, X, CheckCircle2 } from 'lucide-react';
import { useFlow } from '../../context/FlowContext';
import { formatBRL, buildWhatsAppUrl } from '../../utils/formatters';

export const VendaFechadaModal: React.FC = () => {
  const { closingClient, setClosingClient, company, triggerWhatsAppContact } = useFlow();

  if (!closingClient) return null;

  const handleAskGoogleReview = () => {
    const firstName = closingClient.name.split(' ')[0];
    const message = `Oi ${firstName}! Muito obrigado pela confiança no nosso trabalho. Se você puder nos ajudar com uma rápida avaliação de 5 estrelas no Google, significa muito para nossa equipe: ${company.googleReviewUrl}`;
    
    triggerWhatsAppContact(closingClient, 'Solicitação de avaliação no Google enviada');
    const url = buildWhatsAppUrl(closingClient.phone, message);
    window.open(url, '_blank');
    setClosingClient(null);
  };

  const handleDismiss = () => {
    setClosingClient(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-end p-4 pb-0">
          <button
            onClick={handleDismiss}
            className="text-[#8E8E93] hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-8 pb-8 pt-2 text-center space-y-5">
          {/* Success Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#C6FF00]/15 text-[#C6FF00] border border-[#C6FF00]/30 mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>

          <div>
            <span className="text-xs font-semibold text-[#C6FF00] tracking-wider uppercase">
              Parabéns!
            </span>
            <h2 className="text-2xl font-extrabold text-white mt-1">
              Venda fechada 🎉
            </h2>
            <p className="text-xs text-[#8E8E93] mt-1">
              {closingClient.name} · {closingClient.service}
            </p>
          </div>

          <div className="py-4 px-6 bg-[#171717] border border-[#222222] rounded-xl">
            <span className="text-[11px] uppercase tracking-wider text-[#8E8E93] block">
              Valor Fechado
            </span>
            <div className="text-3xl font-bold text-white font-mono tabular-nums mt-1">
              {formatBRL(closingClient.value)}
            </div>
          </div>

          {/* Vulto Tap / Google Review Prompt */}
          <div className="p-4 rounded-xl bg-[#171717] border border-[#262626] text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-white">
              <Star className="w-4 h-4 text-[#C6FF00] fill-[#C6FF00]" />
              Quer pedir uma avaliação para esse cliente?
            </div>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              Clientes que acabaram de fechar têm 80% mais chances de deixar 5 estrelas no seu Google Meu Negócio.
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleAskGoogleReview}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-black bg-[#C6FF00] hover:bg-[#b2e600] active:scale-[0.98] rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 fill-black" />
              PEDIR AVALIAÇÃO NO GOOGLE
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-full py-2.5 px-4 text-xs font-medium text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
            >
              DEPOIS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
