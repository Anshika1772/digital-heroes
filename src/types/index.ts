export type UserRole = 'member' | 'admin';

export type MembershipTier = 'monthly' | 'yearly';

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'lapsed';

export type CharityCategory = 
  | 'Youth Golf' 
  | 'Environmental Conservation' 
  | 'Disabled Golfers' 
  | 'Veteran Wellbeing';

export interface CharityEvent {
  id: string;
  charityId: string;
  title: string;
  date: string;
  location: string;
  description: string;
  participantGoal?: number;
  currentParticipants?: number;
  featured?: boolean;
}

export interface Charity {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  category: CharityCategory;
  logoUrl?: string;
  website: string;
  totalRaised: number;
  impactMetric: string;
  active: boolean;
  featured?: boolean;
  events?: CharityEvent[];
  missionHighlights?: string[];
  directorName?: string;
  verifiedTaxId?: string;
}

export interface SubscriptionDetails {
  plan: MembershipTier;
  amountUsd: number;
  charityContributionPercent: number; // min 10%, default 50%
  charityId: string;
  status: SubscriptionStatus;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  paymentMethodLast4?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface GolferProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  handicapIndex: number;
  homeClub: string;
  role: UserRole;
  membershipTier: MembershipTier;
  membershipActive: boolean;
  selectedCharityId: string;
  charityContributionPercent?: number; // min 10%, default 50%
  totalDonated: number;
  createdAt: string;
  subscriptionStatus?: SubscriptionStatus;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
}

export interface StablefordScore {
  id: string;
  userId: string;
  scoreDate: string; // YYYY-MM-DD
  stablefordPoints: number; // 1 to 45
  courseName: string;
  holesPlayed: 9 | 18;
  notes?: string;
  verified: boolean;
  createdAt: string;
}

export type DrawMode = 'random' | 'score_weighted';

export interface Draw {
  id: string;
  title: string;
  seasonMonth: string;
  drawDate: string; // ISO date string
  status: 'scheduled' | 'in_progress' | 'completed';
  prizeTierLabel: string;
  prizeValueUsd: number;
  charitySplitPercentage: number;
  totalEntries: number;
  mode?: DrawMode;
  winningNumbers?: number[];
  jackpotRolloverUsd?: number;
  tier1PoolUsd?: number;
  tier2PoolUsd?: number;
  tier3PoolUsd?: number;
}

export interface DrawTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  drawId: string;
  numbers: number[]; // 5 numbers from 1 to 50
  weight: number;
  source: 'membership' | 'score_bonus' | 'charity_booster';
  roundsPlayed: number;
}

export interface DrawTierWinner {
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  ticketNumbers: number[];
  matchedNumbers: number[];
  matchCount: 3 | 4 | 5;
  tier: 1 | 2 | 3;
  tierName: string;
  payoutAmount: number;
}

export interface DrawSimulationResult {
  drawId: string;
  drawTitle: string;
  mode: DrawMode;
  winningNumbers: number[]; // 5 numbers 1..50
  totalSubscribers: number;
  totalEntries: number;
  totalPrizePool: number;
  jackpotRolloverIncoming: number;
  tier1Pool: number; // 40% + rollover
  tier2Pool: number; // 35%
  tier3Pool: number; // 25%
  tier1Winners: DrawTierWinner[];
  tier2Winners: DrawTierWinner[];
  tier3Winners: DrawTierWinner[];
  jackpotRolloverNext: number; // if tier1Winners.length === 0, tier1Pool rolls over
  allWinners: DrawTierWinner[];
  executedAt: string;
}

export type VerificationStatus = 'pending' | 'verified' | 'rejected';
export type PayoutStatus = 'pending' | 'processing' | 'paid';

export interface WinnerRecord {
  id: string;
  drawId: string;
  drawTitle: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar?: string;
  prizeTitle: string;
  prizeValueUsd: number;
  matchedNumbers?: number[];
  tier?: 1 | 2 | 3;
  proofUrl?: string;
  proofDescription?: string;
  proofSubmittedAt?: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  payoutStatus: PayoutStatus;
  payoutReference?: string;
  payoutDate?: string;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}
