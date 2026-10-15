import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FlowClient } from '../types/database';
import { useCompany } from '../context/CompanyContext';

export function useClients() {
  const [clients, setClients] = useState<FlowClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { company } = useCompany();

  useEffect(() => {
    if (!company) {
      setLoading(false);
      return;
    }

    async function fetchClients() {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('flow_clients')
          .select('*')
          .eq('company_id', company!.id)
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        setClients(data || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchClients();
  }, [company]);

  return { clients, loading, error };
}
