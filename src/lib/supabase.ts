import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve Supabase credentials from Vite environment or dev localStorage fallback
const envUrl = import.meta.env.VITE_SUPABASE_URL;
const envKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

// Optional developer runtime fallback stored locally if env vars were not injected in host container
const localUrl = typeof window !== 'undefined' ? localStorage.getItem('vulto_flow_dev_supabase_url') : null;
const localKey = typeof window !== 'undefined' ? localStorage.getItem('vulto_flow_dev_supabase_key') : null;

export const supabaseUrl = (envUrl && envUrl !== 'https://your-project.supabase.co' ? envUrl : null) || localUrl || '';
export const supabaseKey = (envKey && envKey !== 'your-anon-or-publishable-key' ? envKey : null) || localKey || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseKey &&
  supabaseUrl.startsWith('http') &&
  supabaseKey.length > 10
);

export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : (createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: { persistSession: false },
    }) as SupabaseClient);

export function saveDevSupabaseConfig(url: string, key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vulto_flow_dev_supabase_url', url.trim());
    localStorage.setItem('vulto_flow_dev_supabase_key', key.trim());
    window.location.reload();
  }
}

export function clearDevSupabaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vulto_flow_dev_supabase_url');
    localStorage.removeItem('vulto_flow_dev_supabase_key');
    window.location.reload();
  }
}
