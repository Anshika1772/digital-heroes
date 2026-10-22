import React, { useState, useEffect } from 'react';
import { 
  GolferProfile, 
  Charity, 
  StablefordScore, 
  Draw, 
  WinnerRecord, 
  ToastMessage 
} from './types';
import { MockStore } from './lib/mockStore';
import { supabase, isSupabaseConfigured } from './lib/supabase';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ToastContainer } from './components/common/Toast';
import { DemoUserBar } from './components/auth/DemoUserBar';
import { AuthModal } from './components/auth/AuthModal';

// Landing Components
import { Hero } from './components/landing/Hero';
import { HowItWorks } from './components/landing/HowItWorks';
import { CharitiesSection } from './components/landing/CharitiesSection';
import { PrizeTiersSection } from './components/landing/PrizeTiersSection';
import { MembershipPlans } from './components/landing/MembershipPlans';
import { LiveLeaderboardPreview } from './components/landing/LiveLeaderboardPreview';

// Member Components
import { MemberDashboard } from './components/member/MemberDashboard';

// Admin Components
import { AdminDashboard } from './components/admin/AdminDashboard';

const isUUID = (str?: string | null): boolean =>
  Boolean(str && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str));

export function App() {
  // Store States
  const [currentUser, setCurrentUser] = useState<GolferProfile | null>(() => MockStore.getCurrentUser());
  const [profiles, setProfiles] = useState<GolferProfile[]>(() => MockStore.getProfiles());
  const [charities, setCharities] = useState<Charity[]>(() => MockStore.getCharities());
  const [scores, setScores] = useState<StablefordScore[]>(() => MockStore.getScores());
  const [draws, setDraws] = useState<Draw[]>(() => MockStore.getDraws());
  const [winners, setWinners] = useState<WinnerRecord[]>(() => MockStore.getWinners());

  // Navigation & Modals State
  const [activeView, setActiveView] = useState<'landing' | 'member' | 'admin'>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Toast Helpers
  const addToast = (type: 'success' | 'error' | 'info', message: string, title?: string) => {
    const newToast: ToastMessage = {
      id: 'toast-' + Date.now() + Math.random().toString(),
      type,
      message,
      title,
    };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch user scores from Supabase
  const fetchUserScores = async (userId: string) => {
    if (!isSupabaseConfigured || !supabase || !isUUID(userId)) return;
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .order('score_date', { ascending: false });

      if (!error && data) {
        const liveScores: StablefordScore[] = data.map((s: any) => ({
          id: s.id,
          userId: s.user_id,
          scoreDate: s.score_date,
          stablefordPoints: Number(s.stableford_points),
          courseName: s.course_name,
          holesPlayed: Number(s.holes_played) as 9 | 18,
          notes: s.notes || undefined,
          verified: Boolean(s.verified),
          createdAt: s.created_at || new Date().toISOString(),
        }));

        setScores((prev) => {
          const otherScores = prev.filter((s) => s.userId !== userId);
          return [...liveScores, ...otherScores];
        });
      }
    } catch (err) {
      console.warn('Failed to fetch user scores from Supabase:', err);
    }
  };

  const syncSupabaseSession = async (user: any) => {
    if (!supabase) return;
    try {
      const { data: dbProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      const profile: GolferProfile = dbProfile ? {
        id: dbProfile.id,
        email: dbProfile.email || user.email || '',
        fullName: dbProfile.full_name || user.user_metadata?.full_name || 'Verified Golfer',
        avatarUrl: dbProfile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        handicapIndex: Number(dbProfile.handicap_index) || 12.0,
        homeClub: dbProfile.home_club || user.user_metadata?.home_club || 'Pebble Beach Links',
        role: (dbProfile.role as any) || 'member',
        membershipTier: (dbProfile.membership_tier as any) || 'monthly',
        membershipActive: dbProfile.membership_active ?? true,
        selectedCharityId: dbProfile.selected_charity_id || 'charity-1',
        totalDonated: Number(dbProfile.total_donated) || 0,
        createdAt: dbProfile.created_at || user.created_at || new Date().toISOString()
      } : {
        id: user.id,
        email: user.email || '',
        fullName: user.user_metadata?.full_name || 'Verified Golfer',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        handicapIndex: user.user_metadata?.handicap_index || 12.0,
        homeClub: user.user_metadata?.home_club || 'Pebble Beach Links',
        role: (user.user_metadata?.role as any) || 'member',
        membershipTier: 'monthly',
        membershipActive: true,
        selectedCharityId: 'charity-1',
        totalDonated: 0,
        createdAt: user.created_at || new Date().toISOString()
      };

      setCurrentUser(profile);
      MockStore.setCurrentUserId(profile.id);
      setActiveView(prev => (prev === 'landing' ? (profile.role === 'admin' ? 'admin' : 'member') : prev));
      await fetchUserScores(profile.id);
    } catch (err) {
      console.warn('Error syncing Supabase user profile:', err);
    }
  };

  // Auth session listener & live Supabase data initialization
  useEffect(() => {
    const client = supabase;
    if (!client) return;

    let authSubscription: { unsubscribe: () => void } | null = null;

    const setupAuthAndData = async () => {
      try {
        // 1. Fetch live charities
        const { data: charityData, error: charityError } = await client
          .from('charities')
          .select('*');

        if (!charityError && charityData && charityData.length > 0) {
          const liveCharities = charityData.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            tagline: c.tagline,
            description: c.description || '',
            category: c.category,
            logoUrl: c.logo_url,
            website: c.website,
            totalRaised: Number(c.total_raised_usd) || 0,
            impactMetric: c.impact_metric || '',
            active: Boolean(c.active),
          }));
          setCharities(liveCharities);
        }

        // 2. Fetch live draws
        const { data: drawData, error: drawError } = await client
          .from('draws')
          .select('*');

        if (!drawError && drawData && drawData.length > 0) {
          const liveDraws = drawData.map((d: any) => ({
            id: d.id,
            title: d.title,
            seasonMonth: d.season_month,
            drawDate: d.draw_date,
            status: d.status,
            prizeTierLabel: d.prize_tier_label,
            prizeValueUsd: Number(d.prize_value_usd) || 0,
            charitySplitPercentage: d.charity_split_percentage || 50,
            totalEntries: d.total_entries || 0,
          }));
          setDraws(liveDraws);
        }

        // 3. Check existing Supabase session (e.g. from page reload)
        if (isSupabaseConfigured) {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            await syncSupabaseSession(session.user);
          }

          // 4. Listen for auth changes (including email verification callback)
          const { data: { subscription } } = client.auth.onAuthStateChange(async (event, currentSession) => {
            if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && currentSession?.user) {
              await syncSupabaseSession(currentSession.user);
              if (window.location.hash && (window.location.hash.includes('access_token') || window.location.hash.includes('type='))) {
                window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
                addToast('success', 'Email confirmed! Welcome to Digital Heroes.', 'Account Verified');
              }
            } else if (event === 'SIGNED_OUT') {
              setCurrentUser(null);
              setActiveView('landing');
            }
          });
          authSubscription = subscription;
        }
      } catch (err) {
        console.warn('Supabase initialization warning:', err);
      }
    };

    setupAuthAndData();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Sync state refresh
  const refreshAllState = () => {
    setProfiles(MockStore.getProfiles());
    setCharities(MockStore.getCharities());
    setScores(MockStore.getScores());
    setDraws(MockStore.getDraws());
    setWinners(MockStore.getWinners());
    setCurrentUser(prev => {
      if (!prev) return null;
      const foundInMock = MockStore.getProfiles().find(p => p.id === prev.id);
      return foundInMock || prev;
    });
  };

  // Switch Active Test User
  const handleSelectUser = async (user: GolferProfile | null) => {
    if (user) {
      MockStore.setCurrentUserId(user.id);
      setCurrentUser(user);
      if (isUUID(user.id)) {
        await fetchUserScores(user.id);
      }
      if (user.role === 'admin') {
        setActiveView('admin');
        addToast('info', `Switched to ${user.fullName} (Platform Admin Console)`);
      } else {
        setActiveView('member');
        addToast('success', `Switched to ${user.fullName} (Member Dashboard)`);
      }
    } else {
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.auth.signOut();
        } catch (e) {
          console.warn('Supabase signOut error:', e);
        }
      }
      MockStore.setCurrentUserId('');
      setCurrentUser(null);
      setActiveView('landing');
      addToast('info', 'Switched to Guest Browsing Mode');
    }
  };

  // Reset Demo Data
  const handleResetData = () => {
    MockStore.resetToDefault();
    refreshAllState();
    setActiveView('landing');
    addToast('success', 'Demo data reset to initial benchmark state.');
  };

  // Navigation Handler
  const handleNavigate = (view: 'landing' | 'member' | 'admin') => {
    if ((view === 'member' || view === 'admin') && !currentUser) {
      setAuthMode('signin');
      setIsAuthModalOpen(true);
      return;
    }
    if (view === 'admin' && currentUser?.role !== 'admin') {
      addToast('error', 'Administrator privileges required to access the Admin Console.');
      return;
    }
    setActiveView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Score Add (Validation rules: 1-45, unique date)
  const handleAddScore = async (scoreData: {
    scoreDate: string;
    stablefordPoints: number;
    courseName: string;
    holesPlayed: 9 | 18;
    notes?: string;
  }): Promise<{ success: boolean; error?: string; score?: StablefordScore }> => {
    if (!currentUser) return { success: false, error: 'User not signed in.' };

    // Validate points strictly as integer between 1 and 45
    if (typeof scoreData.stablefordPoints !== 'number' || !Number.isInteger(scoreData.stablefordPoints)) {
      return { success: false, error: 'Stableford points must be a whole integer.' };
    }
    if (scoreData.stablefordPoints < 1 || scoreData.stablefordPoints > 45) {
      return { 
        success: false, 
        error: `Stableford score must be between 1 and 45 points. You entered ${scoreData.stablefordPoints}.` 
      };
    }

    // Validate date
    if (!scoreData.scoreDate || isNaN(new Date(scoreData.scoreDate).getTime())) {
      return { success: false, error: 'A valid round date is required.' };
    }
    const todayStr = new Date().toISOString().split('T')[0];
    if (scoreData.scoreDate > todayStr) {
      return { success: false, error: 'Round date cannot be in the future.' };
    }

    // Validate course name
    const cleanCourse = (scoreData.courseName || '').trim();
    if (cleanCourse.length < 2 || cleanCourse.length > 100) {
      return { success: false, error: 'Course name must be between 2 and 100 characters.' };
    }

    // Enforce unique score date per user
    const existingUserScores = scores.filter(s => s.userId === currentUser.id);
    const dateConflict = existingUserScores.find(s => s.scoreDate === scoreData.scoreDate);
    if (dateConflict) {
      const msg = `A round on ${scoreData.scoreDate} is already recorded (${dateConflict.courseName} - ${dateConflict.stablefordPoints} pts). Each date can only have one official score.`;
      addToast('error', msg, 'Duplicate Round Date');
      return { success: false, error: msg };
    }

    // If live Supabase user, insert into Supabase scores table
    if (isSupabaseConfigured && supabase && isUUID(currentUser.id)) {
      try {
        const { data, error } = await supabase
          .from('scores')
          .insert({
            user_id: currentUser.id,
            score_date: scoreData.scoreDate,
            stableford_points: scoreData.stablefordPoints,
            course_name: cleanCourse,
            holes_played: scoreData.holesPlayed,
            notes: scoreData.notes ? scoreData.notes.trim().slice(0, 500) : null,
            draw_tickets_earned: 3,
            verified: false // Enforced by database trigger: regular members cannot self-verify
          })
          .select()
          .single();

        if (error) {
          let errorMsg = error.message;
          if (error.code === '23505' || error.message.includes('unique_user_score_date')) {
            errorMsg = `A round on ${scoreData.scoreDate} is already recorded. Each date can only have one official score.`;
          }
          addToast('error', errorMsg, 'Database Error');
          return { success: false, error: errorMsg };
        }

        if (data) {
          const newScore: StablefordScore = {
            id: data.id,
            userId: data.user_id,
            scoreDate: data.score_date,
            stablefordPoints: Number(data.stableford_points),
            courseName: data.course_name,
            holesPlayed: Number(data.holes_played) as 9 | 18,
            notes: data.notes || undefined,
            verified: Boolean(data.verified),
            createdAt: data.created_at || new Date().toISOString(),
          };

          setScores(prev => [newScore, ...prev]);

          // Also mirror in MockStore for fallback
          MockStore.addScore({
            userId: currentUser.id,
            scoreDate: scoreData.scoreDate,
            stablefordPoints: scoreData.stablefordPoints,
            courseName: cleanCourse,
            holesPlayed: scoreData.holesPlayed,
            notes: scoreData.notes,
          });

          addToast(
            'success',
            `Round at ${cleanCourse} logged (${scoreData.stablefordPoints} pts). Saved to Supabase! Earned +3 Draw Tickets!`,
            'Score Validated'
          );
          return { success: true, score: newScore };
        }
      } catch (dbErr: any) {
        console.warn('Supabase score insert failed, falling back to local store:', dbErr);
      }
    }

    // Fallback / Offline Demo User score addition
    const result = MockStore.addScore({
      userId: currentUser.id,
      scoreDate: scoreData.scoreDate,
      stablefordPoints: scoreData.stablefordPoints,
      courseName: cleanCourse,
      holesPlayed: scoreData.holesPlayed,
      notes: scoreData.notes,
    });

    if (result.success && result.score) {
      setScores(prev => [result.score!, ...prev]);
      addToast(
        'success',
        `Round at ${cleanCourse} logged (${scoreData.stablefordPoints} pts). Earned +3 Draw Tickets!`,
        'Score Validated'
      );
    } else {
      addToast('error', result.error || 'Failed to submit score.', 'Validation Error');
    }

    return result;
  };

  // Handle Score Update
  const handleUpdateScore = async (updatedScore: StablefordScore): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase && isUUID(updatedScore.id)) {
      try {
        const { error } = await supabase
          .from('scores')
          .update({
            score_date: updatedScore.scoreDate,
            stableford_points: updatedScore.stablefordPoints,
            course_name: updatedScore.courseName,
            holes_played: updatedScore.holesPlayed,
            notes: updatedScore.notes || null,
          })
          .eq('id', updatedScore.id);

        if (error) {
          addToast('error', error.message, 'Update Failed');
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        console.warn('Supabase score update error:', err);
      }
    }

    const result = MockStore.updateScore(updatedScore);
    if (result.success) {
      setScores(prev => prev.map(s => s.id === updatedScore.id ? updatedScore : s));
      addToast('success', 'Score details updated successfully.');
    } else {
      addToast('error', result.error || 'Failed to update score.', 'Validation Error');
    }
    return result;
  };

  // Handle Score Delete
  const handleDeleteScore = async (scoreId: string) => {
    if (isSupabaseConfigured && supabase && isUUID(scoreId)) {
      try {
        await supabase.from('scores').delete().eq('id', scoreId);
      } catch (err: any) {
        console.warn('Supabase score delete error:', err);
      }
    }

    MockStore.deleteScore(scoreId);
    setScores(prev => prev.filter(s => s.id !== scoreId));
    addToast('info', 'Score record removed.');
  };

  // Handle Charity Change
  const handleSelectCharity = (charityId: string) => {
    if (!currentUser) return;
    const updated = MockStore.updateProfile({
      ...currentUser,
      selectedCharityId: charityId,
    });
    setCurrentUser(updated);
    refreshAllState();
    const ch = charities.find(c => c.id === charityId);
    addToast('success', `Your 50% monthly allocation is now directed to ${ch?.name || 'selected cause'}.`, 'Charity Updated');
  };

  // Handle Winner Proof Submit
  const handleSubmitWinnerProof = (winnerId: string, proofUrl: string, description: string) => {
    const res = MockStore.submitWinnerProof(winnerId, proofUrl, description);
    if (res.success) {
      refreshAllState();
      addToast('success', 'Scorecard proof submitted! Administrator verification pending.', 'Proof Received');
    } else {
      addToast('error', res.error || 'Failed to submit proof.');
    }
  };

  // Handle Direct Donation Booster
  const handleAddDirectDonation = (amount: number, charityId: string) => {
    if (!currentUser) return { success: false, error: 'Sign in required.' };
    const res = MockStore.addDirectDonation(currentUser.id, charityId, amount);
    if (res.success) {
      refreshAllState();
      addToast('success', `Direct contribution of $${amount.toFixed(2)} recorded to charity escrow!`, 'Donation Received');
    } else {
      addToast('error', res.error || 'Failed to process donation.');
    }
    return res;
  };

  // Handle Draw Simulation
  const handleExecuteDraw = (drawId: string) => {
    const res = MockStore.executeDrawSimulation(currentUser?.id || '', drawId);
    if (res.success && res.winner) {
      refreshAllState();
      addToast('success', `Winner selected: ${res.winner.userName} for ${res.winner.prizeTitle}!`, 'Draw Completed');
    } else {
      addToast('error', res.error || 'Could not complete draw simulation.');
    }
    return res;
  };

  // Handle Winner Verification (Admin)
  const handleVerifyWinner = (winnerId: string, status: 'verified' | 'rejected', notes?: string) => {
    const res = MockStore.verifyWinnerProof(currentUser?.id || '', winnerId, status, notes);
    if (res.success) {
      refreshAllState();
      addToast(
        status === 'verified' ? 'success' : 'error',
        `Winner claim marked as ${status.toUpperCase()}.`,
        'Verification Audit Logged'
      );
    } else {
      addToast('error', res.error || 'Verification action failed.');
    }
  };

  // Handle Payout Status Update (Admin)
  const handleUpdatePayout = (winnerId: string, status: 'pending' | 'processing' | 'paid', ref?: string) => {
    const res = MockStore.updatePayoutStatus(currentUser?.id || '', winnerId, status, ref);
    if (res.success) {
      refreshAllState();
      addToast('success', `Payout updated to ${status.toUpperCase()} (${ref || 'N/A'}).`, 'Disbursement Updated');
    } else {
      addToast('error', res.error || 'Failed to update payout status.');
    }
  };

  // Handle Add Charity (Admin)
  const handleAddCharity = (charityData: Omit<Charity, 'id'>) => {
    const res = MockStore.addCharity(charityData);
    if (res.success && res.charity) {
      refreshAllState();
      addToast('success', `Added new foundation: ${res.charity.name}`, 'Cause Onboarded');
    } else {
      addToast('error', res.error || 'Failed to onboard charity.');
    }
  };

  // Handle Update Charity (Admin)
  const handleUpdateCharity = (charity: Charity) => {
    MockStore.updateCharity(charity);
    refreshAllState();
    addToast('info', `Charity ${charity.name} updated.`);
  };

  // Handle Toggle User Role (Admin)
  const handleToggleUserRole = (user: GolferProfile) => {
    const newRole = user.role === 'admin' ? 'member' : 'admin';
    const updated = MockStore.updateProfile({ ...user, role: newRole });
    refreshAllState();
    addToast('info', `${user.fullName} is now assigned the role of ${newRole.toUpperCase()}.`);
  };

  // Handle Toggle User Status (Admin)
  const handleToggleUserStatus = (user: GolferProfile) => {
    const updated = MockStore.updateProfile({ ...user, membershipActive: !user.membershipActive });
    refreshAllState();
    addToast('info', `${user.fullName} status updated.`);
  };

  // Upcoming draw
  const upcomingDraw = draws.find(d => d.status === 'scheduled') || draws[0];

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-ink-900 selection:bg-forest-900 selection:text-lime-300">
      
      {/* 1-Click Interactive Demo Testing Bar */}
      <DemoUserBar
        currentUser={currentUser}
        profiles={profiles}
        onSelectUser={handleSelectUser}
        onResetData={handleResetData}
      />

      {/* Main Responsive Navigation */}
      <Navbar
        currentUser={currentUser}
        activeView={activeView}
        onNavigate={handleNavigate}
        onOpenAuth={(mode) => {
          setAuthMode(mode || 'signin');
          setIsAuthModalOpen(true);
        }}
        onSignOut={() => handleSelectUser(null)}
      />

      {/* Main View Router */}
      <main className="flex-grow">
        {activeView === 'landing' && (
          <div className="animate-in fade-in duration-200">
            {/* Hero Section */}
            <Hero
              onJoin={() => {
                setAuthMode('signup');
                setIsAuthModalOpen(true);
              }}
              onExploreCharities={() => {
                const el = document.getElementById('charities');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              onQuickDemo={() => {
                const member = profiles.find(p => p.role === 'member') || profiles[0];
                handleSelectUser(member);
              }}
            />

            {/* How It Works Section */}
            <HowItWorks />

            {/* Charities Section */}
            <CharitiesSection
              charities={charities.filter(c => c.active)}
              selectedCharityId={currentUser?.selectedCharityId}
              onSelectCharity={(id) => {
                if (currentUser) {
                  handleSelectCharity(id);
                } else {
                  setAuthMode('signup');
                  setIsAuthModalOpen(true);
                }
              }}
            />

            {/* Prize Tiers Section */}
            <PrizeTiersSection
              upcomingDraw={upcomingDraw}
              onEnterDraw={() => {
                if (currentUser) {
                  handleNavigate('member');
                } else {
                  setAuthMode('signup');
                  setIsAuthModalOpen(true);
                }
              }}
            />

            {/* Membership Plans Section */}
            <MembershipPlans
              onSelectPlan={(plan) => {
                setAuthMode('signup');
                setIsAuthModalOpen(true);
              }}
            />

            {/* Live Leaderboard & Champions Preview */}
            <LiveLeaderboardPreview
              scores={scores}
              winners={winners}
              onOpenScoreModal={() => {
                if (currentUser) {
                  handleNavigate('member');
                } else {
                  setAuthMode('signin');
                  setIsAuthModalOpen(true);
                }
              }}
            />
          </div>
        )}

        {activeView === 'member' && currentUser && (
          <div className="animate-in fade-in duration-200">
            <MemberDashboard
              currentUser={currentUser}
              charities={charities.filter(c => c.active)}
              scores={scores}
              draws={draws}
              winners={winners}
              onAddScore={handleAddScore}
              onUpdateScore={handleUpdateScore}
              onDeleteScore={handleDeleteScore}
              onSelectCharity={handleSelectCharity}
              onSubmitWinnerProof={handleSubmitWinnerProof}
              onAddDirectDonation={handleAddDirectDonation}
            />
          </div>
        )}

        {activeView === 'admin' && currentUser?.role === 'admin' && (
          <div className="animate-in fade-in duration-200">
            <AdminDashboard
              currentUser={currentUser}
              profiles={profiles}
              charities={charities}
              scores={scores}
              winners={winners}
              draws={draws}
              onToggleUserRole={handleToggleUserRole}
              onToggleUserStatus={handleToggleUserStatus}
              onAddCharity={handleAddCharity}
              onUpdateCharity={handleUpdateCharity}
              onExecuteDraw={handleExecuteDraw}
              onVerifyWinner={handleVerifyWinner}
              onUpdatePayout={handleUpdatePayout}
              onExitAdmin={() => setActiveView('member')}
            />
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
        profiles={profiles}
        onLogin={(user) => {
          handleSelectUser(user);
        }}
      />

      {/* Notification Toast Stream */}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
      />

    </div>
  );
}
export default App;
