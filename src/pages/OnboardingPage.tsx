import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, ArrowLeft, Sparkles, Building, Phone, Palette, Loader2, AlertCircle } from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';

export const OnboardingPage: React.FC = () => {
  const { navigateTo } = useFlow();
  const { profile, user } = useAuth();
  const { createCompanyViaRpc, hasCompany } = useCompany();

  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState('');
  const [responsibleName, setResponsibleName] = useState('');
  const [phone, setPhone] = useState('');
  const [segment, setSegment] = useState('');
  const [brandColor, setBrandColor] = useState('#C6FF00');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill responsible name from authenticated profile
  useEffect(() => {
    if (profile?.full_name && !responsibleName) {
      setResponsibleName(profile.full_name);
    }
  }, [profile, responsibleName]);

  // If user already has a company, redirect to /hoje
  useEffect(() => {
    if (hasCompany) {
      navigateTo('/hoje');
    }
  }, [hasCompany, navigateTo]);

  const colorPresets = [
    { label: 'Acid Lime (Vulto)', value: '#C6FF00' },
    { label: 'Cyan High-Tech', value: '#00F0FF' },
    { label: 'Emerald Trust', value: '#10B981' },
    { label: 'Amber Solar', value: '#F59E0B' },
  ];

  const handleNext = async () => {
    setErrorMessage('');

    if (step === 1) {
      if (!companyName.trim() || !responsibleName.trim()) {
        setErrorMessage('Informe o nome da empresa e o nome do responsável.');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      setStep(3);
      return;
    }

    if (step === 3) {
      setStep(4);
      return;
    }

    // Step 4: Finalize onboarding and call RPC flow_create_company
    if (step === 4) {
      if (isSubmitting) return;

      setIsSubmitting(true);
      const res = await createCompanyViaRpc({
        name: companyName,
        responsible_name: responsibleName,
        whatsapp: phone,
        segment: segment,
      });

      if (!res.success) {
        setIsSubmitting(false);
        setErrorMessage(res.error || 'Não foi possível criar a empresa. Tente novamente.');
      } else {
        // Redirection to /hoje will occur automatically via effect once company loads
        navigateTo('/hoje');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col justify-center items-center px-4 sm:px-6 py-12 antialiased selection:bg-[#C6FF00] selection:text-black">
      <div className="w-full max-w-md space-y-6">
        {/* Step Indicator */}
        <div className="flex items-center justify-between text-xs font-mono text-[#8E8E93]">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">VULTO FLOW</span>
            <span>·</span>
            <span>Passo {step} de 4</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step
                    ? 'w-6 bg-[#C6FF00]'
                    : i < step
                    ? 'w-3 bg-white'
                    : 'w-3 bg-[#262626]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="p-8 rounded-2xl bg-[#121212] border border-[#222222] shadow-2xl space-y-6">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#C6FF00] uppercase tracking-wider">
                  Passo 1
                </span>
                <h2 className="text-xl font-black text-white">
                  Qual é a sua empresa?
                </h2>
                <p className="text-xs text-[#8E8E93]">
                  Esses dados aparecerão no topo dos seus orçamentos e propostas.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Vidro Prime, Oficina São Paulo..."
                    className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1">
                    Nome do Responsável *
                  </label>
                  <input
                    type="text"
                    required
                    value={responsibleName}
                    onChange={(e) => setResponsibleName(e.target.value)}
                    placeholder="Ex: Rafael Mendes"
                    className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#C6FF00] uppercase tracking-wider">
                  Passo 2
                </span>
                <h2 className="text-xl font-black text-white">
                  Contato e Segmento
                </h2>
                <p className="text-xs text-[#8E8E93]">
                  Seus clientes falarão direto com você através deste WhatsApp.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1">
                    WhatsApp Comercial
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98741-2030"
                    className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1">
                    Segmento de Atuação
                  </label>
                  <input
                    type="text"
                    value={segment}
                    onChange={(e) => setSegment(e.target.value)}
                    placeholder="Ex: Vidraçaria, Móveis planejados, Marmoraria..."
                    className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-[#C6FF00] uppercase tracking-wider">
                  Passo 3
                </span>
                <h2 className="text-xl font-black text-white">
                  Identidade Visual
                </h2>
                <p className="text-xs text-[#8E8E93]">
                  Escolha o destaque das suas propostas digitais (opcional).
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93]">
                  Cor de destaque da proposta
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {colorPresets.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setBrandColor(c.value)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                        brandColor === c.value
                          ? 'border-[#C6FF00] bg-[#181818]'
                          : 'border-[#262626] bg-[#141414] text-[#8E8E93]'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-black/40"
                        style={{ backgroundColor: c.value }}
                      />
                      <span className="text-xs font-medium text-white">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 text-center animate-in fade-in duration-150 py-2">
              <div className="w-14 h-14 rounded-full bg-[#C6FF00]/15 text-[#C6FF00] border border-[#C6FF00]/30 flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-white">
                  Tudo pronto.
                </h2>
                <p className="text-xs text-[#8E8E93] mt-1.5 max-w-xs mx-auto leading-relaxed">
                  Sua empresa será registrada no Flow. Comece a organizar clientes e orçamentos agora mesmo.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#181818] border border-[#222222] text-xs text-left space-y-1">
                <div className="flex justify-between py-1">
                  <span className="text-[#8E8E93]">Empresa:</span>
                  <span className="text-white font-bold">{companyName}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-[#8E8E93]">Responsável:</span>
                  <span className="text-white font-medium">{responsibleName}</span>
                </div>
                {phone && (
                  <div className="flex justify-between py-1">
                    <span className="text-[#8E8E93]">WhatsApp:</span>
                    <span className="text-white font-mono">{phone}</span>
                  </div>
                )}
                {segment && (
                  <div className="flex justify-between py-1">
                    <span className="text-[#8E8E93]">Segmento:</span>
                    <span className="text-white">{segment}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            {step > 1 && step < 4 && !isSubmitting ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="py-2.5 px-4 rounded-xl text-xs font-semibold text-[#8E8E93] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleNext}
              className="py-3 px-6 rounded-xl bg-[#C6FF00] hover:bg-[#b2e600] active:scale-[0.98] disabled:opacity-60 text-black font-extrabold text-xs tracking-wider transition-all shadow-md flex items-center gap-2 ml-auto cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Preparando seu Flow...</span>
                </>
              ) : (
                <>
                  <span>{step === 4 ? 'IR PARA O FLOW' : 'CONTINUAR'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
