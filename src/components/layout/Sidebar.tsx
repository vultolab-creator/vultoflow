import React from 'react';
import {
  Calendar,
  Users,
  Kanban,
  FileSpreadsheet,
  FileText,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { useFlow } from '../../context/FlowContext';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';

export const Sidebar: React.FC = () => {
  const {
    currentRoute,
    navigateTo,
    setIsVultoModalOpen,
    metrics,
  } = useFlow();
  const { user, profile, signOut } = useAuth();
  const { company } = useCompany();

  const navItems = [
    {
      id: '/hoje',
      label: 'HOJE',
      icon: Calendar,
      badge: metrics.clientesParaChamarCount > 0 ? metrics.clientesParaChamarCount : null,
      badgeColor: 'bg-[#C6FF00] text-black',
    },
    {
      id: '/clientes',
      label: 'CLIENTES',
      icon: Users,
      badge: null,
    },
    {
      id: '/vendas',
      label: 'VENDAS',
      icon: Kanban,
      badge: null,
    },
    {
      id: '/orcamentos',
      label: 'ORÇAMENTOS',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: '/propostas',
      label: 'PROPOSTAS',
      icon: FileText,
      badge: null,
    },
  ];

  return (
    <aside className="w-60 lg:w-64 bg-[#0D0D0D] border-r border-[#1C1C1C] flex flex-col justify-between shrink-0 select-none">
      {/* Top brand header */}
      <div>
        <div className="p-4 lg:p-5 border-b border-[#1C1C1C] flex items-center justify-between">
          <button
            onClick={() => navigateTo('/hoje')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-8 h-8 rounded-lg bg-black border border-[#262626] flex items-center justify-center font-black tracking-tighter text-[#C6FF00] text-base group-hover:border-[#C6FF00]/50 transition-colors">
              V
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-white group-hover:text-[#C6FF00] transition-colors">
                  VULTO
                </span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-xs bg-[#C6FF00] text-black tracking-wider uppercase">
                  FLOW
                </span>
              </div>
              <p className="text-[10px] text-[#8E8E93] tracking-wide">
                Controle comercial
              </p>
            </div>
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-colors ${
                  isActive
                    ? 'bg-[#1C1C1C] text-white border-l-2 border-[#C6FF00]'
                    : 'text-[#8E8E93] hover:text-white hover:bg-[#141414]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#C6FF00]' : 'text-[#8E8E93]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                      item.badgeColor || 'bg-[#222222] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="border-t border-[#1C1C1C]" />
        </div>

        {/* Ecosystem Vulto (Discrete) */}
        <div className="px-3">
          <button
            type="button"
            onClick={() => setIsVultoModalOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#8E8E93] hover:text-white hover:bg-[#141414] transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C6FF00] group-hover:rotate-12 transition-transform" />
              <span>SOLUÇÕES VULTO</span>
            </div>
            <ChevronRight className="w-3 h-3 text-[#555555] group-hover:text-white" />
          </button>
        </div>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="border-t border-[#1C1C1C]" />
        </div>

        {/* Settings link */}
        <div className="px-3">
          <button
            type="button"
            onClick={() => navigateTo('/configuracoes')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-colors ${
              currentRoute === '/configuracoes'
                ? 'bg-[#1C1C1C] text-white border-l-2 border-[#C6FF00]'
                : 'text-[#8E8E93] hover:text-white hover:bg-[#141414]'
            }`}
          >
            <Settings
              className={`w-4 h-4 ${
                currentRoute === '/configuracoes' ? 'text-[#C6FF00]' : 'text-[#8E8E93]'
              }`}
            />
            <span>CONFIGURAÇÕES</span>
          </button>
        </div>
      </div>

      {/* Footer / Account card */}
      <div className="p-3 border-t border-[#1C1C1C]">
        <div className="p-3 rounded-lg bg-[#141414] border border-[#222222] flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <div className="text-xs font-bold text-white truncate">
              {company?.name || 'Minha Empresa'}
            </div>
            <div className="text-[11px] text-[#8E8E93] truncate">
              {profile?.full_name || company?.responsible_name || user?.email || 'Usuário'}
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sair do Flow"
            className="text-[#8E8E93] hover:text-red-400 p-1.5 rounded-md hover:bg-[#1C1C1C] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
