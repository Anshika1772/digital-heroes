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

  // Sync state refresh
  const refreshAllState = () => {
    setProfiles(MockStore.getProfiles());
    setCharities(MockStore.getCharities());
    setScores(MockStore.getScores());
    setDraws(MockStore.getDraws());
    setWinners(MockStore.getWinners());
    const currId = MockStore.getCurrentUserId();
    const curr = MockStore.getProfiles().find(p => p.id === currId) || null;
    setCurrentUser(curr);
  };

  // Switch Active Test User
  const handleSelectUser = (user: GolferProfile | null) => {
    if (user) {
      MockStore.setCurrentUserId(user.id);
      setCurrentUser(user);
      if (user.role === 'admin') {
        setActiveView('admin');
        addToast('info', `Switched to ${user.fullName} (Platform Admin Console)`);
      } else {
        setActiveView('member');
        addToast('success', `Switched to ${user.fullName} (Member Dashboard)`);
      }
    } else {
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
  const handleAddScore = (scoreData: {
    scoreDate: string;
    stablefordPoints: number;
    courseName: string;
    holesPlayed: 9 | 18;
    notes?: string;
  }) => {
    if (!currentUser) return { success: false, error: 'User not signed in.' };

    const result = MockStore.addScore({
      userId: currentUser.id,
      ...scoreData,
    });

    if (result.success) {
      refreshAllState();
      addToast('success', `Round at ${scoreData.courseName} logged (${scoreData.stablefordPoints} pts). Earned +3 Draw Tickets!`, 'Score Validated');
    } else {
      addToast('error', result.error || 'Failed to submit score.', 'Validation Error');
    }

    return result;
  };

  // Handle Score Update
  const handleUpdateScore = (updatedScore: StablefordScore) => {
    const result = MockStore.updateScore(updatedScore);
    if (result.success) {
      refreshAllState();
      addToast('success', 'Score details updated successfully.');
    } else {
      addToast('error', result.error || 'Failed to update score.', 'Validation Error');
    }
    return result;
  };

  // Handle Score Delete
  const handleDeleteScore = (scoreId: string) => {
    MockStore.deleteScore(scoreId);
    refreshAllState();
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

  // Handle Draw Simulation
  const handleExecuteDraw = (drawId: string) => {
    const res = MockStore.executeDrawSimulation(drawId);
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
    MockStore.verifyWinnerProof(winnerId, status, notes);
    refreshAllState();
    addToast(
      status === 'verified' ? 'success' : 'error',
      `Winner claim marked as ${status.toUpperCase()}.`,
      'Verification Audit Logged'
    );
  };

  // Handle Payout Status Update (Admin)
  const handleUpdatePayout = (winnerId: string, status: 'pending' | 'processing' | 'paid', ref?: string) => {
    MockStore.updatePayoutStatus(winnerId, status, ref);
    refreshAllState();
    addToast('success', `Payout updated to ${status.toUpperCase()} (${ref || 'N/A'}).`, 'Disbursement Updated');
  };

  // Handle Add Charity (Admin)
  const handleAddCharity = (charityData: Omit<Charity, 'id'>) => {
    MockStore.addCharity(charityData);
    refreshAllState();
    addToast('success', `Added new foundation: ${charityData.name}`, 'Cause Onboarded');
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
