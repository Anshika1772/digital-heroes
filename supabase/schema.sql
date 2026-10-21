-- ==============================================================================
-- DIGITAL HEROES — SUPABASE PRODUCTION & LOCAL DATABASE SCHEMA
-- Golf Performance & Charitable Impact Platform
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('member', 'admin');
CREATE TYPE membership_tier_type AS ENUM ('monthly', 'yearly', 'complimentary');
CREATE TYPE verification_status_type AS ENUM ('pending', 'verified', 'rejected');
CREATE TYPE payout_status_type AS ENUM ('pending', 'processing', 'paid');
CREATE TYPE draw_status_type AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');

-- 3. CHARITIES TABLE
CREATE TABLE IF NOT EXISTS public.charities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('Youth Golf', 'Environmental Conservation', 'Disabled Golfers', 'Veteran Wellbeing')),
    logo_url TEXT,
    website TEXT,
    total_raised_usd NUMERIC(12, 2) DEFAULT 0.00,
    impact_metric TEXT DEFAULT '100% of allocation goes directly to vetted field programs',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROFILES TABLE (Mirrors auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    handicap_index NUMERIC(3, 1) DEFAULT 14.2 CHECK (handicap_index >= -10.0 AND handicap_index <= 54.0),
    home_club TEXT DEFAULT 'St. Andrews Old Course Links',
    role user_role DEFAULT 'member',
    membership_tier membership_tier_type DEFAULT 'monthly',
    membership_active BOOLEAN DEFAULT TRUE,
    selected_charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
    total_donated_usd NUMERIC(10, 2) DEFAULT 120.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SCORES TABLE
-- Enforces: 1-45 Stableford score validation and unique date per user
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score_date DATE NOT NULL,
    stableford_points INTEGER NOT NULL CHECK (stableford_points >= 1 AND stableford_points <= 45),
    course_name TEXT NOT NULL,
    holes_played INTEGER NOT NULL DEFAULT 18 CHECK (holes_played IN (9, 18)),
    differential NUMERIC(4, 1),
    notes TEXT,
    verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- Enforce unique score date per golfer
    CONSTRAINT unique_user_score_date UNIQUE (user_id, score_date)
);

-- Index for retrieving reverse-chronological latest 5 scores fast
CREATE INDEX IF NOT EXISTS idx_scores_user_date ON public.scores(user_id, score_date DESC);

-- 6. DRAWS TABLE
CREATE TABLE IF NOT EXISTS public.draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    season_month TEXT NOT NULL, -- e.g. "November 2026"
    draw_date TIMESTAMPTZ NOT NULL,
    status draw_status_type DEFAULT 'scheduled',
    prize_tier_label TEXT NOT NULL, -- e.g. "Titleist Masters Experience + $5,000"
    prize_value_usd NUMERIC(10, 2) NOT NULL,
    charity_split_percentage INTEGER DEFAULT 50,
    total_entries INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. DRAW ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.draw_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entries_count INTEGER NOT NULL DEFAULT 1,
    source TEXT NOT NULL CHECK (source IN ('membership_inclusion', 'score_submission_bonus', 'charity_match_booster')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. WINNERS & VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.winners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prize_title TEXT NOT NULL,
    prize_value_usd NUMERIC(10, 2) NOT NULL,
    proof_url TEXT,
    proof_description TEXT,
    proof_submitted_at TIMESTAMPTZ,
    verification_status verification_status_type DEFAULT 'pending',
    verification_notes TEXT,
    payout_status payout_status_type DEFAULT 'pending',
    payout_reference TEXT,
    payout_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- Charities policies
CREATE POLICY "Public read active charities"
    ON public.charities FOR SELECT
    USING (active = TRUE);

CREATE POLICY "Admins full access to charities"
    ON public.charities FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Profiles policies
CREATE POLICY "Users can read own profile and admins can read all"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Scores policies
CREATE POLICY "Users can read own scores"
    ON public.scores FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scores"
    ON public.scores FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND 
        stableford_points >= 1 AND 
        stableford_points <= 45
    );

CREATE POLICY "Users can update own scores"
    ON public.scores FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND 
        stableford_points >= 1 AND 
        stableford_points <= 45
    );

CREATE POLICY "Users can delete own scores"
    ON public.scores FOR DELETE
    USING (auth.uid() = user_id);

-- Draws policies
CREATE POLICY "All authenticated users can view draws"
    ON public.draws FOR SELECT
    TO authenticated
    USING (TRUE);

CREATE POLICY "Admins manage draws"
    ON public.draws FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- Winners policies
CREATE POLICY "Winners can view own winning records"
    ON public.winners FOR SELECT
    USING (
        auth.uid() = user_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
    );

CREATE POLICY "Winners can submit proof for their winning record"
    ON public.winners FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins full access to winners"
    ON public.winners FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
        )
    );

-- ==============================================================================
-- SAMPLE SEED DATA
-- ==============================================================================

INSERT INTO public.charities (id, name, slug, tagline, description, category, total_raised_usd, impact_metric, active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'First Tee Tomorrow', 'first-tee-tomorrow', 'Empowering youth through life skills and character education via golf.', 'Provides underprivileged youth across 42 urban centers with coaching, education mentoring, and tournament equipment.', 'Youth Golf', 84520.00, '3,200 junior clinics funded this year', true),
    ('c2222222-2222-2222-2222-222222222222', 'Fairways for Fair Oceans', 'fairways-oceans', 'Preserving coastal ecosystems and wetlands surrounding golf courses.', 'Funds native water-treatment biofilters, plastic recovery, and marine conservation near 120+ coastal links.', 'Environmental Conservation', 62300.00, '14 tons of marine debris intercepted', true),
    ('c3333333-3333-3333-3333-333333333333', 'Adaptive Fairways Alliance', 'adaptive-fairways', 'Bespoke mobility carts and adaptive swing equipment for para-golfers.', 'Pioneers accessible golf technologies, tournament sponsorship, and rehabilitation courses for injured veterans and athletes.', 'Disabled Golfers', 98150.00, '185 custom solo-rider carts distributed', true),
    ('c4444444-4444-4444-4444-444444444444', 'Honor Caddie Foundation', 'honor-caddie', 'Mental wellness retreats, camaraderie, and career pathways for veterans.', 'Uses golf as outdoor clinical therapy, pairing veterans with PGA certified professionals for rehabilitation.', 'Veteran Wellbeing', 54800.00, '94% self-reported improvement in mental resilience', true)
ON CONFLICT (slug) DO NOTHING;
