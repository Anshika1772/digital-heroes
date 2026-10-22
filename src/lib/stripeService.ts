import { MembershipTier, SubscriptionStatus, SubscriptionDetails } from '../types';

export const SUBSCRIPTION_PLANS = {
  monthly: {
    id: 'plan_monthly',
    name: 'Monthly Hero Member',
    priceUsd: 29.0,
    interval: 'month',
    savingsLabel: 'Flexible monthly billing',
    drawTicketsIncluded: 10,
    description: 'Guaranteed 10 entries per monthly draw, plus scoring boosters and vetted charity split.',
  },
  yearly: {
    id: 'plan_yearly',
    name: 'Annual Champion Hero',
    priceUsd: 290.0,
    interval: 'year',
    savingsLabel: 'Save 17% (2 Months Free)',
    drawTicketsIncluded: 120, // 10 entries * 12 months
    description: 'Annual commitment with 2 months free, continuous 12-month draw entries, and maximum impact.',
  },
} as const;

export const MINIMUM_CHARITY_PERCENT = 10;
export const DEFAULT_CHARITY_PERCENT = 50;

/**
 * Validates a credit card number using the standard Luhn Algorithm (Mod 10).
 */
export function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

/**
 * Formats a raw card number string with standard 4-digit spacing (#### #### #### ####).
 */
export function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 19);
  return digits.replace(/(\d{4})/g, '$1 ').trim();
}

/**
 * Formats an expiration date string as MM/YY.
 */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 2) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return digits;
}

/**
 * Validates expiration date format (MM/YY) and checks that it is not expired.
 */
export function validateExpiry(expiryStr: string): { valid: boolean; error?: string } {
  const match = expiryStr.match(/^(\d{2})\/(\d{2})$/);
  if (!match) {
    return { valid: false, error: 'Expiration must be in MM/YY format.' };
  }

  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;

  if (month < 1 || month > 12) {
    return { valid: false, error: 'Invalid expiration month (must be 01 to 12).' };
  }

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return { valid: false, error: 'Card has expired.' };
  }

  return { valid: true };
}

/**
 * Validates a card security code (CVC).
 */
export function validateCvc(cvc: string): boolean {
  const clean = cvc.trim();
  return /^\d{3,4}$/.test(clean);
}

export interface PaymentMethodPayload {
  cardNumber: string;
  expiry: string;
  cvc: string;
  cardholderName: string;
  billingZip: string;
}

export interface CheckoutResult {
  success: boolean;
  subscription?: SubscriptionDetails;
  charityEscrowAllocatedUsd?: number;
  prizePoolAllocatedUsd?: number;
  error?: string;
  transactionId?: string;
}

/**
 * Validates the charity allocation percentage according to PRD business rules (10% to 100%).
 */
export function validateSubscriptionAllocation(charityContributionPercent: number): { valid: boolean; error?: string } {
  if (typeof charityContributionPercent !== 'number' || isNaN(charityContributionPercent)) {
    return { valid: false, error: 'Charity percentage must be a valid number.' };
  }
  if (charityContributionPercent < MINIMUM_CHARITY_PERCENT) {
    return { valid: false, error: `Charity contribution must be at least ${MINIMUM_CHARITY_PERCENT}%.` };
  }
  if (charityContributionPercent > 100) {
    return { valid: false, error: 'Charity contribution cannot exceed 100%.' };
  }
  return { valid: true };
}

/**
 * Validates payment details and enforces server-side webhook activation.
 * Raw credit card numbers are NOT accepted or processed in client state.
 */
export async function processSubscriptionCheckout(
  plan: MembershipTier,
  charityId: string,
  charityContributionPercent: number,
  payment?: PaymentMethodPayload
): Promise<CheckoutResult> {
  const alloc = validateSubscriptionAllocation(charityContributionPercent);
  if (!alloc.valid) {
    return {
      success: false,
      error: alloc.error,
    };
  }

  // Strict Security Enforcement:
  // Client-side simulated payment confirmation is disabled.
  // Membership can only be activated by an authenticated server-side Stripe webhook.
  return {
    success: false,
    error: 'Client card submission is disabled for PCI-DSS compliance. Subscriptions require verified server-side Stripe webhook confirmation.',
  };
}
