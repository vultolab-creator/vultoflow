import React from 'react';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { WhatsAppCallModal } from '../modals/WhatsAppCallModal';
import { VendaFechadaModal } from '../modals/VendaFechadaModal';
import { VendaPerdidaModal } from '../modals/VendaPerdidaModal';
import { VultoEcosystemModal } from '../modals/VultoEcosystemModal';
import { WhatsAppConnectModal } from '../modals/WhatsAppConnectModal';
import { NewClientModal } from '../modals/NewClientModal';
import { NewOpportunityModal } from '../modals/NewOpportunityModal';
import { ClientDrawer } from '../clients/ClientDrawer';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0A0A0A] text-[#F4F4F1]">
      {/* Fixed sidebar for Tablet & Desktop (md and up) */}
      <div className="hidden md:flex h-full shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <MobileHeader />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          {children}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <WhatsAppCallModal />
      <VendaFechadaModal />
      <VendaPerdidaModal />
      <VultoEcosystemModal />
      <WhatsAppConnectModal />
      <NewClientModal />
      <NewOpportunityModal />
      <ClientDrawer />
    </div>
  );
};
