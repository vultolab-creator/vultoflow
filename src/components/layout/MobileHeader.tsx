import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Kanban,
  FileSpreadsheet,
  FileText,
  Settings,
  Plus,
  Sparkles,
  Menu,
  X,
  LogOut,
  UserPlus,
} from 'lucide-react';
import { useFlow } from '../../context/FlowContext';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';

export const MobileHeader: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    setIsNewClientModalOpen,
    setIsVultoModalOpen,
    metrics,
  } = useFlow();
  const { user, profile, signOut } = useAuth();
  const { company } = useCompany();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNewActionOpen, setIsNewActionOpen] = useState(false);

  const mainTabs = [
    { id: '/hoje', label: 'Hoje', icon: Calendar },
    { id: '/clientes', label: 'Clientes', icon: Users },
    { id: '/vendas', label: 'Vendas', icon: Kanban },
    { id: '/orcamentos', label: 'Orçamentos', icon: FileSpreadsheet },
  ];

  return (
    <>
      {/* Top Mobile Bar - strictly hidden on md+ (tablets & desktop) */}
      <header className="md:hidden sticky top-0 z-30 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-[#1C1C1C] px-4 py-3 flex items-center justify-between">
        <div
          onClick={() => navigateTo('/hoje')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-7 h-7 rounded-md bg-black border border-[#262626] flex items-center justify-center font-bold text-[#C6FF00] text-xs">
            V
          </div>
          <span className="text-sm font-extrabold tracking-tight text-white">
            VULTO <span className="text-[#C6FF00]">FLOW</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Unified + NOVO for Mobile */}
          <button
            type="button"
            onClick={() => setIsNewActionOpen(!isNewActionOpen)}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-[#C6FF00] text-black text-xs font-bold active:scale-[0.97] transition-transform"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>NOVO</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg bg-[#171717] text-[#8E8E93] hover:text-white transition-colors"
            aria-label="Menu"
          >
            {isMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile + NOVO Action Sheet */}
      {isNewActionOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-xs flex items-end justify-center p-4"
          onClick={() => setIsNewActionOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 space-y-2 animate-in slide-in-from-bottom-6 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#222222]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8E8E93]">
                O que você quer criar?
              </span>
              <button
                onClick={() => setIsNewActionOpen(false)}
                className="text-[#8E8E93] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsNewActionOpen(false);
                setIsNewClientModalOpen(true);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#1C1C1C] hover:bg-[#262626] text-white text-xs font-semibold text-left transition-colors"
            >
              <UserPlus className="w-4 h-4 text-[#C6FF00]" />
              <div>
                <div className="text-white font-bold">Novo contato</div>
                <div className="text-[11px] text-[#8E8E93]">Cadastrar quem acabou de chamar</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setIsNewActionOpen(false);
                navigateTo('/orcamentos');
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#1C1C1C] hover:bg-[#262626] text-white text-xs font-semibold text-left transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#C6FF00]" />
              <div>
                <div className="text-white font-bold">Novo orçamento</div>
                <div className="text-[11px] text-[#8E8E93]">Gerar proposta com itens e valor</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu for extra sections */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/90 backdrop-blur-md pt-16 p-6 space-y-5 animate-in fade-in duration-150">
          <div className="p-3.5 rounded-xl bg-[#141414] border border-[#222222]">
            <div className="text-xs font-bold text-white">{company?.name || 'Minha Empresa'}</div>
            <div className="text-[11px] text-[#8E8E93]">
              {profile?.full_name || company?.responsible_name || user?.email || 'Usuário'}
              {company?.whatsapp ? ` · ${company.whatsapp}` : ''}
            </div>
          </div>

          <div className="space-y-1.5">
            <button
              onClick={() => {
                navigateTo('/propostas');
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#171717] hover:bg-[#222222] text-white text-xs font-semibold transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-4 h-4 text-[#C6FF00]" />
                <span>Propostas Digitais</span>
              </div>
            </button>

            <button
              onClick={() => {
                navigateTo('/configuracoes');
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-[#171717] hover:bg-[#222222] text-white text-xs font-semibold transition-colors"
            >
              <Settings className="w-4 h-4 text-[#C6FF00]" />
              <span>Configurações & Planos</span>
            </button>

            <button
              onClick={() => {
                setIsVultoModalOpen(true);
                setIsMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-[#171717] hover:bg-[#222222] text-white text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#C6FF00]" />
              <span>Soluções VULTO</span>
            </button>
          </div>

          <div className="pt-4 border-t border-[#222222]">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-red-950/20 border border-red-900/30 text-red-400 text-xs font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair da conta</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Sticky Tab Bar - strictly hidden on md+ (tablet and desktop) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#0D0D0D]/95 backdrop-blur-md border-t border-[#1C1C1C] flex items-center justify-around py-2 px-1">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentRoute === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigateTo(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 text-[11px] font-semibold transition-colors ${
                isActive ? 'text-[#C6FF00]' : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
