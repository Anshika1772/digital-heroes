-- ==============================================================================
-- DIGITAL HEROES — COMPLETE IDEMPOTENT SUPABASE MIGRATION
-- Project: Digital Heroes (Golf Performance & Charitable Impact Platform)
-- File: supabase/new_project_migration.sql
-- Description: Production-hardened schema initialization for the NEW project.
--              Includes recursion-proof RLS policies, dual-barrier trigger
--              protection for billing/roles/payouts/scores, strict access controls,
--              and isolated demonstration seed data.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. CUSTOM TYPES / ENUMS (Safe Idempotent Creation)
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 3. CHARITIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.charities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    tagline TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN (
        'Youth Golf', 
        'Environmental Conservation', 
        'Disabled Golfers', 
        'Veteran Wellbeing'
    )),
    logo_url TEXT,
    website TEXT,
    total_raised_usd NUMERIC(12, 2) DEFAULT 0.00 CHECK (total_raised_usd >= 0.00),
    impact_metric TEXT DEFAULT '100% of allocation goes directly to vetted field programs',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. PROFILES TABLE (Mirrors auth.users)
-- ------------------------------------------------------------------------------
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
    total_donated_usd NUMERIC(10, 2) DEFAULT 0.00 CHECK (total_donated_usd >= 0.00),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enforce strict default values on existing columns
ALTER TABLE public.profiles ALTER COLUMN membership_active SET DEFAULT FALSE;
ALTER TABLE public.profiles ALTER COLUMN total_donated_usd SET DEFAULT 0.00;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'member';

-- ------------------------------------------------------------------------------
-- 5. SCORES TABLE
-- Stableford round rules: 1 to 45 pts, 9 or 18 holes, unique round date per golfer.
-- SECURITY ENFORCEMENT: Newly submitted scores strictly default to verified = FALSE.
-- Only administrators or verified marker services can verify rounds.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    score_date DATE NOT NULL,
    stableford_points INTEGER NOT NULL CHECK (stableford_points >= 1 AND stableford_points <= 45),
    course_name TEXT NOT NULL,
    holes_played INTEGER NOT NULL DEFAULT 18 CHECK (holes_played IN (9, 18)),
    differential NUMERIC(4, 1),
    notes TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_score_date UNIQUE (user_id, score_date)
);

ALTER TABLE public.scores ALTER COLUMN verified SET DEFAULT FALSE;

-- ------------------------------------------------------------------------------
-- 6. DRAWS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.draws (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    season_month TEXT NOT NULL,
    draw_date TIMESTAMPTZ NOT NULL,
    status draw_status_type DEFAULT 'scheduled',
    prize_tier_label TEXT NOT NULL,
    prize_value_usd NUMERIC(10, 2) NOT NULL CHECK (prize_value_usd >= 0.00),
    charity_split_percentage INTEGER DEFAULT 50 CHECK (charity_split_percentage BETWEEN 0 AND 100),
    total_entries INTEGER DEFAULT 0 CHECK (total_entries >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. DRAW ENTRIES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.draw_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entries_count INTEGER NOT NULL DEFAULT 1 CHECK (entries_count >= 1),
    source TEXT NOT NULL CHECK (source IN (
        'membership_inclusion', 
        'score_submission_bonus', 
        'charity_match_booster'
    )),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. WINNERS & VERIFICATIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    draw_id UUID NOT NULL REFERENCES public.draws(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prize_title TEXT NOT NULL,
    prize_value_usd NUMERIC(10, 2) NOT NULL CHECK (prize_value_usd >= 0.00),
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

-- ------------------------------------------------------------------------------
-- 9. PERFORMANCE & QUERY INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_selected_charity ON public.profiles(selected_charity_id);
CREATE INDEX IF NOT EXISTS idx_scores_user_date ON public.scores(user_id, score_date DESC);
CREATE INDEX IF NOT EXISTS idx_scores_verified ON public.scores(verified);
CREATE INDEX IF NOT EXISTS idx_draws_status_date ON public.draws(status, draw_date);
CREATE INDEX IF NOT EXISTS idx_draw_entries_draw_user ON public.draw_entries(draw_id, user_id);
CREATE INDEX IF NOT EXISTS idx_draw_entries_user ON public.draw_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_draw_id ON public.winners(draw_id);
CREATE INDEX IF NOT EXISTS idx_winners_user_id ON public.winners(user_id);
CREATE INDEX IF NOT EXISTS idx_winners_verification ON public.winners(verification_status, payout_status);
CREATE INDEX IF NOT EXISTS idx_charities_active_slug ON public.charities(active, slug);

-- ------------------------------------------------------------------------------
-- 10. RECURSION-SAFE ADMIN CHECK FUNCTION
-- ------------------------------------------------------------------------------
-- ARCHITECTURAL SAFEGUARDS AGAINST RLS RECURSION:
-- 1. Declared as LANGUAGE plpgsql: PostgreSQL NEVER inlines PL/pgSQL functions
--    into the outer query plan (unlike LANGUAGE sql).
-- 2. Uses SECURITY DEFINER with fixed search_path = public, pg_temp to run with
--    the privileges of owner (postgres) which possesses BYPASSRLS.
-- 3. Checks auth.uid() IS NULL first to fast-exit for anonymous visitors in 0 queries.
-- 4. Checks auth.jwt() claims for role = 'admin' (0 DB queries if claim is set).
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public, pg_temp
AS $$
DECLARE
    v_uid uuid := auth.uid();
    v_role text;
BEGIN
    -- 1. Anonymous or unauthenticated sessions are never admins
    IF v_uid IS NULL THEN
        RETURN false;
    END IF;

    -- 2. Fast-path: Check JWT app_metadata claim if set by backend/service_role
    IF (COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '')) = 'admin' THEN
        RETURN true;
    END IF;

    -- 3. Fallback: Query public.profiles directly.
    -- Executed via PL/pgSQL SECURITY DEFINER with search_path fixed:
    -- Query planner does NOT inline this, bypassing RLS and avoiding infinite recursion (42P17).
    SELECT role::text INTO v_role
    FROM public.profiles
    WHERE id = v_uid;

    RETURN COALESCE(v_role = 'admin', false);
END;
$$;

-- Restrict function execution permissions
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- ------------------------------------------------------------------------------
-- 11. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_charities_updated_at ON public.charities;
CREATE TRIGGER tr_charities_updated_at
    BEFORE UPDATE ON public.charities
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ------------------------------------------------------------------------------
-- 12. ROLE, BILLING & MEMBERSHIP SAFEGUARD TRIGGER (public.profiles)
-- ------------------------------------------------------------------------------
-- Dual-barrier protection on INSERT and UPDATE:
-- Strictly prevents unauthorized users from:
--   - Inserting or escalating accounts with role = 'admin'
--   - Activating membership without billing webhook confirmation
--   - Modifying membership tier without billing webhook confirmation
--   - Falsifying lifetime donation totals
--   - Changing profile ID or primary email
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        IF TG_OP = 'INSERT' THEN
            -- Strictly sanitize non-admin insertions
            NEW.role := 'member';
            NEW.membership_active := FALSE;
            NEW.membership_tier := 'monthly';
            NEW.total_donated_usd := 0.00;
            IF auth.uid() IS NOT NULL THEN
                NEW.id := auth.uid();
            END IF;
        ELSIF TG_OP = 'UPDATE' THEN
            -- Prevent changing profile primary key
            IF NEW.id IS DISTINCT FROM OLD.id THEN
                RAISE EXCEPTION 'Unauthorized: profile ID cannot be altered';
            END IF;

            -- Prevent direct email alteration in table (must use Supabase Auth flows)
            IF NEW.email IS DISTINCT FROM OLD.email THEN
                RAISE EXCEPTION 'Unauthorized: email changes must be initiated through authentication services';
            END IF;

            -- Prevent self-promotion to admin
            IF NEW.role IS DISTINCT FROM OLD.role THEN
                RAISE EXCEPTION 'Unauthorized: account role changes can only be performed by administrators';
            END IF;

            -- Prevent manual membership activation (billing-controlled)
            IF NEW.membership_active IS DISTINCT FROM OLD.membership_active THEN
                RAISE EXCEPTION 'Unauthorized: membership status can only be modified via verified billing webhooks or administrators';
            END IF;

            -- Prevent manual membership tier alteration (billing-controlled)
            IF NEW.membership_tier IS DISTINCT FROM OLD.membership_tier THEN
                RAISE EXCEPTION 'Unauthorized: membership tier can only be modified via verified billing webhooks or administrators';
            END IF;

            -- Prevent falsifying donation figures
            IF NEW.total_donated_usd IS DISTINCT FROM OLD.total_donated_usd THEN
                RAISE EXCEPTION 'Unauthorized: donation figures can only be updated via verified donation webhooks';
            END IF;
        END IF;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_profile_role ON public.profiles;
CREATE TRIGGER tr_protect_profile_role
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- ------------------------------------------------------------------------------
-- 13. WINNER RECORD INTEGRITY SAFEGUARD TRIGGER (public.winners)
-- ------------------------------------------------------------------------------
-- Dual-barrier protection on INSERT and UPDATE:
-- Allows winners to submit scorecard/proof documentation while strictly blocking:
--   - Inserting winning records (only admins/draw engine can create winners)
--   - Self-verifying winning claims
--   - Marking payouts as paid
--   - Fabricating payout references or payout dates
--   - Tampering with prize values or prize titles
--   - Reassigning winning claims to different users or draws
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_winner_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        IF TG_OP = 'INSERT' THEN
            RAISE EXCEPTION 'Unauthorized: winning records can only be created by administrators or the draw engine';
        ELSIF TG_OP = 'UPDATE' THEN
            -- Prevent reassigning winner or draw
            IF NEW.user_id IS DISTINCT FROM OLD.user_id OR NEW.draw_id IS DISTINCT FROM OLD.draw_id THEN
                RAISE EXCEPTION 'Unauthorized: winner or draw assignment cannot be altered';
            END IF;

            -- Prevent tampering with prize value or title
            IF NEW.prize_title IS DISTINCT FROM OLD.prize_title OR NEW.prize_value_usd IS DISTINCT FROM OLD.prize_value_usd THEN
                RAISE EXCEPTION 'Unauthorized: prize details cannot be modified by user';
            END IF;

            -- Prevent self-verifying winning records or altering audit notes
            IF NEW.verification_status IS DISTINCT FROM OLD.verification_status THEN
                RAISE EXCEPTION 'Unauthorized: regular users cannot alter verification status';
            END IF;
            IF NEW.verification_notes IS DISTINCT FROM OLD.verification_notes THEN
                RAISE EXCEPTION 'Unauthorized: regular users cannot alter verification notes';
            END IF;

            -- Prevent self-authorizing payouts or falsifying payout references
            IF NEW.payout_status IS DISTINCT FROM OLD.payout_status 
               OR NEW.payout_reference IS DISTINCT FROM OLD.payout_reference 
               OR NEW.payout_date IS DISTINCT FROM OLD.payout_date THEN
                RAISE EXCEPTION 'Unauthorized: payout fields can only be modified by administrators';
            END IF;

            -- Stamp submission timestamp if proof is being uploaded for the first time
            IF NEW.proof_url IS DISTINCT FROM OLD.proof_url AND NEW.proof_url IS NOT NULL THEN
                NEW.proof_submitted_at := COALESCE(NEW.proof_submitted_at, NOW());
            END IF;
        END IF;
    END IF;

    NEW.updated_at := NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_winner_record ON public.winners;
CREATE TRIGGER tr_protect_winner_record
    BEFORE INSERT OR UPDATE ON public.winners
    FOR EACH ROW EXECUTE FUNCTION public.protect_winner_record();

-- ------------------------------------------------------------------------------
-- 14. SCORE RECORD INTEGRITY SAFEGUARD TRIGGER (public.scores)
-- ------------------------------------------------------------------------------
-- Strictly prevents ordinary users from:
--   - Marking their own scores as verified
--   - Submitting scores on behalf of other users
--   - Altering score ownership
-- Automatically forces newly submitted scores to verified = FALSE for non-admins.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_score_record()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Non-admins cannot self-verify scores or alter verification status
    IF NOT public.is_admin() THEN
        IF TG_OP = 'INSERT' THEN
            -- Strictly force verified to FALSE on submission for ordinary users
            NEW.verified := FALSE;
            -- Ensure ordinary user cannot submit scores for a different user
            IF auth.uid() IS NOT NULL THEN
                NEW.user_id := auth.uid();
            END IF;
        ELSIF TG_OP = 'UPDATE' THEN
            -- Prevent changing ownership of the score
            IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
                RAISE EXCEPTION 'Unauthorized: cannot reassign score ownership';
            END IF;

            -- Prevent ordinary user from self-verifying or changing verification status
            IF NEW.verified IS DISTINCT FROM OLD.verified THEN
                RAISE EXCEPTION 'Unauthorized: only administrators or verified marker services can verify scores';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_score_record ON public.scores;
CREATE TRIGGER tr_protect_score_record
    BEFORE INSERT OR UPDATE ON public.scores
    FOR EACH ROW EXECUTE FUNCTION public.protect_score_record();

-- ------------------------------------------------------------------------------
-- 15. AUTOMATIC USER REGISTRATION TRIGGER (AFTER INSERT ON auth.users)
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
    v_email TEXT;
BEGIN
    v_email := COALESCE(new.email, new.id::text || '@golfer.internal');

    -- 1. Safely resolve charity foreign key
    v_raw_charity := new.raw_user_meta_data->>'selected_charity_id';
    IF v_raw_charity IS NOT NULL AND v_raw_charity ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
        SELECT id INTO v_charity_id
        FROM public.charities
        WHERE id = v_raw_charity::UUID AND active = TRUE;
    END IF;

    -- Match by slug if passed as slug identifier
    IF v_charity_id IS NULL AND v_raw_charity IS NOT NULL THEN
        SELECT id INTO v_charity_id
        FROM public.charities
        WHERE (slug = v_raw_charity OR slug = REPLACE(v_raw_charity, 'charity-', '')) AND active = TRUE
        LIMIT 1;
    END IF;

    -- Assign first active charity if still unresolved
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
        NULLIF(TRIM(split_part(v_email, '@', 1)), ''),
        'Hero Golfer'
    );

    -- 4. Sanitize home club
    v_home_club := COALESCE(
        NULLIF(TRIM(new.raw_user_meta_data->>'home_club'), ''),
        'Pinehurst No. 2 Links'
    );

    -- 5. Safe profile creation with strict security defaults:
    --    - role is strictly set to 'member' (never trust user metadata)
    --    - membership_active is FALSE until verified billing webhook
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
        v_email,
        v_full_name,
        v_handicap,
        v_home_club,
        'member',
        'monthly',
        FALSE,
        v_charity_id,
        0.00
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = CASE 
            WHEN public.profiles.full_name = 'Hero Golfer' AND EXCLUDED.full_name <> 'Hero Golfer' 
            THEN EXCLUDED.full_name 
            ELSE public.profiles.full_name 
        END,
        updated_at = NOW();

    RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 16. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.winners ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. PROFILES POLICIES
-- Public/anon users have NO access to profiles.
-- Authenticated members can only read/update their own profile row.
-- Admins can read/update all profiles via non-inlined PL/pgSQL public.is_admin().
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = id AND 
        role = 'member' AND 
        membership_active = FALSE AND 
        total_donated_usd = 0.00
    );

DROP POLICY IF EXISTS "Users can read own profile and admins can read all" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
    ON public.profiles FOR DELETE
    TO authenticated
    USING (public.is_admin());

-- ------------------------------------------------------------------------------
-- B. CHARITIES POLICIES
-- Public/anon users can only read active charities. Inactive charities are admin-only.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public read active charities" ON public.charities;
DROP POLICY IF EXISTS "Anyone can view active charities" ON public.charities;
CREATE POLICY "Anyone can view active charities"
    ON public.charities FOR SELECT
    USING (active = TRUE);

DROP POLICY IF EXISTS "Admins can view all charities" ON public.charities;
CREATE POLICY "Admins can view all charities"
    ON public.charities FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins full access to charities" ON public.charities;
DROP POLICY IF EXISTS "Admins can manage charities" ON public.charities;
CREATE POLICY "Admins can manage charities"
    ON public.charities FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- C. DRAWS POLICIES
-- Public landing page can view all draw campaign records. Write access is admin-only.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "All authenticated users can view draws" ON public.draws;
DROP POLICY IF EXISTS "Anyone can view draws" ON public.draws;
CREATE POLICY "Anyone can view draws"
    ON public.draws FOR SELECT
    USING (TRUE);

DROP POLICY IF EXISTS "Admins manage draws" ON public.draws;
DROP POLICY IF EXISTS "Admins can manage draws" ON public.draws;
CREATE POLICY "Admins can manage draws"
    ON public.draws FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- D. SCORES POLICIES
-- Unauthenticated users have NO access to scores.
-- Authenticated users can view their own scores (both pending and verified).
-- Authenticated users can view verified community scores.
-- Ordinary users can insert scores but verified is forced to FALSE.
-- Only admins can update the verified flag.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own scores" ON public.scores;
CREATE POLICY "Users can read own scores"
    ON public.scores FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view verified scores" ON public.scores;
DROP POLICY IF EXISTS "Authenticated users can view verified scores" ON public.scores;
CREATE POLICY "Authenticated users can view verified scores"
    ON public.scores FOR SELECT
    TO authenticated
    USING (verified = TRUE);

DROP POLICY IF EXISTS "Admins can view all scores" ON public.scores;
CREATE POLICY "Admins can view all scores"
    ON public.scores FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Users can insert own scores" ON public.scores;
CREATE POLICY "Users can insert own scores"
    ON public.scores FOR INSERT
    TO authenticated
    WITH CHECK (
        ((auth.uid() = user_id AND verified = FALSE) OR public.is_admin()) AND 
        stableford_points >= 1 AND 
        stableford_points <= 45
    );

DROP POLICY IF EXISTS "Users and admins can update scores" ON public.scores;
DROP POLICY IF EXISTS "Users can update own scores" ON public.scores;
CREATE POLICY "Users can update own scores"
    ON public.scores FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (
        auth.uid() = user_id AND 
        stableford_points >= 1 AND 
        stableford_points <= 45
    );

DROP POLICY IF EXISTS "Admins can update all scores" ON public.scores;
CREATE POLICY "Admins can update all scores"
    ON public.scores FOR UPDATE
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (
        public.is_admin() AND 
        stableford_points >= 1 AND 
        stableford_points <= 45
    );

DROP POLICY IF EXISTS "Users can delete own scores" ON public.scores;
DROP POLICY IF EXISTS "Users and admins can delete scores" ON public.scores;
CREATE POLICY "Users and admins can delete scores"
    ON public.scores FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- E. DRAW ENTRIES POLICIES
-- Unauthenticated users have NO access. Members can only view/insert their own tickets.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own draw entries" ON public.draw_entries;
CREATE POLICY "Users can view own draw entries"
    ON public.draw_entries FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all draw entries" ON public.draw_entries;
CREATE POLICY "Admins can view all draw entries"
    ON public.draw_entries FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Users can insert own draw entries" ON public.draw_entries;
CREATE POLICY "Users can insert own draw entries"
    ON public.draw_entries FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage draw entries" ON public.draw_entries;
CREATE POLICY "Admins can manage draw entries"
    ON public.draw_entries FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- F. WINNERS POLICIES
-- Public/anon users can ONLY view officially verified winners.
-- Pending/unverified winners are only visible to the winner themselves and admins.
-- Winners can submit proof for their record; protect_winner_record prevents self-approval.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view verified winners" ON public.winners;
CREATE POLICY "Anyone can view verified winners"
    ON public.winners FOR SELECT
    USING (verification_status = 'verified');

DROP POLICY IF EXISTS "Winners can view own winning records" ON public.winners;
CREATE POLICY "Winners can view own winning records"
    ON public.winners FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all winner records" ON public.winners;
CREATE POLICY "Admins can view all winner records"
    ON public.winners FOR SELECT
    TO authenticated
    USING (public.is_admin());

DROP POLICY IF EXISTS "Winners can submit proof for their winning record" ON public.winners;
CREATE POLICY "Winners can submit proof for their winning record"
    ON public.winners FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins full access to winners" ON public.winners;
CREATE POLICY "Admins full access to winners"
    ON public.winners FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- ------------------------------------------------------------------------------
-- 17. DEMONSTRATION BENCHMARK SEED DATA ONLY
-- NOTICE: These records represent showcase demonstration foundations and drawings.
-- No real 501(c)(3) verification, real donations, real individuals, or payouts
-- are claimed or created here. Real users must register via Supabase Auth.
-- ------------------------------------------------------------------------------
INSERT INTO public.charities (id, name, slug, tagline, description, category, total_raised_usd, impact_metric, active)
VALUES
    (
        'c1111111-1111-1111-1111-111111111111', 
        'First Tee Tomorrow', 
        'first-tee-tomorrow', 
        '[Demo Cause] Empowering youth through golf mentorship and life skills education.', 
        'Showcase non-profit profile used for UI/UX testing and platform evaluation.', 
        'Youth Golf', 
        84520.00, 
        'Benchmark demonstration metric: 3,200 junior clinics funded', 
        true
    ),
    (
        'c2222222-2222-2222-2222-222222222222', 
        'Fairways for Fair Oceans', 
        'fairways-clean-oceans', 
        '[Demo Cause] Protecting coastal links wetlands and marine ecosystems.', 
        'Showcase non-profit profile used for UI/UX testing and platform evaluation.', 
        'Environmental Conservation', 
        62300.00, 
        'Benchmark demonstration metric: 14 tons marine debris intercepted', 
        true
    ),
    (
        'c3333333-3333-3333-3333-333333333333', 
        'Adaptive Fairways Alliance', 
        'adaptive-fairways-alliance', 
        '[Demo Cause] Bespoke adaptive swing technologies and carts for para-golfers.', 
        'Showcase non-profit profile used for UI/UX testing and platform evaluation.', 
        'Disabled Golfers', 
        98150.00, 
        'Benchmark demonstration metric: 185 solo-rider carts distributed', 
        true
    ),
    (
        'c4444444-4444-4444-4444-444444444444', 
        'Honor Caddie Foundation', 
        'honor-caddie-foundation', 
        '[Demo Cause] Veteran outdoor camaraderie and PGA apprentice pathways.', 
        'Showcase non-profit profile used for UI/UX testing and platform evaluation.', 
        'Veteran Wellbeing', 
        54800.00, 
        'Benchmark demonstration metric: 94% reported resilience improvement', 
        true
    )
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    tagline = EXCLUDED.tagline,
    description = EXCLUDED.description,
    category = EXCLUDED.category,
    total_raised_usd = EXCLUDED.total_raised_usd,
    impact_metric = EXCLUDED.impact_metric,
    active = EXCLUDED.active;

INSERT INTO public.draws (id, title, season_month, draw_date, status, prize_tier_label, prize_value_usd, charity_split_percentage, total_entries)
VALUES
    (
        'd1111111-1111-1111-1111-111111111111', 
        '[Demo Draw] The Autumn Invitational Major Draw', 
        'November 2026', 
        NOW() + INTERVAL '14 days', 
        'scheduled', 
        'Titleist Custom Fitted Works + $5,000 Travel Stipend', 
        8500.00, 
        50, 
        1420
    ),
    (
        'd2222222-2222-2222-2222-222222222222', 
        '[Demo Draw] October Links Championship Draw', 
        'October 2026', 
        NOW() - INTERVAL '16 days', 
        'completed', 
        'Scotty Cameron Tour Prototype & Bandon Dunes Trip', 
        6200.00, 
        50, 
        1280
    )
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    season_month = EXCLUDED.season_month,
    draw_date = EXCLUDED.draw_date,
    status = EXCLUDED.status,
    prize_tier_label = EXCLUDED.prize_tier_label,
    prize_value_usd = EXCLUDED.prize_value_usd,
    charity_split_percentage = EXCLUDED.charity_split_percentage,
    total_entries = EXCLUDED.total_entries;

-- ------------------------------------------------------------------------------
-- 18. DATABASE-ADMIN-ONLY PROMOTION PROCEDURE
-- STRICT SECURITY CONTROLS:
-- 1. Explicitly checks that session_user is a trusted DB role (postgres/supabase_admin)
--    or backend service_role.
-- 2. ALL permissions are REVOKED from PUBLIC, anon, and authenticated roles.
-- 3. Only executable directly inside the Supabase SQL Editor by a database administrator
--    or via backend service_role. It CANNOT be invoked from the browser client API.
--
-- Usage (Run directly in Supabase Dashboard SQL Editor):
--   SELECT public.promote_user_to_admin('admin-email@example.com');
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.promote_user_to_admin(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Assert that caller is trusted database administrator or backend service
    -- Note: We check session_user because in a SECURITY DEFINER function, current_user
    -- switches to the creator, but session_user preserves the actual caller session.
    IF session_user NOT IN ('postgres', 'supabase_admin') AND COALESCE(auth.role(), '') <> 'service_role' THEN
        RAISE EXCEPTION 'Access denied: promote_user_to_admin can only be executed by database administrators or service role';
    END IF;

    UPDATE public.profiles
    SET role = 'admin'
    WHERE LOWER(email) = LOWER(TRIM(user_email));
    
    IF NOT FOUND THEN
        RAISE NOTICE 'No profile found for email: %', user_email;
    ELSE
        RAISE NOTICE 'User % successfully promoted to admin.', user_email;
    END IF;
END;
$$;

-- Explicitly revoke from public client roles to prevent PostgREST API access
REVOKE ALL ON FUNCTION public.promote_user_to_admin(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.promote_user_to_admin(TEXT) FROM anon;
REVOKE ALL ON FUNCTION public.promote_user_to_admin(TEXT) FROM authenticated;

-- Grant execution strictly to the database superuser and backend service role
GRANT EXECUTE ON FUNCTION public.promote_user_to_admin(TEXT) TO postgres, service_role;

-- ------------------------------------------------------------------------------
-- 19. TRUSTED SCORE VERIFICATION PROCEDURE
-- Strictly restricted procedure for backend marker webhooks and database administrators.
-- All execution permissions are revoked from client-side public and authenticated users.
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.verify_score(score_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Assert that caller is trusted database administrator or backend service
    -- Note: We check session_user because in a SECURITY DEFINER function, current_user
    -- switches to the creator, but session_user preserves the actual caller session.
    IF session_user NOT IN ('postgres', 'supabase_admin') AND COALESCE(auth.role(), '') <> 'service_role' THEN
        RAISE EXCEPTION 'Access denied: only database administrators or trusted backend service can verify scores';
    END IF;

    UPDATE public.scores
    SET verified = TRUE
    WHERE id = score_id;
    
    IF NOT FOUND THEN
        RAISE NOTICE 'No score found for ID: %', score_id;
    ELSE
        RAISE NOTICE 'Score % successfully verified.', score_id;
    END IF;
END;
$$;

-- Explicitly revoke from public client roles to prevent PostgREST API access
REVOKE ALL ON FUNCTION public.verify_score(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.verify_score(UUID) FROM anon;
REVOKE ALL ON FUNCTION public.verify_score(UUID) FROM authenticated;

-- Grant execution strictly to the database superuser and backend service role
GRANT EXECUTE ON FUNCTION public.verify_score(UUID) TO postgres, service_role;

-- ------------------------------------------------------------------------------
-- 20. STORAGE CONFIGURATION: WINNER PROOF SCORECARDS BUCKET & RLS
-- Creates the private 'winner-proofs' storage bucket with strict RLS:
-- - 5 MB file size limit
-- - JPEG, PNG, WEBP, and PDF only
-- - Authenticated members can only upload to their own user-id folder
-- - Members can only read their own proofs; platform admins can read all proofs
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'winner-proofs',
    'winner-proofs',
    false, -- Private bucket
    5242880, -- 5 MB limit
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Users can upload their own winner proofs" ON storage.objects;
CREATE POLICY "Users can upload their own winner proofs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'winner-proofs' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

DROP POLICY IF EXISTS "Users can read own winner proofs or admin all" ON storage.objects;
CREATE POLICY "Users can read own winner proofs or admin all"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'winner-proofs' AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_admin()
    )
);

DROP POLICY IF EXISTS "Users can update own winner proofs or admin all" ON storage.objects;
CREATE POLICY "Users can update own winner proofs or admin all"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'winner-proofs' AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_admin()
    )
);

DROP POLICY IF EXISTS "Users can delete own winner proofs or admin all" ON storage.objects;
CREATE POLICY "Users can delete own winner proofs or admin all"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'winner-proofs' AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR public.is_admin()
    )
);
