import React, { useState } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useFlow } from '../../context/FlowContext';
import { LostReasonOption } from '../../types';
import { formatBRL } from '../../utils/formatters';

const REASON_OPTIONS: LostReasonOption[] = [
  'Preço',
  'Escolheu concorrente',
  'Parou de responder',
  'Adiou o projeto',
  'Outro',
];

export const VendaPerdidaModal: React.FC = () => {
  const { losingClient, setLosingClient, changeClientStatus } = useFlow();
  const [selectedReason, setSelectedReason] = useState<LostReasonOption>('Preço');
  const [customNote, setCustomNote] = useState('');

  if (!losingClient) return null;

  const handleConfirm = () => {
    const finalReason = selectedReason === 'Outro' && customNote.trim() ? customNote : selectedReason;
    changeClientStatus(losingClient.id, 'perdido', finalReason);
    setLosingClient(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#121212] border border-[#262626] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#222222]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-white">Marcar como Venda Perdida</h3>
          </div>
          <button
            onClick={() => setLosingClient(null)}
            className="text-[#8E8E93] hover:text-white transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3 bg-[#171717] rounded-lg border border-[#222222] text-xs">
            <span className="text-[#8E8E93]">Cliente: </span>
            <span className="text-white font-medium">{losingClient.name}</span>
            <span className="text-[#8E8E93] ml-2">· Valor: </span>
            <span className="text-white font-mono tabular-nums">{formatBRL(losingClient.value)}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#8E8E93] mb-2 uppercase tracking-wider">
              Qual foi o motivo principal?
            </label>
            <div className="space-y-1.5">
              {REASON_OPTIONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full py-2.5 px-3 rounded-lg text-left text-xs font-medium transition-colors border flex items-center justify-between ${
                    selectedReason === reason
                      ? 'bg-red-500/10 border-red-500/50 text-white'
                      : 'bg-[#171717] border-[#262626] text-[#8E8E93] hover:text-white'
                  }`}
                >
                  <span>{reason}</span>
                  {selectedReason === reason && (
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {selectedReason === 'Outro' && (
            <div>
              <label className="block text-xs font-medium text-[#8E8E93] mb-1">
                Especifique o motivo:
              </label>
              <input
                type="text"
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Ex: Mudou de cidade, não tem urgência..."
                className="w-full bg-[#0A0A0A] border border-[#262626] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-red-500"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#171717] border-t border-[#222222]">
          <button
            type="button"
            onClick={() => setLosingClient(null)}
            className="px-4 py-2 text-xs font-medium text-[#8E8E93] hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] rounded-lg transition-all shadow-sm cursor-pointer"
          >
            Confirmar perda
          </button>
        </div>
      </div>
    </div>
  );
};
