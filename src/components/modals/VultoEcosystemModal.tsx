import React, { useState } from 'react';
import { Globe, Star, Zap, X, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useFlow } from '../../context/FlowContext';

export const VultoEcosystemModal: React.FC = () => {
  const { isVultoModalOpen, setIsVultoModalOpen } = useFlow();
  const [interestSent, setInterestSent] = useState<string | null>(null);

  if (!isVultoModalOpen) return null;

  const solutions = [
    {
      id: 'site',
      title: 'VULTO SITE',
      tagline: 'Fortaleça sua presença digital.',
      description:
        'Sites modernos, de alta conversão e ultra velozes projetados para transformar visitantes em mensagens no seu WhatsApp.',
      icon: Globe,
      badge: 'Presença Digital',
    },
    {
      id: 'tap',
      title: 'VULTO TAP',
      tagline: 'Transforme clientes satisfeitos em avaliações.',
      description:
        'Tecnologia de aproximação e links inteligentes para multiplicar suas avaliações 5 estrelas no Google Meu Negócio.',
      icon: Star,
      badge: 'Reputação & Google',
    },
    {
      id: 'performance',
      title: 'VULTO PERFORMANCE',
      tagline: 'Gere novas oportunidades para sua operação.',
      description:
        'Campanhas focadas em atrair contatos qualificados diretamente para o WhatsApp comercial da sua empresa.',
      icon: Zap,
      badge: 'Tráfego & Vendas',
    },
  ];

  const handleInterest = (title: string) => {
    setInterestSent(title);
    setTimeout(() => {
      setInterestSent(null);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-[#121212] border border-[#262626] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#222222]">
          <div>
            <span className="text-[11px] font-bold tracking-widest text-[#C6FF00] uppercase">
              Ecossistema Vulto
            </span>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Soluções integradas para o seu negócio
            </h2>
          </div>
          <button
            onClick={() => setIsVultoModalOpen(false)}
            className="text-[#8E8E93] hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List of solutions */}
        <div className="p-6 space-y-4">
          {interestSent && (
            <div className="p-3 bg-[#C6FF00]/10 border border-[#C6FF00]/30 rounded-lg flex items-center gap-2 text-xs text-[#C6FF00]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Interesse registrado em <strong>{interestSent}</strong>! Um consultor VULTO entrará em contato.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {solutions.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-[#171717] border border-[#262626] flex flex-col justify-between hover:border-[#333333] transition-colors"
                >
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-lg bg-[#222222] flex items-center justify-center text-[#C6FF00]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#C6FF00] mt-0.5">
                        {item.tagline}
                      </p>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-2 border-t border-[#222222]">
                    <button
                      type="button"
                      onClick={() => handleInterest(item.title)}
                      className="w-full py-2 px-3 text-xs font-semibold text-white bg-[#222222] hover:bg-[#C6FF00] hover:text-black rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span>CONHECER</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#171717] border-t border-[#222222] text-xs text-[#8E8E93]">
          <span>VULTO FLOW · Parte do ecossistema comercial VULTO</span>
          <button
            type="button"
            onClick={() => setIsVultoModalOpen(false)}
            className="text-white hover:underline"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
