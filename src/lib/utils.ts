import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from 'date-fns';
import { db } from "@/db";
import { serviceOrders } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(numAmount);
}

export function formatCurrencyWithType(amount: number | string, currencyType: 'USD' | 'EUR' = 'USD'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (currencyType === 'EUR') {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
    }).format(numAmount);
  }
  
  // Default to USD
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(numAmount);
}

export function getCurrencySymbol(currencyType: 'USD' | 'EUR' = 'USD'): string {
  return currencyType === 'EUR' ? '€' : '$';
}

export function formatPercentage(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
}

export function formatEventDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'PPP');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
}

export function encodedRedirect(
  type: "error" | "success",
  path: string,
  message: string,
) {
  return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

export const formatCurrency2 = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount);
};

export function formatDate(date: Date) {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) {
    return 'Invalid Date';
  }
  return new Intl.DateTimeFormat('es-VE', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export async function generateOrderCode(): Promise<number> {
  try {
    const result = await db.execute(
      sql`SELECT MAX(order_code) AS last_code FROM service_orders`
    );
    
    const lastCode = Number(result.rows[0]?.last_code) || 0;
    return lastCode + 1;
  } catch (error) {
    console.error("Error generating order code:", error);
    return Math.floor(Date.now() / 1000);
  }
}

export function formatOrderCode(code: number): string {
  if (!code) return "N/A";
  return `OS-${String(code).padStart(5, '0')}`;
}

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    return `+58${cleaned.slice(1)}`;
  }
  
  if (!cleaned.startsWith('+')) {
    return `+${cleaned}`;
  }
  
  return cleaned;
}

export function getStatusText(status: string): string {
  const statusMap: { [key: string]: string } = {
    PREORDER: "Pre-orden",
    PENDING: "Pendiente",
    ASSIGNED: "Asignada",
    IN_PROGRESS: "En Progreso",
    COMPLETED: "Completada",
    DELIVERED: "Entregada",
    CANCELLED: "Cancelada",
    APROBADO: "Aprobada",
    NO_APROBADO: "No Aprobada",
    PENDIENTE_AVISAR: "Pendiente Avisar",
    FACTURADO: "Presupuestada",
    ENTREGA_GENERADA: "Entrega Generada",
    GARANTIA_APLICADA: "Garantía Aplicada",
  };
  return statusMap[status] || status;
}

export function getStatusEmoji(status: string): string {
  const emojiMap: { [key: string]: string } = {
    PREORDER: "🟡",
    PENDING: "🟠",
    ASSIGNED: "🔵",
    IN_PROGRESS: "⚙️",
    COMPLETED: "✅",
    DELIVERED: "📦",
    CANCELLED: "❌",
    GARANTIA_APLICADA: "🛡️",
  };
  return emojiMap[status] || "ℹ️";
}

export function formatMultilineText(text: string, lineLength: number = 35): string {
  if (!text) return '';
  const words = text.split(' ');
  let lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + word).length > lineLength) {
      lines.push(currentLine.trim());
      currentLine = '';
    }
    currentLine += `${word} `;
  });

  lines.push(currentLine.trim());
  return lines.join('\n│ ');
}

// Currency conversion helpers
export function convertCurrency(
  amount: number,
  fromCurrency: 'USD' | 'EUR',
  toCurrency: 'USD' | 'EUR',
  exchangeRate: number
): number {
  if (fromCurrency === toCurrency) return amount;
  
  if (fromCurrency === 'USD' && toCurrency === 'EUR') {
    return amount * exchangeRate;
  } else if (fromCurrency === 'EUR' && toCurrency === 'USD') {
    return amount / exchangeRate;
  }
  
  return amount;
}

export function formatCurrencyForDisplay(
  amount: number,
  isEuro: boolean,
  exchangeRate: number = 1
): string {
  const convertedAmount = isEuro ? amount * exchangeRate : amount;
  const currency = isEuro ? 'EUR' : 'USD';
  const locale = isEuro ? 'es-ES' : 'es-VE';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
  }).format(convertedAmount);
}