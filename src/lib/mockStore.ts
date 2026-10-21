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
  // 1. Stableford range: integer strictly 1 to 45
  // 2. Unique score date per user, non-future date
  // 3. Consistently retain and display only the latest 5 scores in reverse chronological order
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
    // Rule 1: Validate points strictly as integer between 1 and 45
    if (typeof newScore.stablefordPoints !== 'number' || !Number.isInteger(newScore.stablefordPoints)) {
      return {
        success: false,
        error: 'Stableford points must be a whole integer.'
      };
    }

    if (newScore.stablefordPoints < 1 || newScore.stablefordPoints > 45) {
      return { 
        success: false, 
        error: `Stableford score must be between 1 and 45 points. You entered ${newScore.stablefordPoints}.` 
      };
    }

    // Rule 2: Validate date
    if (!newScore.scoreDate || isNaN(new Date(newScore.scoreDate).getTime())) {
      return { success: false, error: 'A valid round date is required.' };
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (newScore.scoreDate > todayStr) {
      return { success: false, error: 'Round date cannot be in the future.' };
    }

    // Rule 3: Validate course name
    const cleanCourse = (newScore.courseName || '').trim();
    if (cleanCourse.length < 2 || cleanCourse.length > 100) {
      return { success: false, error: 'Course name must be between 2 and 100 characters.' };
    }

    const all = this.getScores();
    // Rule 4: Enforce unique score date per user
    const dateConflict = all.find(s => s.userId === newScore.userId && s.scoreDate === newScore.scoreDate);
    if (dateConflict) {
      return { 
        success: false, 
        error: `A round on ${newScore.scoreDate} is already recorded (${dateConflict.courseName} - ${dateConflict.stablefordPoints} pts). Each date can only have one official score.` 
      };
    }

    const score: StablefordScore = {
      ...newScore,
      courseName: cleanCourse,
      notes: newScore.notes ? newScore.notes.trim().slice(0, 500) : undefined,
      id: 'score-' + Date.now(),
      verified: true,
      createdAt: new Date().toISOString()
    };

    // Separate other users' scores, roll off scores older than latest 5 for current user
    const otherUsersScores = all.filter(s => s.userId !== newScore.userId);
    const userScores = [score, ...all.filter(s => s.userId === newScore.userId)]
      .sort((a, b) => new Date(b.scoreDate).getTime() - new Date(a.scoreDate).getTime())
      .slice(0, 5); // Strictly retain latest five scores per user

    const newAll = [...userScores, ...otherUsersScores];
    saveToStorage('scores', newAll);
    return { success: true, score };
  }

  static updateScore(updated: StablefordScore): { success: boolean; error?: string; score?: StablefordScore } {
    // Validate points
    if (typeof updated.stablefordPoints !== 'number' || !Number.isInteger(updated.stablefordPoints)) {
      return { success: false, error: 'Stableford points must be a whole integer.' };
    }

    if (updated.stablefordPoints < 1 || updated.stablefordPoints > 45) {
      return { 
        success: false, 
        error: `Stableford score must be between 1 and 45 points.` 
      };
    }

    if (!updated.scoreDate || isNaN(new Date(updated.scoreDate).getTime())) {
      return { success: false, error: 'A valid round date is required.' };
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (updated.scoreDate > todayStr) {
      return { success: false, error: 'Round date cannot be in the future.' };
    }

    const cleanCourse = (updated.courseName || '').trim();
    if (cleanCourse.length < 2 || cleanCourse.length > 100) {
      return { success: false, error: 'Course name must be between 2 and 100 characters.' };
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

    const cleanUpdated: StablefordScore = {
      ...updated,
      courseName: cleanCourse,
      notes: updated.notes ? updated.notes.trim().slice(0, 500) : undefined,
    };

    const otherUsersScores = all.filter(s => s.userId !== updated.userId);
    const userScores = all.filter(s => s.userId === updated.userId)
      .map(s => s.id === updated.id ? cleanUpdated : s)
      .sort((a, b) => new Date(b.scoreDate).getTime() - new Date(a.scoreDate).getTime())
      .slice(0, 5);

    saveToStorage('scores', [...userScores, ...otherUsersScores]);
    return { success: true, score: cleanUpdated };
  }

  static deleteScore(scoreId: string): void {
    const all = this.getScores().filter(s => s.id !== scoreId);
    saveToStorage('scores', all);
  }

  // --- Charities Logic with Validation ---
  static updateCharity(updated: Charity): void {
    const charities = this.getCharities().map(c => c.id === updated.id ? updated : c);
    saveToStorage('charities', charities);
  }

  static addCharity(charity: Omit<Charity, 'id'>): { success: boolean; error?: string; charity?: Charity } {
    if (!charity.name || charity.name.trim().length < 2) {
      return { success: false, error: 'Foundation name must be at least 2 characters.' };
    }
    if (!charity.website || !charity.website.startsWith('http')) {
      return { success: false, error: 'A valid foundation website URL is required.' };
    }
    if (!charity.tagline || charity.tagline.trim().length < 5) {
      return { success: false, error: 'Mission tagline must be at least 5 characters.' };
    }

    const newCharity: Charity = {
      ...charity,
      name: charity.name.trim(),
      tagline: charity.tagline.trim(),
      description: (charity.description || '').trim(),
      impactMetric: (charity.impactMetric || '').trim(),
      website: charity.website.trim(),
      id: 'charity-' + Date.now()
    };
    const charities = [newCharity, ...this.getCharities()];
    saveToStorage('charities', charities);
    return { success: true, charity: newCharity };
  }

  // Direct booster donation to charity
  static addDirectDonation(userId: string, charityId: string, amount: number): { success: boolean; error?: string } {
    if (typeof amount !== 'number' || isNaN(amount) || amount < 5 || amount > 5000) {
      return { success: false, error: 'Donation must be a valid amount between $5.00 and $5,000.00.' };
    }

    const charities = this.getCharities();
    const targetCharity = charities.find(c => c.id === charityId);
    if (!targetCharity) return { success: false, error: 'Charity not found.' };

    targetCharity.totalRaised += amount;
    saveToStorage('charities', charities);

    const profiles = this.getProfiles();
    const user = profiles.find(p => p.id === userId);
    if (user) {
      user.totalDonated += amount;
      saveToStorage('profiles', profiles);
    }

    return { success: true };
  }

  // --- Winner Proof & Verification Logic ---
  static submitWinnerProof(winnerId: string, proofUrl: string, proofDescription: string): { success: boolean; error?: string } {
    if (!proofUrl || !proofUrl.trim()) {
      return { success: false, error: 'Proof document link or file is required.' };
    }
    if (!proofDescription || proofDescription.trim().length < 10) {
      return { success: false, error: 'Attestation statement must be at least 10 characters.' };
    }

    const winners = this.getWinners();
    const target = winners.find(w => w.id === winnerId);
    if (!target) return { success: false, error: 'Winner record not found.' };

    target.proofUrl = proofUrl.trim();
    target.proofDescription = proofDescription.trim();
    target.proofSubmittedAt = new Date().toISOString();
    target.verificationStatus = 'pending';
    saveToStorage('winners', winners);
    return { success: true };
  }

  static verifyWinnerProof(adminUserId: string, winnerId: string, status: 'verified' | 'rejected', notes?: string): { success: boolean; error?: string } {
    const admin = this.getProfiles().find(p => p.id === adminUserId);
    if (admin?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Only platform administrators can verify scorecard proofs.' };
    }

    const winners = this.getWinners();
    const target = winners.find(w => w.id === winnerId);
    if (target) {
      target.verificationStatus = status;
      if (notes) target.verificationNotes = notes.trim();
      if (status === 'verified' && target.payoutStatus === 'pending') {
        target.payoutStatus = 'processing';
      }
      saveToStorage('winners', winners);
      return { success: true };
    }
    return { success: false, error: 'Winner record not found.' };
  }

  static updatePayoutStatus(adminUserId: string, winnerId: string, status: 'pending' | 'processing' | 'paid', reference?: string): { success: boolean; error?: string } {
    const admin = this.getProfiles().find(p => p.id === adminUserId);
    if (admin?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Only platform administrators can authorize prize payouts.' };
    }

    const winners = this.getWinners();
    const target = winners.find(w => w.id === winnerId);
    if (!target) return { success: false, error: 'Winner record not found.' };

    if (status === 'paid' && target.verificationStatus !== 'verified') {
      return { success: false, error: 'Cannot mark as paid until winner proof has been verified.' };
    }

    target.payoutStatus = status;
    if (reference) target.payoutReference = reference.trim();
    if (status === 'paid') target.payoutDate = new Date().toISOString();
    saveToStorage('winners', winners);
    return { success: true };
  }

  // --- Draw Simulation Execution ---
  static executeDrawSimulation(adminUserId: string, drawId: string): { success: boolean; winner?: WinnerRecord; error?: string } {
    const admin = this.getProfiles().find(p => p.id === adminUserId);
    if (admin?.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Only platform administrators can execute drawings.' };
    }

    const draws = this.getDraws();
    const targetDraw = draws.find(d => d.id === drawId);
    if (!targetDraw) return { success: false, error: 'Draw not found.' };

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
