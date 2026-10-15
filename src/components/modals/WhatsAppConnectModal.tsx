import React, { useState } from 'react';
import { Smartphone, Zap, X, ShieldCheck, Check } from 'lucide-react';
import { useFlow } from '../../context/FlowContext';

export const WhatsAppConnectModal: React.FC = () => {
  const { isWhatsAppConnectModalOpen, setIsWhatsAppConnectModalOpen, company } = useFlow();
  const [showProNotice, setShowProNotice] = useState(false);

  if (!isWhatsAppConnectModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#C6FF00]/10 flex items-center justify-center text-[#C6FF00]">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Integração WhatsApp</h3>
              <p className="text-[11px] text-[#8E8E93]">Conecte seu número ao Flow</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowProNotice(false);
              setIsWhatsAppConnectModalOpen(false);
            }}
            className="text-[#8E8E93] hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-[#171717] border border-[#262626] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8E8E93]">Status da Conexão:</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#262626] text-[#8E8E93]">
                {company.whatsappConnected ? 'CONECTADO' : 'NÃO CONECTADO'}
              </span>
            </div>
            <div className="text-xs text-[#8E8E93] leading-relaxed">
              Com o WhatsApp conectado, novos clientes que mandam mensagem no seu WhatsApp são criados automaticamente no Flow, sem digitação.
            </div>
          </div>

          {showProNotice ? (
            <div className="p-4 rounded-xl bg-[#C6FF00]/10 border border-[#C6FF00]/40 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-[#C6FF00]">
                <Zap className="w-4 h-4" />
                Essa integração estará disponível no VULTO FLOW PRO.
              </div>
              <p className="text-xs text-[#F4F4F1]/90 leading-relaxed">
                No VULTO FLOW PRO (R$129,90/mês), a sincronização oficial via WhatsApp Business API permite capturar contatos automaticamente, delegar conversas e disparar orçamentos sem sair do painel.
              </p>
              <div className="pt-2 text-xs text-[#8E8E93]">
                Você pode continuar chamando seus clientes pelo link direto com 1 clique gratuitamente na versão atual.
              </div>
            </div>
          ) : (
            <div className="space-y-2 text-xs text-[#8E8E93]">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
                <span>Captura imediata de novos pedidos de orçamento</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-4 h-4 text-[#C6FF00] shrink-0 mt-0.5" />
                <span>Notificações quando o cliente visualiza a proposta</span>
              </div>
            </div>
          )}

          {/* Action button */}
          {!showProNotice ? (
            <button
              type="button"
              onClick={() => setShowProNotice(true)}
              className="w-full py-3 px-4 text-xs font-bold text-black bg-[#C6FF00] hover:bg-[#b2e600] rounded-lg transition-colors shadow-sm"
            >
              CONECTAR WHATSAPP
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowProNotice(false);
                setIsWhatsAppConnectModalOpen(false);
              }}
              className="w-full py-2.5 px-4 text-xs font-medium text-white bg-[#262626] hover:bg-[#333333] rounded-lg transition-colors"
            >
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
