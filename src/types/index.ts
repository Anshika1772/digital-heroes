export type UserRole = 'member' | 'admin';

export type MembershipTier = 'monthly' | 'yearly';

export type CharityCategory = 
  | 'Youth Golf' 
  | 'Environmental Conservation' 
  | 'Disabled Golfers' 
  | 'Veteran Wellbeing';

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
  totalDonated: number;
  createdAt: string;
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
