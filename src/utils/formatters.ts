/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function formatCurrency(amount: number, symbol: string = '৳'): string {
  if (isNaN(amount) || amount === null || amount === undefined) return `${symbol} 0`;
  const formatted = Math.round(amount).toLocaleString('en-IN');
  return `${symbol} ${formatted}`;
}

export function formatNumber(val: number): string {
  if (isNaN(val) || val === null || val === undefined) return '0';
  return val.toLocaleString('en-IN');
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function generateNextId(prefix: string, existingIds: string[]): string {
  let maxNum = 0;
  const regex = new RegExp(`^${prefix}-(\\d+)$`);
  for (const id of existingIds) {
    const match = id.match(regex);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }
  const nextNum = maxNum + 1;
  return `${prefix}-${nextNum.toString().padStart(3, '0')}`;
}
