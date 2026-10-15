import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { FlowOpportunity } from '../types/database';
import { useCompany } from '../context/CompanyContext';

export function useOpportunities() {
  const [opportunities, setOpportunities] = useState<FlowOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { company } = useCompany();

  useEffect(() => {
    if (!company) {
      setLoading(false);
      return;
    }

    async function fetchOpportunities() {
      try {
        setLoading(true);
        const { data, error: supabaseError } = await supabase
          .from('flow_opportunities')
          .select('*, client:flow_clients(*)')
          .eq('company_id', company!.id)
          .order('created_at', { ascending: false });

        if (supabaseError) throw supabaseError;
        setOpportunities(data || []);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOpportunities();
  }, [company]);

  return { opportunities, loading, error };
}
