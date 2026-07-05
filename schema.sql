-- =====================================================================
-- MyTransfer Database Schema (Supabase / PostgreSQL)
-- Highly optimized, secure, and fully documented layout.
-- Optimized for client-side direct Supabase REST operations.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Users Table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'super_admin')) DEFAULT 'user',
    avatar_url TEXT,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'business', 'enterprise')) DEFAULT 'free',
    mfa_enabled BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL CHECK (status IN ('active', 'suspended')) DEFAULT 'active',
    joined_workspace TEXT,
    password TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable Row Level Security (RLS) to allow direct client anon queries
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 2. Transfers Table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transfers (
    id TEXT PRIMARY KEY,
    title TEXT DEFAULT 'Untitled Transfer',
    sender_email TEXT NOT NULL,
    storage_used BIGINT NOT NULL DEFAULT 0,
    downloads INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    recipient_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.transfers DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 3. Files Table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.files (
    id TEXT PRIMARY KEY,
    transfer_id TEXT NOT NULL REFERENCES public.transfers(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size BIGINT NOT NULL,
    mime_type TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.files DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 4. Download Logs Table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.download_logs (
    id TEXT PRIMARY KEY DEFAULT 'dl_' || gen_random_uuid()::text,
    transfer_id TEXT NOT NULL REFERENCES public.transfers(id) ON DELETE CASCADE,
    ip_address TEXT,
    country_code TEXT DEFAULT 'US',
    download_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.download_logs DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 5. Team Members Table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_members (
    id TEXT PRIMARY KEY DEFAULT 'm_' || gen_random_uuid()::text,
    workspace_owner_email TEXT NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'member', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.team_members DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 6. Global Invitations Table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.global_invitations (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    inviter_email TEXT NOT NULL,
    inviter_name TEXT NOT NULL,
    role TEXT NOT NULL,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.global_invitations DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- 7. System Audit Logs Table
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY DEFAULT 'al_' || gen_random_uuid()::text,
    action TEXT NOT NULL,
    detail TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'success', 'warning', 'critical')),
    time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- Performance & Optimization Indexes
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_transfers_sender ON public.transfers(sender_email);
CREATE INDEX IF NOT EXISTS idx_files_transfer ON public.files(transfer_id);
CREATE INDEX IF NOT EXISTS idx_download_logs_transfer ON public.download_logs(transfer_id);
CREATE INDEX IF NOT EXISTS idx_team_members_workspace ON public.team_members(workspace_owner_email);
