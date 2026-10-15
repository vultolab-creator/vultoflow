import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { FlowCompany, FlowCompanyMember } from '../types/database';
import { useAuth } from './AuthContext';

interface CreateCompanyPayload {
  name: string;
  responsible_name: string;
  whatsapp: string;
  segment: string;
}

interface CompanyContextType {
  company: FlowCompany | null;
  membership: FlowCompanyMember | null;
  role: string | null;
  loading: boolean;
  hasCompany: boolean;
  refreshCompany: () => Promise<void>;
  createCompanyViaRpc: (payload: CreateCompanyPayload) => Promise<{ success: boolean; error?: string }>;
  updateCompanyDetails: (updates: Partial<FlowCompany>) => Promise<{ success: boolean; error?: string }>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const CompanyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [company, setCompany] = useState<FlowCompany | null>(null);
  const [membership, setMembership] = useState<FlowCompanyMember | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserCompany = useCallback(async (userId: string) => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch user membership in public.flow_company_members
      const { data: memberData, error: memberError } = await supabase
        .from('flow_company_members')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (memberError || !memberData) {
        setMembership(null);
        setCompany(null);
        setLoading(false);
        return;
      }

      setMembership(memberData as FlowCompanyMember);

      // 2. Fetch the corresponding company from public.flow_companies
      const { data: companyData, error: companyError } = await supabase
        .from('flow_companies')
        .select('*')
        .eq('id', memberData.company_id)
        .single();

      if (companyError || !companyData) {
        setCompany(null);
      } else {
        setCompany(companyData as FlowCompany);
      }
    } catch {
      setCompany(null);
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserCompany(user.id);
    } else {
      setCompany(null);
      setMembership(null);
      setLoading(false);
    }
  }, [user, fetchUserCompany]);

  const refreshCompany = async () => {
    if (user) {
      await fetchUserCompany(user.id);
    }
  };

  /**
   * Calls the existing database RPC:
   * public.flow_create_company(p_name text, p_responsible_name text, p_whatsapp text, p_segment text)
   * This creates the company, associates the authenticated user, and sets role = 'owner'.
   */
  const createCompanyViaRpc = async (
    payload: CreateCompanyPayload
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !user) {
      return { success: false, error: 'Usuário não autenticado ou Supabase desconectado.' };
    }

    try {
      const { data, error } = await supabase.rpc('flow_create_company', {
        p_name: payload.name.trim(),
        p_responsible_name: payload.responsible_name.trim(),
        p_whatsapp: payload.whatsapp.trim(),
        p_segment: payload.segment.trim(),
      });

      if (error) {
        return { success: false, error: error.message || 'Erro ao criar empresa.' };
      }

      // Refresh company state immediately
      await fetchUserCompany(user.id);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: (err as { message?: string }).message || 'Falha ao executar criação da empresa.',
      };
    }
  };

  /**
   * Updates company details in public.flow_companies respecting RLS
   */
  const updateCompanyDetails = async (
    updates: Partial<FlowCompany>
  ): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured || !company) {
      return { success: false, error: 'Nenhuma empresa ativa selecionada.' };
    }

    try {
      const { error } = await supabase
        .from('flow_companies')
        .update(updates)
        .eq('id', company.id);

      if (error) {
        return { success: false, error: error.message || 'Erro ao atualizar dados da empresa.' };
      }

      // Update local state
      setCompany((prev) => (prev ? { ...prev, ...updates } : null));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: (err as { message?: string }).message || 'Falha na atualização.',
      };
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        company,
        membership,
        role: membership?.role ?? null,
        loading,
        hasCompany: Boolean(company),
        refreshCompany,
        createCompanyViaRpc,
        updateCompanyDetails,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
};

export const useCompany = (): CompanyContextType => {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany must be used within a CompanyProvider');
  }
  return context;
};
