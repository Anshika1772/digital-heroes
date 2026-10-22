import { 
  Draw, 
  GolferProfile, 
  StablefordScore, 
  DrawMode, 
  DrawTicket, 
  DrawTierWinner, 
  DrawSimulationResult, 
  WinnerRecord 
} from '../types';

/**
 * Generates an array of N unique random integers between min and max (inclusive).
 */
export function generateDistinctNumbers(count: number, min = 1, max = 50, seed?: number): number[] {
  const numbers = new Set<number>();
  while (numbers.size < count) {
    const num = Math.floor(Math.random() * (max - min + 1)) + min;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Deterministically generates lucky numbers for a golfer based on user ID and ticket index.
 * Allows members to have consistent ticket numbers or custom selections.
 */
export function generateTicketNumbers(userId: string, ticketIndex: number): number[] {
  // Simple hash for deterministic pseudo-random sequence
  let hash = 0;
  const str = `${userId}-ticket-${ticketIndex}`;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  const numbers = new Set<number>();
  let seed = Math.abs(hash);
  while (numbers.size < 5) {
    seed = (seed * 9301 + 49297) % 233280;
    const num = (seed % 50) + 1;
    numbers.add(num);
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

/**
 * Calculates ticket allocations for each member based on draw rules:
 * - 10 tickets for active membership inclusion
 * - +3 tickets for each logged round in the season
 * - In score_weighted mode, ticket weight is scaled by rounds played
 */
export function generateMemberDrawTickets(
  drawId: string,
  members: GolferProfile[],
  scores: StablefordScore[],
  mode: DrawMode = 'random'
): DrawTicket[] {
  const tickets: DrawTicket[] = [];

  const activeMembers = members.filter(m => m.role === 'member' && m.membershipActive);

  activeMembers.forEach(member => {
    // Count verified or logged rounds for this member
    const memberScores = scores.filter(s => s.userId === member.id);
    const roundsPlayed = memberScores.length;

    // Baseline: 10 tickets for membership
    // Bonus: +3 tickets per round logged
    const baseTicketCount = 10;
    const roundBonusTickets = roundsPlayed * 3;
    const totalTickets = baseTicketCount + roundBonusTickets;

    // Weight multiplier in score_weighted mode
    // (Golfer with 5 rounds gets 1.5x weight compared to 0 rounds)
    const weight = mode === 'score_weighted' ? 1 + (roundsPlayed * 0.1) : 1.0;

    for (let i = 0; i < totalTickets; i++) {
      tickets.push({
        id: `tkt-${member.id}-${i}-${Date.now()}`,
        userId: member.id,
        userName: member.fullName,
        userEmail: member.email,
        userAvatar: member.avatarUrl,
        drawId,
        numbers: generateTicketNumbers(member.id, i),
        weight,
        source: i < baseTicketCount ? 'membership' : 'score_bonus',
        roundsPlayed,
      });
    }
  });

  return tickets;
}

/**
 * Executes a full PRD-compliant draw simulation:
 * - Calculates prize pool from active subscribers
 * - Draws 5 winning numbers (1 to 50)
 * - Evaluates 5/4/3-number matches across all tickets
 * - Allocates 40% (Tier 1), 35% (Tier 2), 25% (Tier 3)
 * - Equally divides tier pools among winners
 * - If 0 jackpot winners, rolls over Tier 1 to the next draw!
 */
export function simulateMonthlyDraw(
  draw: Draw,
  members: GolferProfile[],
  scores: StablefordScore[],
  options: {
    mode?: DrawMode;
    incomingRolloverUsd?: number;
    customWinningNumbers?: number[];
    subscriptionPriceMonthly?: number;
  } = {}
): DrawSimulationResult {
  const mode = options.mode || draw.mode || 'random';
  const incomingRollover = options.incomingRolloverUsd ?? draw.jackpotRolloverUsd ?? 0;
  const subscriptionPrice = options.subscriptionPriceMonthly ?? 29.0;
  const charitySplit = (draw.charitySplitPercentage ?? 50) / 100;
  const prizePoolShare = 1 - charitySplit;

  // Active subscribers count
  const activeSubscribers = members.filter(m => m.role === 'member' && m.membershipActive);
  const totalSubscribers = Math.max(activeSubscribers.length, 1);

  // Prize pool calculation:
  // Gross = subscribers * $29 (or configured amount)
  // Monthly prize pool = gross * prizePoolShare
  const monthlySubscriptionPool = totalSubscribers * subscriptionPrice * prizePoolShare;
  // If defined prize value is larger, use target prize value or calculated pool
  const baseMonthlyPrizePool = Math.max(monthlySubscriptionPool, draw.prizeValueUsd || 5000);
  const totalPrizePool = Math.round((baseMonthlyPrizePool + incomingRollover) * 100) / 100;

  // Tier Allocations (PRD Mandated 40% / 35% / 25%)
  // Tier 1 receives 40% of the monthly pool PLUS any incoming rollover
  const tier1Pool = Math.round((baseMonthlyPrizePool * 0.40 + incomingRollover) * 100) / 100;
  const tier2Pool = Math.round((baseMonthlyPrizePool * 0.35) * 100) / 100;
  const tier3Pool = Math.round((baseMonthlyPrizePool * 0.25) * 100) / 100;

  // Generate or use 5 winning numbers from 1 to 50
  const winningNumbers = options.customWinningNumbers && options.customWinningNumbers.length === 5
    ? [...options.customWinningNumbers].sort((a, b) => a - b)
    : generateDistinctNumbers(5, 1, 50);

  // Generate tickets for all active subscribers
  const tickets = generateMemberDrawTickets(draw.id, members, scores, mode);

  // Evaluate matches
  const tier1Winners: DrawTierWinner[] = [];
  const tier2Winners: DrawTierWinner[] = [];
  const tier3Winners: DrawTierWinner[] = [];

  const winningSet = new Set(winningNumbers);

  // Keep track of best tier per user so a user doesn't win multiple duplicate lower tiers with same numbers
  const userWinningTiers = new Map<string, 1 | 2 | 3>();

  tickets.forEach(ticket => {
    const matched = ticket.numbers.filter(n => winningSet.has(n));
    const matchCount = matched.length;

    if (matchCount === 5) {
      userWinningTiers.set(ticket.userId, 1);
      tier1Winners.push({
        userId: ticket.userId,
        userName: ticket.userName,
        userEmail: ticket.userEmail,
        userAvatar: ticket.userAvatar,
        ticketNumbers: ticket.numbers,
        matchedNumbers: matched,
        matchCount: 5,
        tier: 1,
        tierName: 'Tier 1 — Major Jackpot (5 Matches)',
        payoutAmount: 0, // Calculated below after count is known
      });
    } else if (matchCount === 4) {
      if (userWinningTiers.get(ticket.userId) !== 1) {
        userWinningTiers.set(ticket.userId, 2);
        tier2Winners.push({
          userId: ticket.userId,
          userName: ticket.userName,
          userEmail: ticket.userEmail,
          userAvatar: ticket.userAvatar,
          ticketNumbers: ticket.numbers,
          matchedNumbers: matched,
          matchCount: 4,
          tier: 2,
          tierName: 'Tier 2 — Runner-Up Work (4 Matches)',
          payoutAmount: 0,
        });
      }
    } else if (matchCount === 3) {
      if (!userWinningTiers.has(ticket.userId)) {
        userWinningTiers.set(ticket.userId, 3);
        tier3Winners.push({
          userId: ticket.userId,
          userName: ticket.userName,
          userEmail: ticket.userEmail,
          userAvatar: ticket.userAvatar,
          ticketNumbers: ticket.numbers,
          matchedNumbers: matched,
          matchCount: 3,
          tier: 3,
          tierName: 'Tier 3 — Performance Booster (3 Matches)',
          payoutAmount: 0,
        });
      }
    }
  });

  // PRD Requirement: Equal sharing among winners in each tier
  if (tier1Winners.length > 0) {
    const share = Math.round((tier1Pool / tier1Winners.length) * 100) / 100;
    tier1Winners.forEach(w => { w.payoutAmount = share; });
  }

  if (tier2Winners.length > 0) {
    const share = Math.round((tier2Pool / tier2Winners.length) * 100) / 100;
    tier2Winners.forEach(w => { w.payoutAmount = share; });
  }

  if (tier3Winners.length > 0) {
    const share = Math.round((tier3Pool / tier3Winners.length) * 100) / 100;
    tier3Winners.forEach(w => { w.payoutAmount = share; });
  }

  // PRD Requirement: 5-Match Jackpot Rollover
  // If no 5-match winner exists, the Tier 1 jackpot pool rolls over to next month's jackpot
  const jackpotRolloverNext = tier1Winners.length === 0 ? tier1Pool : 0;

  const allWinners = [...tier1Winners, ...tier2Winners, ...tier3Winners];

  return {
    drawId: draw.id,
    drawTitle: draw.title,
    mode,
    winningNumbers,
    totalSubscribers,
    totalEntries: tickets.length,
    totalPrizePool,
    jackpotRolloverIncoming: incomingRollover,
    tier1Pool,
    tier2Pool,
    tier3Pool,
    tier1Winners,
    tier2Winners,
    tier3Winners,
    jackpotRolloverNext,
    allWinners,
    executedAt: new Date().toISOString(),
  };
}

/**
 * Converts simulation winners into official WinnerRecord entities ready for database storage.
 */
export function convertSimulationToWinnerRecords(
  simulation: DrawSimulationResult,
  draw: Draw
): WinnerRecord[] {
  return simulation.allWinners.map((winner, idx) => ({
    id: `win-${draw.id}-${winner.userId}-${idx}-${Date.now()}`,
    drawId: draw.id,
    drawTitle: draw.title,
    userId: winner.userId,
    userName: winner.userName,
    userEmail: winner.userEmail,
    userAvatar: winner.userAvatar,
    prizeTitle: `${winner.tierName} — $${winner.payoutAmount.toLocaleString()} USD`,
    prizeValueUsd: winner.payoutAmount,
    matchedNumbers: winner.matchedNumbers,
    tier: winner.tier,
    verificationStatus: 'pending',
    payoutStatus: 'pending',
    createdAt: new Date().toISOString(),
  }));
}
