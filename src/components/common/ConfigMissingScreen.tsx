import React, { useState } from 'react';
import { Database, AlertTriangle, Key, ExternalLink, ArrowRight, Check } from 'lucide-react';
import { saveDevSupabaseConfig, supabaseUrl, supabaseKey } from '../../lib/supabase';

export const ConfigMissingScreen: React.FC = () => {
  const [url, setUrl] = useState(supabaseUrl || '');
  const [key, setKey] = useState(supabaseKey || '');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !key.trim()) {
      setErrorMsg('Por favor, informe a URL e a chave pública (anon/publishable key) do Supabase.');
      return;
    }
    if (!url.trim().startsWith('http')) {
      setErrorMsg('A URL do Supabase deve começar com https://');
      return;
    }
    saveDevSupabaseConfig(url, key);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F4F4F1] flex flex-col justify-center items-center px-4 sm:px-6 py-12 antialiased selection:bg-[#C6FF00] selection:text-black">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-black border border-[#2A2A2A] flex items-center justify-center font-black text-[#C6FF00] text-lg">
              V
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              VULTO <span className="text-[#C6FF00]">FLOW</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Conexão com o Supabase
          </h1>
          <p className="text-xs text-[#8E8E93] max-w-md mx-auto">
            Para ativar autenticação real, sessões persistentes e multiempresa, configure suas variáveis do Supabase.
          </p>
        </div>

        {/* Warning card */}
        <div className="p-6 rounded-2xl bg-[#121212] border border-[#262626] space-y-5 shadow-2xl">
          <div className="p-4 rounded-xl bg-[#1A1A1A] border border-[#2F2F2F] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#C6FF00] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="text-white block">Variáveis de ambiente pendentes</strong>
              <p className="text-[#8E8E93] leading-relaxed">
                As variáveis <code className="text-[#C6FF00] font-mono">VITE_SUPABASE_URL</code> e{' '}
                <code className="text-[#C6FF00] font-mono">VITE_SUPABASE_PUBLISHABLE_KEY</code> ainda não foram configuradas no arquivo <code className="text-white font-mono">.env</code>.
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-950/30 border border-red-800/40 text-xs text-red-300">
              {errorMsg}
            </div>
          )}

          {/* Quick paste form for runtime dev testing */}
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1.5">
                VITE_SUPABASE_URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1.5">
                VITE_SUPABASE_PUBLISHABLE_KEY (ou ANON KEY)
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#C6FF00] hover:bg-[#b2e600] active:scale-[0.98] text-black font-extrabold text-xs tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>CONECTAR AGORA</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Documentation instructions */}
          <div className="pt-2 border-t border-[#1C1C1C] text-[11px] text-[#8E8E93] space-y-1">
            <span className="font-semibold text-white block">Como configurar no arquivo .env:</span>
            <pre className="p-3 bg-[#0A0A0A] border border-[#222222] rounded-lg text-[11px] font-mono text-[#F4F4F1] overflow-x-auto">
{`VITE_SUPABASE_URL="https://seu-projeto.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-anon-publica"`}
            </pre>
            <p className="text-[10px] text-[#666666] pt-1">
              Segurança garantida: apenas chaves públicas do tipo <strong>anon</strong> devem ser utilizadas no frontend. Nunca utilize a <code>service_role</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
