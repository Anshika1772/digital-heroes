/**
 * Comprehensive Validation & Error Handling Test Suite for Digital Heroes
 */
import { MockStore } from '../lib/mockStore';

export function runValidationAudit(): { passed: number; failed: number; results: string[] } {
  let passed = 0;
  let failed = 0;
  const results: string[] = [];

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      passed++;
      results.push(`PASS: ${testName}`);
    } else {
      failed++;
      results.push(`FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    }
  }

  // --- 1. GOLF SCORES VALIDATION ---
  const testUserId = 'test-golfer-audit';

  // 1a. Invalid scores: 0, 46, 36.5, NaN
  const resZero = MockStore.addScore({
    userId: testUserId,
    scoreDate: '2026-10-01',
    stablefordPoints: 0,
    courseName: 'Test Links',
    holesPlayed: 18,
  });
  assert(!resZero.success, 'Score 0 pts is rejected (below min 1)');

  const resOver = MockStore.addScore({
    userId: testUserId,
    scoreDate: '2026-10-01',
    stablefordPoints: 46,
    courseName: 'Test Links',
    holesPlayed: 18,
  });
  assert(!resOver.success, 'Score 46 pts is rejected (above max 45)');

  const resDecimal = MockStore.addScore({
    userId: testUserId,
    scoreDate: '2026-10-01',
    stablefordPoints: 36.5 as any,
    courseName: 'Test Links',
    holesPlayed: 18,
  });
  assert(!resDecimal.success, 'Score 36.5 (decimal) is rejected');

  const resNan = MockStore.addScore({
    userId: testUserId,
    scoreDate: '2026-10-01',
    stablefordPoints: NaN,
    courseName: 'Test Links',
    holesPlayed: 18,
  });
  assert(!resNan.success, 'Score NaN is rejected');

  // 1b. Valid score boundaries: 1 and 45
  const resMin = MockStore.addScore({
    userId: testUserId,
    scoreDate: '2026-09-01',
    stablefordPoints: 1,
    courseName: 'Test Links 1',
    holesPlayed: 18,
  });
  assert(resMin.success, 'Score 1 pt (minimum boundary) is accepted');

  const resMax = MockStore.addScore({
    userId: testUserId,
    scoreDate: '2026-09-02',
    stablefordPoints: 45,
    courseName: 'Test Links 2',
    holesPlayed: 18,
  });
  assert(resMax.success, 'Score 45 pts (maximum boundary) is accepted');

  // 1c. Duplicate score date check
  const resDup = MockStore.addScore({
    userId: testUserId,
    scoreDate: '2026-09-02', // Same as resMax
    stablefordPoints: 38,
    courseName: 'Another Course',
    holesPlayed: 18,
  });
  assert(!resDup.success && Boolean(resDup.error?.includes('already recorded')), 'Duplicate round date on same day is rejected');

  // 1d. Future date check
  const futureDate = '2030-01-01';
  const resFuture = MockStore.addScore({
    userId: testUserId,
    scoreDate: futureDate,
    stablefordPoints: 36,
    courseName: 'Future Club',
    holesPlayed: 18,
  });
  assert(!resFuture.success, 'Future round date is rejected');

  // 1e. Rolling off scores older than latest five
  MockStore.addScore({ userId: testUserId, scoreDate: '2026-09-03', stablefordPoints: 35, courseName: 'C3', holesPlayed: 18 });
  MockStore.addScore({ userId: testUserId, scoreDate: '2026-09-04', stablefordPoints: 37, courseName: 'C4', holesPlayed: 18 });
  MockStore.addScore({ userId: testUserId, scoreDate: '2026-09-05', stablefordPoints: 39, courseName: 'C5', holesPlayed: 18 });
  MockStore.addScore({ userId: testUserId, scoreDate: '2026-09-06', stablefordPoints: 40, courseName: 'C6', holesPlayed: 18 });

  const userScores = MockStore.getScoresForUser(testUserId);
  assert(userScores.length === 5, 'User score log rolls off older scores and retains strictly latest 5', `count: ${userScores.length}`);
  assert(userScores[0].scoreDate === '2026-09-06', 'Scores are sorted in reverse chronological order (newest first)');

  // Clean up test scores
  userScores.forEach(s => MockStore.deleteScore(s.id));

  // --- 2. CHARITY & DONATIONS VALIDATION ---
  const resDonNeg = MockStore.addDirectDonation('user-alex-mercer', 'charity-1', -10);
  assert(!resDonNeg.success, 'Negative donation is rejected');

  const resDonZero = MockStore.addDirectDonation('user-alex-mercer', 'charity-1', 0);
  assert(!resDonZero.success, 'Zero donation is rejected');

  const resDonUnder = MockStore.addDirectDonation('user-alex-mercer', 'charity-1', 2);
  assert(!resDonUnder.success, 'Donation below minimum ($5) is rejected');

  const resDonOver = MockStore.addDirectDonation('user-alex-mercer', 'charity-1', 6000);
  assert(!resDonOver.success, 'Donation above maximum ($5,000) is rejected');

  const resDonValid = MockStore.addDirectDonation('user-alex-mercer', 'charity-1', 50);
  assert(resDonValid.success, 'Valid donation ($50.00) is accepted and recorded');

  // --- 3. ROLE-BASED ADMIN AUTHORIZATION ---
  // Member trying to execute draw
  const resMemberDraw = MockStore.executeDrawSimulation('user-alex-mercer', 'draw-nov-2026');
  assert(!resMemberDraw.success && Boolean(resMemberDraw.error?.includes('Unauthorized')), 'Member cannot execute draw simulation (Admin check)');

  // Member trying to verify winner proof
  const resMemberVerify = MockStore.verifyWinnerProof('user-alex-mercer', 'winner-alex-oct', 'verified');
  assert(!resMemberVerify.success && Boolean(resMemberVerify.error?.includes('Unauthorized')), 'Member cannot verify winner proofs (Admin check)');

  // Member trying to update payout
  const resMemberPayout = MockStore.updatePayoutStatus('user-alex-mercer', 'winner-alex-oct', 'paid', 'PAY-TEST-1234');
  assert(!resMemberPayout.success && Boolean(resMemberPayout.error?.includes('Unauthorized')), 'Member cannot authorize payouts (Admin check)');

  // Admin executing draw
  const resAdminDraw = MockStore.executeDrawSimulation('user-admin-marcus', 'draw-nov-2026');
  assert(resAdminDraw.success, 'Admin successfully authorized to execute draw simulation');

  // Payout validation: cannot mark as paid if not verified
  const winners = MockStore.getWinners();
  const unverified = winners.find(w => w.verificationStatus === 'pending');
  if (unverified) {
    const resPrematurePayout = MockStore.updatePayoutStatus('user-admin-marcus', unverified.id, 'paid', 'PAY-DH-999');
    assert(!resPrematurePayout.success, 'Payout cannot be marked as paid until proof is verified');
  }

  // --- 4. CHARITY CREATION VALIDATION ---
  const resCharityShort = MockStore.addCharity({
    name: 'A',
    category: 'Youth Golf',
    tagline: 'Short',
    description: 'Desc',
    impactMetric: 'Impact',
    website: 'invalid-url',
    totalRaised: 0,
    active: true,
    slug: 'a'
  });
  assert(!resCharityShort.success, 'Charity with invalid URL / short name is rejected');

  return { passed, failed, results };
}
