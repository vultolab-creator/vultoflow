export function formatBRL(value: number, showDecimals: boolean = false): string {
  if (isNaN(value) || value === null || value === undefined) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(value);
}

/**
 * Normalizes a phone string for wa.me.
 * For Brazil, guarantees: 55 + DDD + number (digits only).
 */
export function cleanPhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';

  // If already starts with 55 and has valid length (12 or 13 digits)
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits;
  }

  // If DDD + phone (10 digits for landline or 11 digits for mobile)
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }

  // Fallback if 8 or 9 digits without DDD, can't assume DDD but return digits
  return digits.startsWith('55') ? digits : `55${digits}`;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = cleanPhone(phone);
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${clean}?text=${encodedText}`;
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'novo':
      return 'Novo cliente';
    case 'orcamento_enviado':
      return 'Orçamento enviado';
    case 'negociando':
      return 'Em negociação';
    case 'fechado':
      return 'Venda fechada';
    case 'perdido':
      return 'Venda perdida';
    default:
      return status;
  }
}

/**
 * Calculates human-readable reason & time since contact or scheduled next contact
 */
export function getAttentionReason(nextContactAt?: string | null, lastInteractionAt?: string | null): string {
  const now = new Date();
  
  if (nextContactAt) {
    const nextDate = new Date(nextContactAt);
    const diffMs = now.getTime() - nextDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 0) {
      return 'Você marcou para chamar hoje.';
    }
    if (diffDays === 1) {
      return 'Você marcou para chamar ontem.';
    }
    return `Você marcou para chamar há ${diffDays} dias.`;
  }

  if (lastInteractionAt) {
    const lastDate = new Date(lastInteractionAt);
    const diffMs = now.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      return 'Contato realizado hoje.';
    }
    if (diffDays === 1) {
      return 'Último contato ontem.';
    }
    return `Sem contato há ${diffDays} dias.`;
  }

  return 'Novo contato aguardando retorno.';
}

export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDateShort(isoString?: string | null): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}
