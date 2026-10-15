import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider, useCompany } from './context/CompanyContext';
import { FlowProvider, useFlow } from './context/FlowContext';
import { AppLayout } from './components/layout/AppLayout';
import { HojePage } from './pages/HojePage';
import { ClientesPage } from './pages/ClientesPage';
import { VendasPage } from './pages/VendasPage';
import { OrcamentosPage } from './pages/OrcamentosPage';
import { PropostasPage } from './pages/PropostasPage';
import { PublicProposalPage } from './pages/PublicProposalPage';
import { ConfiguracoesPage } from './pages/ConfiguracoesPage';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';

const AppRouter: React.FC = () => {
  const { currentRoute, routeParams } = useFlow();
  const { user, loading: authLoading } = useAuth();
  const { hasCompany, loading: companyLoading } = useCompany();

  // Public Proposal Page (no authentication needed)
  if (currentRoute.startsWith('/p/')) {
    const proposalId = routeParams.proposalId || currentRoute.replace('/p/', '');
    return <PublicProposalPage proposalId={proposalId} />;
  }

  // Loading state while restoring Supabase session or checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-black border border-[#2A2A2A] flex items-center justify-center font-black text-[#C6FF00] text-xl animate-pulse">
          V
        </div>
        <p className="text-xs font-mono text-[#8E8E93]">Carregando sessão...</p>
      </div>
    );
  }

  // Unauthenticated user -> Must log in
  if (!user) {
    return <LoginPage />;
  }

  // Authenticated, but waiting for company membership lookup
  if (companyLoading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-black border border-[#2A2A2A] flex items-center justify-center font-black text-[#C6FF00] text-xl animate-pulse">
          V
        </div>
        <p className="text-xs font-mono text-[#8E8E93]">Carregando empresa...</p>
      </div>
    );
  }

  // User has no company registered yet -> Must complete onboarding
  if (!hasCompany) {
    return <OnboardingPage />;
  }

  // User is authenticated and already has a company, but accessed /login or /onboarding
  if (currentRoute === '/login' || currentRoute === '/onboarding') {
    return (
      <AppLayout>
        <HojePage />
      </AppLayout>
    );
  }

  // Protected App Screens
  return (
    <AppLayout>
      {(() => {
        switch (currentRoute) {
          case '/hoje':
            return <HojePage />;
          case '/clientes':
            return <ClientesPage />;
          case '/vendas':
            return <VendasPage />;
          case '/orcamentos':
            return <OrcamentosPage />;
          case '/propostas':
            return <PropostasPage />;
          case '/configuracoes':
            return <ConfiguracoesPage />;
          default:
            return <HojePage />;
        }
      })()}
    </AppLayout>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <FlowProvider>
          <AppRouter />
        </FlowProvider>
      </CompanyProvider>
    </AuthProvider>
  );
}
