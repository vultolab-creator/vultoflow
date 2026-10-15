import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  FileText,
  Send,
  Eye,
  Check,
  Sparkles,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useFlow } from '../context/FlowContext';
import { formatBRL } from '../utils/formatters';
import { ProposalItem } from '../types';

export const OrcamentosPage: React.FC = () => {
  const { clients, createProposal, navigateTo, company } = useFlow();

  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || ''
  );
  const [customClientName, setCustomClientName] = useState('');
  const [customClientPhone, setCustomClientPhone] = useState('');
  const [service, setService] = useState('Envidraçamento de Sacada Retrátil');
  const [description, setDescription] = useState(
    'Sistema retrátil em vidro temperado 8mm com trilho embutido de alta vedação contra chuva e ruídos.'
  );

  const [items, setItems] = useState<ProposalItem[]>([
    {
      id: 'item-1',
      name: 'Box Elegance Vidro Temperado 8mm',
      description: '1 unidade com roldanas de latão e puxador tubular preto',
      quantity: 1,
      unitPrice: 1580,
      total: 1580,
    },
    {
      id: 'item-2',
      name: 'Instalação Técnica & Vedação Estanque',
      description: 'Mão de obra homologada com certificação de estanqueidade',
      quantity: 1,
      unitPrice: 350,
      total: 350,
    },
  ]);

  const [paymentTerms, setPaymentTerms] = useState(
    'Entrada de 40% + 4x sem juros no cartão de crédito ou 5% à vista no Pix'
  );
  const [deadlineDays, setDeadlineDays] = useState(
    '15 a 20 dias úteis após medição final'
  );
  const [validityDays, setValidityDays] = useState('10 dias');
  const [notes, setNotes] = useState(
    'Garantia de 5 anos nos perfis e vedação técnica.'
  );
  const [generatedProposalId, setGeneratedProposalId] = useState<string | null>(
    null
  );

  const totalValue = items.reduce((acc, curr) => acc + (curr.total || 0), 0);

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const handleAddItem = () => {
    const newItem: ProposalItem = {
      id: `item-${Date.now()}`,
      name: 'Item adicional sob medida',
      description: 'Especificação do material ou serviço',
      quantity: 1,
      unitPrice: 500,
      total: 500,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (
    id: string,
    field: keyof ProposalItem,
    val: string | number
  ) => {
    setItems(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'unitPrice') {
          const q =
            field === 'quantity' ? Number(val) : Number(item.quantity) || 1;
          const u =
            field === 'unitPrice' ? Number(val) : Number(item.unitPrice) || 0;
          updated.total = q * u;
        }
        return updated;
      })
    );
  };

  const handleGenerateProposal = (e: React.FormEvent) => {
    e.preventDefault();

    const clientName = selectedClient ? selectedClient.name : customClientName || 'Cliente';
    const clientPhone = selectedClient ? selectedClient.phone : customClientPhone || '(11) 99999-0000';

    const newProp = createProposal({
      clientId: selectedClientId || '',
      clientName,
      clientPhone,
      service,
      description,
      items,
      totalValue,
      paymentTerms,
      deadlineDays,
      validityDays,
      notes,
      status: 'enviada',
    });

    setGeneratedProposalId(newProp.id);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Novo Orçamento
        </h1>
        <p className="text-sm text-[#8E8E93]">
          Crie orçamentos elegantes em menos de 1 minuto e gere uma proposta digital para enviar no WhatsApp.
        </p>
      </div>

      {generatedProposalId && (
        <div className="p-5 rounded-xl bg-[#C6FF00]/10 border border-[#C6FF00]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in duration-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#C6FF00] text-black flex items-center justify-center font-bold">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Proposta gerada com sucesso!
              </h3>
              <p className="text-xs text-[#8E8E93]">
                Envie o link para o cliente no WhatsApp e veja em tempo real quando ele abrir.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigateTo(`/p/${generatedProposalId}`)}
              className="py-2 px-4 rounded-lg bg-[#C6FF00] text-black text-xs font-bold hover:bg-[#b2e600] transition-colors flex items-center gap-1.5"
            >
              <span>Abrir Proposta Pública</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => navigateTo('/propostas')}
              className="py-2 px-4 rounded-lg bg-[#222222] text-white text-xs font-semibold hover:bg-[#333333] transition-colors"
            >
              Ver Todas
            </button>
          </div>
        </div>
      )}

      {/* Grid: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <form
          onSubmit={handleGenerateProposal}
          className="lg:col-span-7 bg-[#121212] border border-[#222222] rounded-xl p-6 space-y-6 shadow-sm"
        >
          {/* Client Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1.5">
              Cliente *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-[#C6FF00]"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.service} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Service & Description */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1.5">
                Serviço Principal *
              </label>
              <input
                type="text"
                required
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="w-full bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 text-sm text-white focus:outline-hidden focus:border-[#C6FF00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1.5">
                Descrição do Projeto
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#C6FF00] resize-none leading-relaxed"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#8E8E93]">
                Itens do Orçamento
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-[#C6FF00] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Adicionar Item</span>
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-[#181818] border border-[#262626] space-y-2 relative"
                >
                  <div className="flex items-start justify-between gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleUpdateItem(item.id, 'name', e.target.value)
                      }
                      placeholder="Nome do produto/item"
                      className="flex-1 bg-transparent border-b border-[#333333] pb-1 text-xs font-bold text-white focus:outline-hidden focus:border-[#C6FF00]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[#666666] hover:text-red-400 transition-colors p-1"
                      title="Remover item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) =>
                      handleUpdateItem(item.id, 'description', e.target.value)
                    }
                    placeholder="Descrição / especificação"
                    className="w-full bg-transparent text-[11px] text-[#8E8E93] focus:outline-hidden"
                  />

                  <div className="grid grid-cols-3 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-[#8E8E93] block">Qtd</span>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleUpdateItem(
                            item.id,
                            'quantity',
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full bg-[#121212] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8E8E93] block">Unitário (R$)</span>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) =>
                          handleUpdateItem(
                            item.id,
                            'unitPrice',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full bg-[#121212] border border-[#2A2A2A] rounded px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8E8E93] block">Subtotal</span>
                      <div className="py-1 text-xs font-bold text-white font-mono tabular-nums">
                        {formatBRL(item.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="p-3 rounded-lg bg-[#181818] border border-[#262626] flex items-center justify-between">
              <span className="text-xs font-bold text-white">VALOR TOTAL</span>
              <span className="text-lg font-extrabold text-[#C6FF00] font-mono tabular-nums">
                {formatBRL(totalValue)}
              </span>
            </div>
          </div>

          {/* Payment Terms & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1">
                Forma de Pagamento
              </label>
              <input
                type="text"
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1">
                Prazo de Entrega
              </label>
              <input
                type="text"
                value={deadlineDays}
                onChange={(e) => setDeadlineDays(e.target.value)}
                className="w-full bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1">
                Validade da Proposta
              </label>
              <input
                type="text"
                value={validityDays}
                onChange={(e) => setValidityDays(e.target.value)}
                className="w-full bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#8E8E93] mb-1">
                Garantia / Observações
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-[#181818] border border-[#2A2A2A] rounded-lg px-3 py-2 text-xs text-white focus:outline-hidden focus:border-[#C6FF00]"
              />
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-[#C6FF00] hover:bg-[#b2e600] text-black font-extrabold text-xs tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-black" />
            <span>GERAR PROPOSTA DIGITAL</span>
          </button>
        </form>

        {/* Live Preview Column */}
        <div className="lg:col-span-5 sticky top-6 space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8E8E93] px-1">
            <span className="font-semibold uppercase tracking-wider">Preview da Proposta Digital</span>
            <span className="text-[11px] text-[#C6FF00]">Visualização do Cliente</span>
          </div>

          <div className="bg-[#141414] border border-[#262626] rounded-2xl p-6 shadow-xl space-y-5">
            {/* Business Header */}
            <div className="flex items-center justify-between border-b border-[#222222] pb-4">
              <div>
                <span className="text-xs font-black tracking-tight text-white block">
                  {company.name}
                </span>
                <span className="text-[11px] text-[#8E8E93]">{company.phone}</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-[#C6FF00] bg-[#C6FF00]/10 px-2 py-0.5 rounded">
                Orçamento
              </span>
            </div>

            {/* Client Info */}
            <div className="text-xs space-y-1">
              <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider block">
                Preparado para:
              </span>
              <p className="font-bold text-white">
                {selectedClient ? selectedClient.name : 'Cliente'}
              </p>
              <p className="text-[#8E8E93]">{service}</p>
            </div>

            {/* Items summary */}
            <div className="space-y-2 py-2 border-y border-[#222222]">
              {items.map((it) => (
                <div key={it.id} className="text-xs flex justify-between">
                  <div className="pr-2">
                    <span className="font-medium text-white block">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="text-[10px] text-[#8E8E93]">
                      {it.description}
                    </span>
                  </div>
                  <span className="font-mono text-white tabular-nums font-semibold shrink-0">
                    {formatBRL(it.total)}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-baseline justify-between pt-1">
              <span className="text-xs font-bold text-[#8E8E93]">TOTAL DO PROJETO</span>
              <span className="text-2xl font-black text-white font-mono tabular-nums">
                {formatBRL(totalValue)}
              </span>
            </div>

            {/* Terms */}
            <div className="p-3 rounded-lg bg-[#181818] text-[11px] text-[#8E8E93] space-y-1">
              <div><strong>Pagamento:</strong> {paymentTerms}</div>
              <div><strong>Prazo:</strong> {deadlineDays}</div>
              <div><strong>Validade:</strong> {validityDays}</div>
            </div>

            {/* Mock client CTA buttons */}
            <div className="space-y-2 pt-2">
              <div className="py-2.5 px-3 bg-[#C6FF00] text-black text-xs font-bold rounded-lg text-center opacity-90">
                ACEITAR PROPOSTA
              </div>
              <div className="py-2 px-3 bg-[#222222] text-white text-xs font-medium rounded-lg text-center">
                FALAR NO WHATSAPP
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
