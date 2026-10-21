-- ==============================================================================
-- DIGITAL HEROES — SUPABASE PRODUCTION & LOCAL DATABASE SCHEMA
-- Golf Performance & Charitable Impact Platform
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS (Safe creation)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('member', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_tier_type') THEN
        CREATE TYPE membership_tier_type AS ENUM ('monthly', 'yearly', 'complimentary');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status_type') THEN
        CREATE TYPE verification_status_type AS ENUM ('pending', 'verified', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payout_status_type') THEN
        CREATE TYPE payout_status_type AS ENUM ('pending', 'processing', 'paid');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'draw_status_type') THEN
        CREATE TYPE draw_status_type AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled');
    END IF;
END $$;

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
-- Default membership_active is FALSE until a verified payment/subscription webhook confirms payment.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    handicap_index NUMERIC(3, 1) DEFAULT 14.2 CHECK (handicap_index >= -10.0 AND handicap_index <= 54.0),
    home_club TEXT DEFAULT 'St. Andrews Old Course Links',
    role user_role DEFAULT 'member',
    membership_tier membership_tier_type DEFAULT 'monthly',
    membership_active BOOLEAN DEFAULT FALSE,
    selected_charity_id UUID REFERENCES public.charities(id) ON DELETE SET NULL,
    total_donated_usd NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure defaults on existing tables match strict billing requirements
ALTER TABLE public.profiles ALTER COLUMN membership_active SET DEFAULT FALSE;
ALTER TABLE public.profiles ALTER COLUMN total_donated_usd SET DEFAULT 0.00;

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
    CONSTRAINT unique_user_score_date UNIQUE (user_id, score_date)
);

CREATE INDEX IF NOT EXISTS idx_scores_user_date ON public.scores(user_id, score_date DESC);

-- 6. DRAWS TABLE
CREATE TABLE IF NOT EXISTS public.draws (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    season_month TEXT NOT NULL,
    draw_date TIMESTAMPTZ NOT NULL,
    status draw_status_type DEFAULT 'scheduled',
    prize_tier_label TEXT NOT NULL,
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

-- ------------------------------------------------------------------------------
-- A. RECURSION-SAFE ADMIN CHECK FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- Restrict function execution permissions
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- ------------------------------------------------------------------------------
-- B. ROLE & MEMBERSHIP PRIVILEGE SAFEGUARD TRIGGER
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Prevent non-admins from escalating their role or setting active membership
    IF NOT public.is_admin() THEN
        IF NEW.role IS DISTINCT FROM OLD.role THEN
            RAISE EXCEPTION 'Unauthorized: regular members cannot alter account roles';
        END IF;
        IF NEW.membership_active IS DISTINCT FROM OLD.membership_active THEN
            RAISE EXCEPTION 'Unauthorized: membership status can only be modified via verified billing webhooks or administrators';
        END IF;
    END IF;
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;
CREATE TRIGGER tr_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- ------------------------------------------------------------------------------
-- C. PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can read own profile and admins can read all" ON public.profiles;
CREATE POLICY "Users can read own profile and admins can read all"
    ON public.profiles FOR SELECT
    USING (
        auth.uid() = id OR public.is_admin()
    );

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (
        auth.uid() = id AND (
            role = 'member' OR public.is_admin()
        )
    );

-- ------------------------------------------------------------------------------
-- D. CHARITIES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read active charities" ON public.charities;
CREATE POLICY "Public read active charities"
    ON public.charities FOR SELECT
    USING (active = TRUE OR public.is_admin());

DROP POLICY IF EXISTS "Admins full access to charities" ON public.charities;
CREATE POLICY "Admins full access to charities"
    ON public.charities FOR ALL
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- E. SCORES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own scores" ON public.scores;
CREATE POLICY "Users can read own scores"
    ON public.scores FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own scores" ON public.scores;
CREATE POLICY "Users can insert own scores"
    ON public.scores FOR INSERT
    WITH CHECK (
        auth.uid() = user_id AND 
        stableford_points >= 1 AND 
        stableford_points <= 45
    );

DROP POLICY IF EXISTS "Users can update own scores" ON public.scores;
CREATE POLICY "Users can update own scores"
    ON public.scores FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND 
        stableford_points >= 1 AND 
        stableford_points <= 45
    );

DROP POLICY IF EXISTS "Users can delete own scores" ON public.scores;
CREATE POLICY "Users can delete own scores"
    ON public.scores FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- F. DRAWS & DRAW ENTRIES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "All authenticated users can view draws" ON public.draws;
CREATE POLICY "All authenticated users can view draws"
    ON public.draws FOR SELECT
    TO authenticated
    USING (TRUE);

DROP POLICY IF EXISTS "Admins manage draws" ON public.draws;
CREATE POLICY "Admins manage draws"
    ON public.draws FOR ALL
    USING (public.is_admin());

DROP POLICY IF EXISTS "Users can view own draw entries" ON public.draw_entries;
CREATE POLICY "Users can view own draw entries"
    ON public.draw_entries FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own draw entries" ON public.draw_entries;
CREATE POLICY "Users can insert own draw entries"
    ON public.draw_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- G. WINNERS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Winners can view own winning records" ON public.winners;
CREATE POLICY "Winners can view own winning records"
    ON public.winners FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Winners can submit proof for their winning record" ON public.winners;
CREATE POLICY "Winners can submit proof for their winning record"
    ON public.winners FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND (
            -- Non-admins cannot alter verification_status or payout_status
            (verification_status = 'pending' AND payout_status = 'pending') OR
            public.is_admin()
        )
    );

DROP POLICY IF EXISTS "Admins full access to winners" ON public.winners;
CREATE POLICY "Admins full access to winners"
    ON public.winners FOR ALL
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- H. AUTOMATIC USER REGISTRATION TRIGGER (Safe & Resilient)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_charity_id UUID := NULL;
    v_raw_charity TEXT;
    v_handicap NUMERIC(3, 1) := 14.2;
    v_raw_handicap TEXT;
    v_full_name TEXT;
    v_home_club TEXT;
BEGIN
    -- 1. Safely resolve charity foreign key
    v_raw_charity := new.raw_user_meta_data->>'selected_charity_id';
    IF v_raw_charity IS NOT NULL AND v_raw_charity ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        SELECT id INTO v_charity_id
        FROM public.charities
        WHERE id = v_raw_charity::UUID AND active = TRUE;
    END IF;

    -- If candidate charity was not found, default to the first active charity (if any exist), else NULL
    IF v_charity_id IS NULL THEN
        SELECT id INTO v_charity_id
        FROM public.charities
        WHERE active = TRUE
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;

    -- 2. Safely parse and sanitize handicap index (-10.0 to 54.0)
    v_raw_handicap := new.raw_user_meta_data->>'handicap_index';
    IF v_raw_handicap IS NOT NULL AND v_raw_handicap ~ '^-?[0-9]+(\.[0-9]+)?$' THEN
        v_handicap := GREATEST(-10.0, LEAST(54.0, ROUND(v_raw_handicap::NUMERIC, 1)));
    END IF;

    -- 3. Sanitize full name
    v_full_name := COALESCE(
        NULLIF(TRIM(new.raw_user_meta_data->>'full_name'), ''),
        NULLIF(TRIM(split_part(new.email, '@', 1)), ''),
        'Hero Golfer'
    );

    -- 4. Sanitize home club
    v_home_club := COALESCE(
        NULLIF(TRIM(new.raw_user_meta_data->>'home_club'), ''),
        'Pinehurst No. 2 Links'
    );

    -- 5. Insert profile with strict security defaults:
    --    - role is strictly forced to 'member' (never trust metadata role)
    --    - membership_active is FALSE (requires verified subscription)
    --    - total_donated_usd is 0.00
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        handicap_index, 
        home_club, 
        role, 
        membership_tier, 
        membership_active,
        selected_charity_id,
        total_donated_usd
    )
    VALUES (
        new.id,
        new.email,
        v_full_name,
        v_handicap,
        v_home_club,
        'member',
        'monthly',
        FALSE,
        v_charity_id,
        0.00
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SAMPLE SEED DATA (Idempotent)
-- ==============================================================================

INSERT INTO public.charities (id, name, slug, tagline, description, category, total_raised_usd, impact_metric, active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'First Tee Tomorrow', 'first-tee-tomorrow', 'Empowering youth through life skills and character education via golf.', 'Provides underprivileged youth across 42 urban centers with coaching, education mentoring, and tournament equipment.', 'Youth Golf', 84520.00, '3,200 junior clinics funded this year', true),
    ('c2222222-2222-2222-2222-222222222222', 'Fairways for Fair Oceans', 'fairways-oceans', 'Preserving coastal ecosystems and wetlands surrounding golf courses.', 'Funds native water-treatment biofilters, plastic recovery, and marine conservation near 120+ coastal links.', 'Environmental Conservation', 62300.00, '14 tons of marine debris intercepted', true),
    ('c3333333-3333-3333-3333-333333333333', 'Adaptive Fairways Alliance', 'adaptive-fairways', 'Bespoke mobility carts and adaptive swing equipment for para-golfers.', 'Pioneers accessible golf technologies, tournament sponsorship, and rehabilitation courses for injured veterans and athletes.', 'Disabled Golfers', 98150.00, '185 custom solo-rider carts distributed', true),
    ('c4444444-4444-4444-4444-444444444444', 'Honor Caddie Foundation', 'honor-caddie', 'Mental wellness retreats, camaraderie, and career pathways for veterans.', 'Uses golf as outdoor clinical therapy, pairing veterans with PGA certified professionals for rehabilitation.', 'Veteran Wellbeing', 54800.00, '94% self-reported improvement in mental resilience', true)
ON CONFLICT (slug) DO UPDATE SET
    total_raised_usd = EXCLUDED.total_raised_usd,
    active = EXCLUDED.active;

INSERT INTO public.draws (id, title, season_month, draw_date, status, prize_tier_label, prize_value_usd, charity_split_percentage, total_entries)
VALUES
    ('d1111111-1111-1111-1111-111111111111', 'The Autumn Invitational Major Draw', 'November 2026', NOW() + INTERVAL '14 days', 'scheduled', 'Titleist Custom Fitted Works + $5,000 Travel Stipend', 8500.00, 50, 1420),
    ('d2222222-2222-2222-2222-222222222222', 'October Links Championship Draw', 'October 2026', NOW() - INTERVAL '16 days', 'completed', 'Scotty Cameron Tour Prototype & Bandon Dunes Trip', 6200.00, 50, 1280)
ON CONFLICT (id) DO NOTHING;
