import { 
  GolferProfile, 
  Charity, 
  StablefordScore, 
  Draw, 
  WinnerRecord 
} from '../types';

const STORAGE_KEY_PREFIX = 'digital_heroes_';

// Initial Charities
export const INITIAL_CHARITIES: Charity[] = [
  {
    id: 'charity-1',
    name: 'First Tee Tomorrow',
    slug: 'first-tee-tomorrow',
    tagline: 'Empowering underprivileged youth through mentorship, golf, and academic leadership.',
    description: 'Operating in 42 urban public courses, First Tee Tomorrow provides youth with free equipment, certified PGA instruction, and collegiate STEM scholarships.',
    category: 'Youth Golf',
    website: 'https://firstteetomorrow.org',
    totalRaised: 89450,
    impactMetric: '3,400+ junior clinics funded across 18 states',
    active: true
  },
  {
    id: 'charity-2',
    name: 'Fairways for Clean Oceans',
    slug: 'fairways-clean-oceans',
    tagline: 'Pioneering marine-safe course runoff filtering and coastal dune restoration.',
    description: 'Partnering with coastal links courses globally to eliminate synthetic fertilizer drainage, recover ocean plastics, and protect sanctuary wetlands.',
    category: 'Environmental Conservation',
    website: 'https://fairwaysoceans.org',
    totalRaised: 64200,
    impactMetric: '14.2 tons of microplastics removed from coastal waterways',
    active: true
  },
  {
    id: 'charity-3',
    name: 'Adaptive Fairways Alliance',
    slug: 'adaptive-fairways-alliance',
    tagline: 'Custom mobility solo-rider carts and specialized swing technologies for para-golfers.',
    description: 'Ensuring that physical disabilities never end the love of the game. We engineer and donate all-terrain adaptive carts and host the National Para-Open.',
    category: 'Disabled Golfers',
    website: 'https://adaptivefairways.org',
    totalRaised: 104800,
    impactMetric: '190 custom solo-rider carts delivered to municipal links',
    active: true
  },
  {
    id: 'charity-4',
    name: 'Honor Caddie Foundation',
    slug: 'honor-caddie-foundation',
    tagline: 'Rehabilitative golf retreats and PGA career pathways for military veterans.',
    description: 'Providing combat veterans with therapeutic golf immersion, peer support networks, and full scholarships toward PGA apprentice programs.',
    category: 'Veteran Wellbeing',
    website: 'https://honorcaddie.org',
    totalRaised: 58900,
    impactMetric: '92% of enrolled veterans report improved mental health resilience',
    active: true
  }
];

// Initial Profiles
export const INITIAL_PROFILES: GolferProfile[] = [
  {
    id: 'user-alex-mercer',
    email: 'alex.mercer@golfheroes.org',
    fullName: 'Alex Mercer',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    handicapIndex: 9.4,
    homeClub: 'Pinehurst No. 2 Links',
    role: 'member',
    membershipTier: 'yearly',
    membershipActive: true,
    selectedCharityId: 'charity-1',
    totalDonated: 180.00,
    createdAt: '2026-02-15T10:00:00Z'
  },
  {
    id: 'user-admin-marcus',
    email: 'marcus.admin@golfheroes.org',
    fullName: 'Marcus Vance',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    handicapIndex: 4.8,
    homeClub: 'Cypress Point Club',
    role: 'admin',
    membershipTier: 'yearly',
    membershipActive: true,
    selectedCharityId: 'charity-3',
    totalDonated: 450.00,
    createdAt: '2026-01-01T08:00:00Z'
  },
  {
    id: 'user-elena-rostova',
    email: 'elena.rostova@golfheroes.org',
    fullName: 'Elena Rostova',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    handicapIndex: 12.6,
    homeClub: 'Wentworth Club',
    role: 'member',
    membershipTier: 'monthly',
    membershipActive: true,
    selectedCharityId: 'charity-2',
    totalDonated: 95.00,
    createdAt: '2026-04-10T12:00:00Z'
  }
];

// Initial Stableford Scores (Alex Mercer's past rounds - strictly 1-45 pts, unique dates)
export const INITIAL_SCORES: StablefordScore[] = [
  {
    id: 'score-1',
    userId: 'user-alex-mercer',
    scoreDate: '2026-10-18',
    stablefordPoints: 39,
    courseName: 'Pinehurst No. 2',
    holesPlayed: 18,
    notes: 'Pure ball-striking on back 9. Birdie on 16th with a 15-foot putt.',
    verified: true,
    createdAt: '2026-10-18T18:30:00Z'
  },
  {
    id: 'score-2',
    userId: 'user-alex-mercer',
    scoreDate: '2026-10-12',
    stablefordPoints: 36,
    courseName: 'Mid Pines Inn & Golf',
    holesPlayed: 18,
    notes: 'Windy conditions, steady scrambling around fast Donald Ross greens.',
    verified: true,
    createdAt: '2026-10-12T17:15:00Z'
  },
  {
    id: 'score-3',
    userId: 'user-alex-mercer',
    scoreDate: '2026-10-04',
    stablefordPoints: 41,
    courseName: 'Tobacco Road Golf Club',
    holesPlayed: 18,
    notes: 'Career high round! Drove the green on hole 14 for an eagle 4-pointer.',
    verified: true,
    createdAt: '2026-10-04T19:00:00Z'
  },
  {
    id: 'score-4',
    userId: 'user-alex-mercer',
    scoreDate: '2026-09-27',
    stablefordPoints: 34,
    courseName: 'Southern Pines GC',
    holesPlayed: 18,
    notes: 'Putter ran cold early, but finished with 3 consecutive pars.',
    verified: true,
    createdAt: '2026-09-27T16:45:00Z'
  },
  {
    id: 'score-5',
    userId: 'user-alex-mercer',
    scoreDate: '2026-09-18',
    stablefordPoints: 37,
    courseName: 'Pinehurst No. 4',
    holesPlayed: 18,
    notes: 'Superb iron play from the sand waste areas.',
    verified: true,
    createdAt: '2026-09-18T17:00:00Z'
  },
  {
    id: 'score-6-older',
    userId: 'user-alex-mercer',
    scoreDate: '2026-08-30',
    stablefordPoints: 32,
    courseName: 'Dormie Club',
    holesPlayed: 18,
    notes: 'Older historical score to verify 5-score limit filtering.',
    verified: true,
    createdAt: '2026-08-30T15:00:00Z'
  }
];

// Initial Draws
export const INITIAL_DRAWS: Draw[] = [
  {
    id: 'draw-nov-2026',
    title: 'The Autumn Invitational Major Draw',
    seasonMonth: 'November 2026',
    drawDate: '2026-11-05T20:00:00Z',
    status: 'scheduled',
    prizeTierLabel: 'Titleist Custom Fitted Works + $5,000 Travel Stipend',
    prizeValueUsd: 8500,
    charitySplitPercentage: 50,
    totalEntries: 1420
  },
  {
    id: 'draw-oct-2026',
    title: 'October Links Championship Draw',
    seasonMonth: 'October 2026',
    drawDate: '2026-10-05T20:00:00Z',
    status: 'completed',
    prizeTierLabel: 'Scotty Cameron Tour Prototype & Bandon Dunes Trip',
    prizeValueUsd: 6200,
    charitySplitPercentage: 50,
    totalEntries: 1280
  }
];

// Initial Winners & Verifications
export const INITIAL_WINNERS: WinnerRecord[] = [
  {
    id: 'winner-alex-oct',
    drawId: 'draw-oct-2026',
    drawTitle: 'October Links Championship Draw',
    userId: 'user-alex-mercer',
    userName: 'Alex Mercer',
    userEmail: 'alex.mercer@golfheroes.org',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    prizeTitle: 'Scotty Cameron Tour Prototype & Bandon Dunes Trip',
    prizeValueUsd: 6200,
    proofUrl: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&q=80&w=800',
    proofDescription: 'Official signed club scorecard and handicap index attestation certificate from Pinehurst No. 2 Head Pro.',
    proofSubmittedAt: '2026-10-08T14:20:00Z',
    verificationStatus: 'verified',
    verificationNotes: 'Handicap attested and verified with GHIN #8291041.',
    payoutStatus: 'processing',
    payoutReference: 'PAY-DH-2026-8812',
    createdAt: '2026-10-05T20:05:00Z'
  },
  {
    id: 'winner-elena-sep',
    drawId: 'draw-sep-2026',
    drawTitle: 'September Heritage Fairway Draw',
    userId: 'user-elena-rostova',
    userName: 'Elena Rostova',
    userEmail: 'elena.rostova@golfheroes.org',
    userAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    prizeTitle: 'Bushnell Pro X3 Rangefinder & Luxury Golf Luggage Set',
    prizeValueUsd: 1450,
    proofUrl: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&q=80&w=800',
    proofDescription: 'Scorecard signed by playing markers at Wentworth Club.',
    proofSubmittedAt: '2026-09-12T11:00:00Z',
    verificationStatus: 'verified',
    verificationNotes: 'Fully verified scorecard and valid member identity.',
    payoutStatus: 'paid',
    payoutReference: 'PAY-DH-2026-7491',
    payoutDate: '2026-09-15T16:00:00Z',
    createdAt: '2026-09-05T20:00:00Z'
  }
];

// Helper to interact with LocalStorage
function getFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`LocalStorage read failed for ${key}:`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.warn(`LocalStorage write failed for ${key}:`, e);
  }
}

// State Stores
export class MockStore {
  static getProfiles(): GolferProfile[] {
    return getFromStorage('profiles', INITIAL_PROFILES);
  }

  static getCharities(): Charity[] {
    return getFromStorage('charities', INITIAL_CHARITIES);
  }

  static getScores(): StablefordScore[] {
    return getFromStorage('scores', INITIAL_SCORES);
  }

  static getDraws(): Draw[] {
    return getFromStorage('draws', INITIAL_DRAWS);
  }

  static getWinners(): WinnerRecord[] {
    return getFromStorage('winners', INITIAL_WINNERS);
  }

  static getCurrentUserId(): string {
    return getFromStorage('current_user_id', 'user-alex-mercer');
  }

  static setCurrentUserId(id: string): void {
    saveToStorage('current_user_id', id);
  }

  static getCurrentUser(): GolferProfile {
    const profiles = this.getProfiles();
    const id = this.getCurrentUserId();
    const found = profiles.find(p => p.id === id);
    return found || profiles[0];
  }

  static updateProfile(updated: GolferProfile): GolferProfile {
    const profiles = this.getProfiles().map(p => p.id === updated.id ? updated : p);
    saveToStorage('profiles', profiles);
    return updated;
  }

  // --- Stableford Scores Logic with Strict Rules ---
  // 1. Stableford range: 1 to 45
  // 2. Unique score date per user
  // 3. Retain / view latest 5 scores in reverse chronological order
  static getScoresForUser(userId: string): StablefordScore[] {
    const all = this.getScores();
    return all
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.scoreDate).getTime() - new Date(a.scoreDate).getTime());
  }

  static getLatestFiveScores(userId: string): StablefordScore[] {
    return this.getScoresForUser(userId).slice(0, 5);
  }

  static addScore(newScore: Omit<StablefordScore, 'id' | 'createdAt' | 'verified'>): { success: boolean; error?: string; score?: StablefordScore } {
    // Rule 1: Validate points between 1 and 45
    if (newScore.stablefordPoints < 1 || newScore.stablefordPoints > 45) {
      return { 
        success: false, 
        error: `Stableford score must be between 1 and 45 points. You entered ${newScore.stablefordPoints}.` 
      };
    }

    const all = this.getScores();
    // Rule 2: Enforce unique score date per user
    const dateConflict = all.find(s => s.userId === newScore.userId && s.scoreDate === newScore.scoreDate);
    if (dateConflict) {
      return { 
        success: false, 
        error: `A round has already been submitted for date ${newScore.scoreDate} (${dateConflict.courseName} - ${dateConflict.stablefordPoints} pts). Each date can only have one official score.` 
      };
    }

    const score: StablefordScore = {
      ...newScore,
      id: 'score-' + Date.now(),
      verified: true,
      createdAt: new Date().toISOString()
    };

    all.unshift(score);
    saveToStorage('scores', all);
    return { success: true, score };
  }

  static updateScore(updated: StablefordScore): { success: boolean; error?: string; score?: StablefordScore } {
    // Validate points
    if (updated.stablefordPoints < 1 || updated.stablefordPoints > 45) {
      return { 
        success: false, 
        error: `Stableford score must be between 1 and 45 points.` 
      };
    }

    const all = this.getScores();
    // Check if another score by this user has this date
    const dateConflict = all.find(s => s.userId === updated.userId && s.scoreDate === updated.scoreDate && s.id !== updated.id);
    if (dateConflict) {
      return { 
        success: false, 
        error: `Another round already exists on ${updated.scoreDate}. Please choose a unique date.` 
      };
    }

    const newAll = all.map(s => s.id === updated.id ? updated : s);
    saveToStorage('scores', newAll);
    return { success: true, score: updated };
  }

  static deleteScore(scoreId: string): void {
    const all = this.getScores().filter(s => s.id !== scoreId);
    saveToStorage('scores', all);
  }

  // --- Charities Logic ---
  static updateCharity(updated: Charity): void {
    const charities = this.getCharities().map(c => c.id === updated.id ? updated : c);
    saveToStorage('charities', charities);
  }

  static addCharity(charity: Omit<Charity, 'id'>): Charity {
    const newCharity: Charity = {
      ...charity,
      id: 'charity-' + Date.now()
    };
    const charities = [newCharity, ...this.getCharities()];
    saveToStorage('charities', charities);
    return newCharity;
  }

  // --- Winner Proof & Verification Logic ---
  static submitWinnerProof(winnerId: string, proofUrl: string, proofDescription: string): { success: boolean; error?: string } {
    const winners = this.getWinners();
    const target = winners.find(w => w.id === winnerId);
    if (!target) return { success: false, error: 'Winner record not found' };

    target.proofUrl = proofUrl;
    target.proofDescription = proofDescription;
    target.proofSubmittedAt = new Date().toISOString();
    target.verificationStatus = 'pending';
    saveToStorage('winners', winners);
    return { success: true };
  }

  static verifyWinnerProof(winnerId: string, status: 'verified' | 'rejected', notes?: string): void {
    const winners = this.getWinners();
    const target = winners.find(w => w.id === winnerId);
    if (target) {
      target.verificationStatus = status;
      if (notes) target.verificationNotes = notes;
      if (status === 'verified' && target.payoutStatus === 'pending') {
        target.payoutStatus = 'processing';
      }
      saveToStorage('winners', winners);
    }
  }

  static updatePayoutStatus(winnerId: string, status: 'pending' | 'processing' | 'paid', reference?: string): void {
    const winners = this.getWinners();
    const target = winners.find(w => w.id === winnerId);
    if (target) {
      target.payoutStatus = status;
      if (reference) target.payoutReference = reference;
      if (status === 'paid') target.payoutDate = new Date().toISOString();
      saveToStorage('winners', winners);
    }
  }

  // --- Draw Simulation Execution ---
  static executeDrawSimulation(drawId: string): { success: boolean; winner?: WinnerRecord; error?: string } {
    const draws = this.getDraws();
    const targetDraw = draws.find(d => d.id === drawId);
    if (!targetDraw) return { success: false, error: 'Draw not found' };

    const profiles = this.getProfiles().filter(p => p.role === 'member');
    if (profiles.length === 0) return { success: false, error: 'No eligible members found in entry pool.' };

    // Select random member
    const randomIndex = Math.floor(Math.random() * profiles.length);
    const luckyGolfer = profiles[randomIndex];

    const newWinner: WinnerRecord = {
      id: 'win-' + Date.now(),
      drawId: targetDraw.id,
      drawTitle: targetDraw.title,
      userId: luckyGolfer.id,
      userName: luckyGolfer.fullName,
      userEmail: luckyGolfer.email,
      userAvatar: luckyGolfer.avatarUrl,
      prizeTitle: targetDraw.prizeTierLabel,
      prizeValueUsd: targetDraw.prizeValueUsd,
      verificationStatus: 'pending',
      payoutStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    // Update draw status
    targetDraw.status = 'completed';
    saveToStorage('draws', draws);

    // Add winner
    const winners = [newWinner, ...this.getWinners()];
    saveToStorage('winners', winners);

    return { success: true, winner: newWinner };
  }

  // Reset store to fresh mock data
  static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'profiles');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'charities');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'scores');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'draws');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'winners');
    localStorage.removeItem(STORAGE_KEY_PREFIX + 'current_user_id');
  }
}
