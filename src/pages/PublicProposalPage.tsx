import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Phone,
  MessageSquare,
  ShieldCheck,
  Calendar,
  CreditCard,
  Clock,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { formatBRL, buildWhatsAppUrl } from '../utils/formatters';

interface PublicProposalPageProps {
  proposalId: string;
}

export const PublicProposalPage: React.FC<PublicProposalPageProps> = ({
  proposalId,
}) => {
  const { proposals, company, recordProposalView, acceptProposal, navigateTo } =
    useFlow();

  const [hasRecorded, setHasRecorded] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  const proposal =
    proposals.find((p) => p.id === proposalId) || proposals[0];

  useEffect(() => {
    if (proposal && !hasRecorded) {
      recordProposalView(proposal.id);
      setHasRecorded(true);
    }
  }, [proposal, hasRecorded, recordProposalView]);

  if (!proposal) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold text-white mb-2">Proposta não encontrada</h2>
        <p className="text-sm text-[#8E8E93] mb-6">
          O link pode estar expirado ou incorreto.
        </p>
        <button
          onClick={() => navigateTo('/hoje')}
          className="py-2.5 px-5 bg-[#C6FF00] text-black font-bold text-xs rounded-lg"
        >
          Ir para o Flow
        </button>
      </div>
    );
  }

  const handleAccept = () => {
    acceptProposal(proposal.id);
    setAcceptedSuccess(true);
  };

  const handleWhatsAppContact = () => {
    const text = `Olá ${company.representativeName}! Acabei de avaliar a proposta ${proposal.code} (${proposal.service}) e gostaria de conversar a respeito.`;
    const url = buildWhatsAppUrl(company.phone, text);
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F4F4F1] antialiased selection:bg-[#C6FF00] selection:text-black pb-28">
      {/* Top Banner / Nav Back for Admin Demo */}
      <div className="border-b border-[#1A1A1A] bg-[#0E0E0E] px-4 py-2 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => navigateTo('/propostas')}
          className="text-[#8E8E93] hover:text-[#C6FF00] flex items-center gap-1.5 transition-colors font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar ao painel Vulto Flow</span>
        </button>
        <span className="text-[10px] uppercase font-mono text-[#666666]">
          Visualização do Cliente
        </span>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Company Header */}
        <div className="flex items-center justify-between border-b border-[#222222] pb-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-[#C6FF00] tracking-wider uppercase">
              {proposal.code}
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white">
              {company.name}
            </h1>
            <p className="text-xs text-[#8E8E93]">{company.segment}</p>
          </div>

          <div className="text-right space-y-1 text-xs text-[#8E8E93]">
            <div className="flex items-center justify-end gap-1 font-mono text-white">
              <Phone className="w-3 h-3 text-[#C6FF00]" />
              <span>{company.phone}</span>
            </div>
            <p>{company.email}</p>
          </div>
        </div>

        {/* Accepted Feedback Alert */}
        {(acceptedSuccess || proposal.status === 'aceita') && (
          <div className="p-4 rounded-xl bg-[#C6FF00]/15 border border-[#C6FF00]/40 flex items-center gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-6 h-6 text-[#C6FF00] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">
                Proposta aceita com sucesso!
              </h4>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                Nossa equipe entrará em contato via WhatsApp para confirmar os detalhes e agendamento da medição.
              </p>
            </div>
          </div>
        )}

        {/* Client & Project Overview */}
        <div className="p-5 rounded-2xl bg-[#121212] border border-[#222222] space-y-3">
          <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block">
            Proposta Comercial Apresentada Para
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white">
                {proposal.clientName}
              </h2>
              <p className="text-xs text-[#8E8E93] mt-0.5">
                {proposal.clientPhone}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-[#8E8E93] block">Data de emissão</span>
              <span className="text-xs font-medium text-white font-mono">
                {proposal.createdAt}
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1C1C1C]">
            <span className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-wider block">
              Projeto / Serviço
            </span>
            <p className="text-sm font-bold text-white mt-0.5">
              {proposal.service}
            </p>
            {proposal.description && (
              <p className="text-xs text-[#8E8E93] mt-1.5 leading-relaxed">
                {proposal.description}
              </p>
            )}
          </div>
        </div>

        {/* Items Breakdown */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
            Itens e Serviços Inclusos
          </h3>

          <div className="bg-[#121212] border border-[#222222] rounded-2xl divide-y divide-[#1C1C1C] overflow-hidden">
            {proposal.items.map((item, idx) => (
              <div key={item.id} className="p-4 sm:p-5 flex justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-bold text-[#C6FF00] font-mono">
                      {item.quantity}x
                    </span>
                    <span className="text-sm font-bold text-white">
                      {item.name}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-xs text-[#8E8E93] leading-relaxed">
                      {item.description}
                    </p>
                  )}
                  {item.quantity > 1 && (
                    <span className="text-[11px] text-[#666666] font-mono block">
                      Unitário: {formatBRL(item.unitPrice)}
                    </span>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-white font-mono tabular-nums">
                    {formatBRL(item.total)}
                  </span>
                </div>
              </div>
            ))}

            {/* Total Highlight */}
            <div className="p-5 bg-[#171717] flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider block">
                  Investimento Total
                </span>
                <span className="text-[11px] text-[#8E8E93]">
                  Valores com material e instalação inclusos
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-[#C6FF00] font-mono tabular-nums">
                {formatBRL(proposal.totalValue)}
              </div>
            </div>
          </div>
        </div>

        {/* Commercial Conditions */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-[#121212] border border-[#222222] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <CreditCard className="w-3.5 h-3.5 text-[#C6FF00]" />
              <span>Pagamento</span>
            </div>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              {proposal.paymentTerms}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121212] border border-[#222222] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Clock className="w-3.5 h-3.5 text-[#C6FF00]" />
              <span>Prazo</span>
            </div>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              {proposal.deadlineDays}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#121212] border border-[#222222] space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Calendar className="w-3.5 h-3.5 text-[#C6FF00]" />
              <span>Validade</span>
            </div>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              {proposal.validityDays}
            </p>
          </div>
        </div>

        {/* Quality Seal */}
        {proposal.notes && (
          <div className="p-4 rounded-xl bg-[#121212] border border-[#222222] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#C6FF00] shrink-0 mt-0.5" />
            <div className="text-xs">
              <strong className="text-white block mb-0.5">Termos de Garantia:</strong>
              <p className="text-[#8E8E93] leading-relaxed">{proposal.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Bar on Mobile/Desktop */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0E0E0E]/95 backdrop-blur-md border-t border-[#222222] p-4 z-40">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleWhatsAppContact}
            className="flex-1 py-3 px-4 bg-[#1C1C1C] hover:bg-[#262626] active:scale-[0.98] border border-[#333333] text-white text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-[#C6FF00]" />
            <span>FALAR NO WHATSAPP</span>
          </button>

          <button
            type="button"
            onClick={handleAccept}
            disabled={proposal.status === 'aceita'}
            className="flex-1 py-3 px-4 bg-[#C6FF00] hover:bg-[#b2e600] active:scale-[0.98] disabled:opacity-60 text-black text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 fill-black text-[#C6FF00]" />
            <span>
              {proposal.status === 'aceita' ? 'PROPOSTA ACEITA' : 'ACEITAR PROPOSTA'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
