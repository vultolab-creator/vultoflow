import React, { useState } from 'react';
import {
  Building2,
  Smartphone,
  Star,
  Users,
  Check,
  Zap,
  ExternalLink,
  MessageSquare,
  Shield,
  CreditCard,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';

export const ConfiguracoesPage: React.FC = () => {
  const { company, updateCompany, setIsWhatsAppConnectModalOpen } = useFlow();

  const [form, setForm] = useState({
    name: company.name,
    representativeName: company.representativeName,
    phone: company.phone,
    email: company.email,
    segment: company.segment,
    googleReviewUrl: company.googleReviewUrl,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Configurações
        </h1>
        <p className="text-sm text-[#8E8E93]">
          Ajuste as informações da sua empresa, mensagens rápidas e integrações.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-xl bg-[#C6FF00]/10 border border-[#C6FF00]/40 text-xs text-[#C6FF00] flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Dados da empresa salvos com sucesso!</span>
        </div>
      )}

      {/* WhatsApp Connected Conceptual Card */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] border border-[#262626] flex items-center justify-center text-[#C6FF00] shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Conecte seu WhatsApp ao Flow
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#222222] text-[#8E8E93]">
                  NÃO CONECTADO
                </span>
              </div>
              <p className="text-xs text-[#8E8E93] mt-1 leading-relaxed">
                Capture contatos que chegam no seu WhatsApp de forma automática e nunca mais perca um orçamento.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsWhatsAppConnectModalOpen(true)}
            className="py-2.5 px-4 bg-[#C6FF00] hover:bg-[#b2e600] text-black text-xs font-bold rounded-lg transition-colors shrink-0 shadow-sm"
          >
            CONECTAR WHATSAPP
          </button>
        </div>
      </div>

      {/* Company Profile Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-5"
      >
        <div className="flex items-center gap-2 border-b border-[#222222] pb-4">
          <Building2 className="w-4 h-4 text-[#C6FF00]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Dados da Empresa
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8E8E93] mb-1">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8E8E93] mb-1">
              Nome do Responsável
            </label>
            <input
              type="text"
              value={form.representativeName}
              onChange={(e) =>
                setForm({ ...form, representativeName: e.target.value })
              }
              className="w-full bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8E8E93] mb-1">
              WhatsApp da Empresa
            </label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8E8E93] mb-1">
              E-mail Comercial
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#8E8E93] mb-1">
              Segmento de Atuação
            </label>
            <input
              type="text"
              value={form.segment}
              onChange={(e) => setForm({ ...form, segment: e.target.value })}
              className="w-full bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#8E8E93] mb-1">
              Link de Avaliação Google (VULTO TAP)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={form.googleReviewUrl}
                onChange={(e) =>
                  setForm({ ...form, googleReviewUrl: e.target.value })
                }
                className="flex-1 bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
              />
              <button
                type="button"
                onClick={() => window.open(form.googleReviewUrl, '_blank')}
                className="p-2 rounded-lg bg-[#222222] text-[#8E8E93] hover:text-white"
                title="Testar link"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-[#666666] mt-1">
              Usado para pedir avaliações de 5 estrelas aos clientes assim que uma venda é fechada.
            </p>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="py-2.5 px-6 rounded-lg bg-[#C6FF00] hover:bg-[#b2e600] text-black text-xs font-bold transition-colors"
          >
            SALVAR ALTERAÇÕES
          </button>
        </div>
      </form>

      {/* Quick Message Templates Preview */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-4">
        <div className="flex items-center gap-2 border-b border-[#222222] pb-4">
          <MessageSquare className="w-4 h-4 text-[#C6FF00]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Modelos de Mensagens Prontas
          </h2>
        </div>

        <div className="space-y-3">
          <div className="p-3.5 rounded-lg bg-[#181818] border border-[#262626]">
            <span className="text-[11px] font-bold text-white block mb-1">
              MENSAGEM CURTA (Follow-up rápido)
            </span>
            <p className="text-xs text-[#8E8E93] italic">
              “Oi Carlos, tudo bem? Conseguiu analisar o orçamento que te enviei?”
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-[#181818] border border-[#262626]">
            <span className="text-[11px] font-bold text-white block mb-1">
              MENSAGEM CONSULTIVA (Suporte e dúvidas)
            </span>
            <p className="text-xs text-[#8E8E93] italic">
              “Oi Carlos, tudo bem? Passando para saber se conseguiu avaliar nossa proposta. Se ficou alguma dúvida ou quiser ajustar algum ponto, posso te ajudar por aqui.”
            </p>
          </div>
        </div>
      </div>

      {/* Team / Users (Em Breve) */}
      <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] space-y-3">
        <div className="flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#8E8E93]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Equipe e Vendedores
            </h2>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#222222] text-[#8E8E93]">
            EM BREVE
          </span>
        </div>
        <p className="text-xs text-[#8E8E93] leading-relaxed">
          Permita que outros vendedores ou atendentes acessem o Flow com permissões controladas. Disponível em breve no Flow Pro.
        </p>
      </div>

      {/* Plans Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Planos Flow
          </h2>
          <p className="text-xs text-[#8E8E93]">
            Estrutura simplificada sem contratos de longo prazo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plan 1 */}
          <div className="p-6 rounded-2xl bg-[#121212] border-2 border-[#C6FF00] space-y-4 relative">
            <span className="absolute top-4 right-4 text-[10px] font-bold bg-[#C6FF00] text-black px-2 py-0.5 rounded">
              PLANO ATUAL
            </span>
            <div>
              <h3 className="text-lg font-black text-white">VULTO FLOW</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  R$ 79,90
                </span>
                <span className="text-xs text-[#8E8E93]">/mês</span>
              </div>
            </div>
            <ul className="text-xs text-[#8E8E93] space-y-2">
              <li className="flex items-center gap-2 text-white">
                <Check className="w-3.5 h-3.5 text-[#C6FF00]" />
                Clientes e orçamentos ilimitados
              </li>
              <li className="flex items-center gap-2 text-white">
                <Check className="w-3.5 h-3.5 text-[#C6FF00]" />
                Propostas digitais com rastreio de visualização
              </li>
              <li className="flex items-center gap-2 text-white">
                <Check className="w-3.5 h-3.5 text-[#C6FF00]" />
                Mensagens rápidas no WhatsApp com 1 clique
              </li>
              <li className="flex items-center gap-2 text-white">
                <Check className="w-3.5 h-3.5 text-[#C6FF00]" />
                Board de vendas simplificado
              </li>
            </ul>
          </div>

          {/* Plan 2 */}
          <div className="p-6 rounded-2xl bg-[#121212] border border-[#262626] space-y-4">
            <div>
              <span className="text-[10px] font-bold text-[#C6FF00] tracking-wider uppercase">
                EM BREVE
              </span>
              <h3 className="text-lg font-black text-white">VULTO FLOW PRO</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                  R$ 129,90
                </span>
                <span className="text-xs text-[#8E8E93]">/mês</span>
              </div>
            </div>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              O Flow Pro será o plano com integração oficial de WhatsApp e recursos avançados de automação e equipe.
            </p>
            <ul className="text-xs text-[#8E8E93] space-y-2">
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#C6FF00]" />
                WhatsApp conectado via API oficial
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#C6FF00]" />
                Novos contatos automáticos sem digitação
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#C6FF00]" />
                Múltiplos usuários e atendentes
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-[#C6FF00]" />
                Automações de aviso quando o cliente abrir a proposta
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
