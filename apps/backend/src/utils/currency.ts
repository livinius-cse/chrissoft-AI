/**
 * Authoritative Indian Currency (INR) and GST Utility (Backend & Tests)
 */

export interface GSTBreakdown {
  netTaxableAmount: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  grandTotal: number;
}

/**
 * Calculates authoritative GST breakdown with 2-decimal paise precision.
 */
export function calculateGSTBreakdown(
  subtotal: number,
  discount: number = 0,
  taxRate: number = 18,
  isInterState: boolean = false
): GSTBreakdown {
  const safeSubtotal = Math.max(0, Number(subtotal) || 0);
  const safeDiscount = Math.max(0, Math.min(safeSubtotal, Number(discount) || 0));
  const netTaxableAmount = Math.round((safeSubtotal - safeDiscount) * 100) / 100;
  const safeTaxRate = Math.max(0, Number(taxRate) || 0);

  if (safeTaxRate === 0 || netTaxableAmount === 0) {
    return {
      netTaxableAmount,
      cgstRate: 0,
      sgstRate: 0,
      igstRate: 0,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount: 0,
      totalTax: 0,
      grandTotal: netTaxableAmount,
    };
  }

  if (isInterState) {
    const igstRate = safeTaxRate;
    const igstAmount = Math.round((netTaxableAmount * (igstRate / 100)) * 100) / 100;
    const grandTotal = Math.round((netTaxableAmount + igstAmount) * 100) / 100;

    return {
      netTaxableAmount,
      cgstRate: 0,
      sgstRate: 0,
      igstRate,
      cgstAmount: 0,
      sgstAmount: 0,
      igstAmount,
      totalTax: igstAmount,
      grandTotal,
    };
  }

  const cgstRate = Math.round((safeTaxRate / 2) * 100) / 100;
  const sgstRate = Math.round((safeTaxRate / 2) * 100) / 100;
  const cgstAmount = Math.round((netTaxableAmount * (cgstRate / 100)) * 100) / 100;
  const sgstAmount = Math.round((netTaxableAmount * (sgstRate / 100)) * 100) / 100;
  const totalTax = Math.round((cgstAmount + sgstAmount) * 100) / 100;
  const grandTotal = Math.round((netTaxableAmount + totalTax) * 100) / 100;

  return {
    netTaxableAmount,
    cgstRate,
    sgstRate,
    igstRate: 0,
    cgstAmount,
    sgstAmount,
    igstAmount: 0,
    totalTax,
    grandTotal,
  };
}

/**
 * Converts a number to Indian Currency Words format (Rupees ... and ... Paise Only).
 */
export function numberToIndianWords(amount: number): string {
  if (amount === 0 || isNaN(amount)) return 'Rupees Zero Only';

  const units = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertTwoDigits = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return units[n];
    const t = tens[Math.floor(n / 10)];
    const u = units[n % 10];
    return u ? `${t}-${u}` : t;
  };

  const convertThreeDigits = (n: number): string => {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    const hundredPart = hundred > 0 ? `${units[hundred]} Hundred` : '';
    const restPart = convertTwoDigits(rest);
    if (hundredPart && restPart) return `${hundredPart} and ${restPart}`;
    return hundredPart || restPart;
  };

  const absAmount = Math.abs(amount);
  const rupees = Math.floor(absAmount);
  const paise = Math.round((absAmount - rupees) * 100);

  const crore = Math.floor(rupees / 10000000);
  const lakh = Math.floor((rupees % 10000000) / 100000);
  const thousand = Math.floor((rupees % 100000) / 1000);
  const remaining = rupees % 1000;

  const parts: string[] = [];
  if (crore > 0) parts.push(`${convertThreeDigits(crore)} Crore`);
  if (lakh > 0) parts.push(`${convertThreeDigits(lakh)} Lakh`);
  if (thousand > 0) parts.push(`${convertThreeDigits(thousand)} Thousand`);
  if (remaining > 0) parts.push(convertThreeDigits(remaining));

  let words = `Rupees ${parts.join(' ')}`.trim();
  if (paise > 0) {
    words += ` and ${convertTwoDigits(paise)} Paise`;
  }
  return `${words} Only`;
}

/**
 * Formats a numeric value into INR string with standard ₹ symbol.
 */
export function formatINR(amount: number | undefined | null, includeDecimals = true): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return includeDecimals ? '₹0.00' : '₹0';
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const [intPart, decPart] = absAmount.toFixed(2).split('.');

  let lastThree = intPart.slice(-3);
  const otherNumbers = intPart.slice(0, -3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formattedInt = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  const formattedNumber = includeDecimals ? `${formattedInt}.${decPart}` : formattedInt;

  return `${isNegative ? '-' : ''}₹${formattedNumber}`;
}
