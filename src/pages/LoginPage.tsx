import React, { useState } from 'react';
import { ArrowRight, Lock, Mail, User, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { useFlow } from '../context/FlowContext';
import { isSupabaseConfigured, saveDevSupabaseConfig } from '../lib/supabase';

export const LoginPage: React.FC = () => {
  const { signIn, signUp } = useAuth();
  const { hasCompany, loading: companyLoading } = useCompany();
  const { navigateTo } = useFlow();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Quick dev setup states if env vars are missing
  const [showDevSetup, setShowDevSetup] = useState(false);
  const [devUrl, setDevUrl] = useState('');
  const [devKey, setDevKey] = useState('');

  const handleToggleMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMessage('Por favor, informe seu nome completo.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('As senhas não coincidem.');
        return;
      }

      setLoading(true);
      const res = await signUp(fullName, email, password);
      setLoading(false);

      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setSuccessMessage('Conta criada com sucesso! Se necessário, confirme o e-mail enviado ou faça login.');
        // If session was created right away, AppRouter will automatically handle redirection
      }
    } else {
      if (!email.trim() || !password) {
        setErrorMessage('Informe seu e-mail e senha.');
        return;
      }

      setLoading(true);
      const res = await signIn(email, password);
      setLoading(false);

      if (res.error) {
        setErrorMessage(res.error);
      }
      // On success, AppRouter handles redirect checking membership
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center items-center px-4 sm:px-6 py-12 antialiased selection:bg-[#C6FF00] selection:text-black">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-black border border-[#2A2A2A] flex items-center justify-center font-black text-[#C6FF00] text-lg">
              V
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              VULTO <span className="text-[#C6FF00]">FLOW</span>
            </span>
          </div>

          <div className="pt-1">
            <h1 className="text-2xl font-black text-white tracking-tight leading-snug">
              Seu WhatsApp vende.<br />
              <span className="text-[#C6FF00]">O Flow organiza.</span>
            </h1>
            <p className="text-xs text-[#8E8E93] mt-1.5">
              Organize clientes, orçamentos e vendas sem complicação.
            </p>
          </div>
        </div>

        {/* Missing Supabase Config Notice in Dev */}
        {!isSupabaseConfigured && (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-600/40 text-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Configuração do Supabase pendente</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              Para conectar e autenticar, defina as variáveis no arquivo <code className="bg-black/50 px-1 py-0.5 rounded text-amber-300 font-mono">.env.local</code>:
            </p>
            <div className="bg-black/60 p-2.5 rounded-xl font-mono text-[10px] text-amber-300/90 overflow-x-auto space-y-1">
              <div>VITE_SUPABASE_URL="https://seu-projeto.supabase.co"</div>
              <div>VITE_SUPABASE_PUBLISHABLE_KEY="sua-chave-anon"</div>
            </div>
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowDevSetup(!showDevSetup)}
                className="text-[11px] text-[#C6FF00] hover:underline font-semibold cursor-pointer"
              >
                {showDevSetup ? 'Ocultar configuração rápida' : 'Configurar credenciais pelo navegador →'}
              </button>
            </div>
            {showDevSetup && (
              <div className="pt-2 space-y-2 border-t border-amber-800/30">
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={devUrl}
                  onChange={(e) => setDevUrl(e.target.value)}
                  className="w-full bg-[#181818] border border-amber-700/50 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-amber-200/40"
                />
                <input
                  type="password"
                  placeholder="eyJhbGciOi... (Publishable / Anon key)"
                  value={devKey}
                  onChange={(e) => setDevKey(e.target.value)}
                  className="w-full bg-[#181818] border border-amber-700/50 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-amber-200/40"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (devUrl && devKey) saveDevSupabaseConfig(devUrl, devKey);
                  }}
                  className="w-full py-1.5 rounded-lg bg-amber-400 text-black font-bold text-xs cursor-pointer"
                >
                  Salvar no Navegador e Recarregar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Auth Card */}
        <div className="p-6 rounded-2xl bg-[#121212] border border-[#222222] shadow-2xl space-y-4">
          {/* Segmented Mode Selector */}
          <div className="grid grid-cols-2 p-1 bg-[#181818] rounded-xl border border-[#262626]">
            <button
              type="button"
              onClick={() => handleToggleMode('login')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-[#C6FF00] text-black shadow-sm'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              ENTRAR
            </button>
            <button
              type="button"
              onClick={() => handleToggleMode('signup')}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#C6FF00] text-black shadow-sm'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              CRIAR CONTA
            </button>
          </div>

          {/* Error & Success Feedback */}
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-xs text-red-300 flex items-start gap-2 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 rounded-xl bg-[#C6FF00]/10 border border-[#C6FF00]/40 text-xs text-[#C6FF00] flex items-start gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name for Signup */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Carlos Silva"
                    className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1">
                E-mail *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00] transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#8E8E93]">
                  Senha *
                </label>
                {mode === 'login' && (
                  <span className="text-[11px] text-[#666666]">
                    Mínimo 6 caracteres
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00] transition-colors"
                />
              </div>
            </div>

            {/* Confirm Password for Signup */}
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#666666] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-[#555555] focus:outline-hidden focus:border-[#C6FF00] transition-colors"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-[#C6FF00] hover:bg-[#b2e600] active:scale-[0.98] disabled:opacity-60 text-black font-extrabold text-xs tracking-wider transition-all shadow-md flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>{mode === 'signup' ? 'CRIANDO CONTA...' : 'ENTRANDO...'}</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'CRIAR CONTA' : 'ENTRAR'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <div className="text-center">
          <p className="text-[11px] text-[#666666]">
            Ambiente seguro com RLS multiempresa e criptografia Supabase.
          </p>
        </div>
      </div>
    </div>
  );
};
