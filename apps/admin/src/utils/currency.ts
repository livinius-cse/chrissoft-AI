/**
 * ChrisSoft AI - Centralized Indian Rupee (INR) and GST Calculation Utility
 * Compliant with Indian financial formatting standards (en-IN, ₹) and GST accounting rules.
 */

export const GST_RATES = [0, 5, 12, 18, 28] as const;
export type GSTRate = (typeof GST_RATES)[number];
export const DEFAULT_GST_RATE: GSTRate = 18;

export interface CurrencyFormatOptions {
    showDecimals?: boolean;
    compact?: boolean;
    symbol?: boolean;
    includeSpaceAfterSymbol?: boolean;
}

export interface GSTBreakdown {
    taxableAmount: number;
    discount: number;
    netTaxableAmount: number;
    gstRate: number;
    isInterState: boolean;
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
 * Rounds a number to a specified decimal places using epsilon to eliminate IEEE 754 precision issues.
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
    if (isNaN(value) || !isFinite(value)) return 0;
    const factor = Math.pow(10, decimals);
    return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Format a number using the Indian Numbering System (e.g., 12,34,567.89).
 */
export function formatNumberIndian(
    amount: number,
    decimals: number = 2
): string {
    if (isNaN(amount) || !isFinite(amount)) return '0.00';
    return new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(amount);
}

/**
 * Formats a monetary amount into standard Indian Rupee notation (₹).
 * Example:
 *  formatINR(125000) -> "₹1,25,000.00"
 *  formatINR(125000, { showDecimals: false }) -> "₹1,25,000"
 *  formatINR(-4500) -> "-₹4,500.00"
 */
export function formatINR(
    amount: number | null | undefined,
    options: CurrencyFormatOptions = {}
): string {
    const {
        showDecimals = true,
        compact = false,
        symbol = true,
        includeSpaceAfterSymbol = false,
    } = options;

    if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
        amount = 0;
    }

    if (compact) {
        return formatINRCompact(amount, { symbol, includeSpaceAfterSymbol });
    }

    const isNegative = amount < 0;
    const absVal = Math.abs(amount);
    const decimals = showDecimals ? 2 : 0;

    const formattedNum = formatNumberIndian(absVal, decimals);
    const symbolStr = symbol ? (includeSpaceAfterSymbol ? '₹ ' : '₹') : '';

    return isNegative ? `-${symbolStr}${formattedNum}` : `${symbolStr}${formattedNum}`;
}

/**
 * Compact Indian currency formatting for high-density dashboards, KPI cards, and badges.
 * Examples:
 *  formatINRCompact(15000000) -> "₹1.50 Cr"
 *  formatINRCompact(250000)   -> "₹2.50 L"
 *  formatINRCompact(45000)    -> "₹45.0 K"
 *  formatINRCompact(750)      -> "₹750"
 */
export function formatINRCompact(
    amount: number | null | undefined,
    options: { symbol?: boolean; includeSpaceAfterSymbol?: boolean } = {}
): string {
    const { symbol = true, includeSpaceAfterSymbol = false } = options;
    if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount)) {
        return symbol ? (includeSpaceAfterSymbol ? '₹ 0' : '₹0') : '0';
    }

    const isNegative = amount < 0;
    const absVal = Math.abs(amount);
    const symbolStr = symbol ? (includeSpaceAfterSymbol ? '₹ ' : '₹') : '';

    let formattedValue: string;

    if (absVal >= 10000000) {
        // Crores (1 Cr = 1,00,00,000)
        const cr = parseFloat((absVal / 10000000).toFixed(2));
        formattedValue = `${cr} Cr`;
    } else if (absVal >= 100000) {
        // Lakhs (1 L = 1,00,000)
        const lk = parseFloat((absVal / 100000).toFixed(2));
        formattedValue = `${lk} L`;
    } else if (absVal >= 1000) {
        // Thousands
        const k = parseFloat((absVal / 1000).toFixed(1));
        formattedValue = `${k} K`;
    } else {
        formattedValue = absVal.toFixed(0);
    }

    return isNegative ? `-${symbolStr}${formattedValue}` : `${symbolStr}${formattedValue}`;
}

/**
 * Computes exact GST breakdown with dual CGST+SGST (Intra-state) or IGST (Inter-state).
 * Enforces strict rounding so component sums always reconcile to total tax and grand total.
 */
export function calculateGSTBreakdown(
    taxableAmount: number,
    options: {
        gstRate?: number;
        discount?: number;
        isInterState?: boolean;
    } = {}
): GSTBreakdown {
    const { gstRate = DEFAULT_GST_RATE, discount = 0, isInterState = false } = options;

    const baseAmount = Math.max(0, roundToDecimals(taxableAmount, 2));
    const discAmount = Math.max(0, roundToDecimals(discount, 2));
    const netTaxableAmount = Math.max(0, roundToDecimals(baseAmount - discAmount, 2));

    let cgstRate = 0;
    let sgstRate = 0;
    let igstRate = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let totalTax = 0;

    if (isInterState) {
        igstRate = gstRate;
        igstAmount = roundToDecimals((netTaxableAmount * igstRate) / 100, 2);
        totalTax = igstAmount;
    } else {
        cgstRate = gstRate / 2;
        sgstRate = gstRate / 2;
        cgstAmount = roundToDecimals((netTaxableAmount * cgstRate) / 100, 2);
        sgstAmount = roundToDecimals((netTaxableAmount * sgstRate) / 100, 2);
        // Ensure total tax equals exactly cgst + sgst
        totalTax = roundToDecimals(cgstAmount + sgstAmount, 2);
    }

    const grandTotal = roundToDecimals(netTaxableAmount + totalTax, 2);

    return {
        taxableAmount: baseAmount,
        discount: discAmount,
        netTaxableAmount,
        gstRate,
        isInterState,
        cgstRate,
        sgstRate,
        igstRate,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalTax,
        grandTotal,
    };
}

/**
 * Validates 15-character Goods and Services Tax Identification Number (GSTIN)
 * Format: 2 digits State Code + 10 chars PAN + 1 entity code + 'Z' + 1 checksum char
 */
export function isValidGSTIN(gstin: string | undefined | null): boolean {
    if (!gstin) return false;
    const clean = gstin.trim().toUpperCase();
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(clean);
}

const ONES = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
    '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertBelowThousand(n: number): string {
    let str = '';
    if (n >= 100) {
        str += ONES[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
        if (n > 0) str += 'and ';
    }
    if (n >= 20) {
        str += TENS[Math.floor(n / 10)];
        const rem = n % 10;
        if (rem > 0) str += '-' + ONES[rem];
        str += ' ';
    } else if (n > 0) {
        str += ONES[n] + ' ';
    }
    return str.trim();
}

/**
 * Converts a monetary amount to formal Indian words for official tax invoices.
 * Example:
 *  numberToIndianWords(125430.50) -> "Rupees One Lakh Twenty-Five Thousand Four Hundred and Thirty and Fifty Paise Only"
 */
export function numberToIndianWords(amount: number | null | undefined): string {
    if (amount === null || amount === undefined || isNaN(amount) || !isFinite(amount) || amount === 0) {
        return 'Rupees Zero Only';
    }

    const isNegative = amount < 0;
    const absVal = Math.abs(amount);

    const rupees = Math.floor(absVal);
    const paise = Math.round((absVal - rupees) * 100);

    let words = '';

    if (rupees === 0) {
        words = 'Zero';
    } else {
        let n = rupees;
        const crores = Math.floor(n / 10000000);
        n %= 10000000;

        const lakhs = Math.floor(n / 100000);
        n %= 100000;

        const thousands = Math.floor(n / 1000);
        n %= 1000;

        const hundredsAndBelow = n;

        if (crores > 0) {
            words += convertBelowThousand(crores) + ' Crore ';
        }
        if (lakhs > 0) {
            words += convertBelowThousand(lakhs) + ' Lakh ';
        }
        if (thousands > 0) {
            words += convertBelowThousand(thousands) + ' Thousand ';
        }
        if (hundredsAndBelow > 0) {
            words += convertBelowThousand(hundredsAndBelow) + ' ';
        }
    }

    words = words.trim();

    let result = `${isNegative ? 'Minus ' : ''}Rupees ${words}`;

    if (paise > 0) {
        result += ` and ${convertBelowThousand(paise)} Paise`;
    }

    return `${result} Only`;
}
