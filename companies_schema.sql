-- ---------------------------------------------------------------------
-- Companies Schema Migration - MyTransfer
-- ---------------------------------------------------------------------

-- 1. Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    industry TEXT,
    website TEXT,
    country TEXT,
    notes TEXT,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

-- 2. Company Contacts Table
CREATE TABLE IF NOT EXISTS public.company_contacts (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    position TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.company_contacts DISABLE ROW LEVEL SECURITY;

-- 3. Company Notes Table
CREATE TABLE IF NOT EXISTS public.company_notes (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.company_notes DISABLE ROW LEVEL SECURITY;

-- 4. Company Activities Table
CREATE TABLE IF NOT EXISTS public.company_activities (
    id TEXT PRIMARY KEY,
    company_id TEXT REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.company_activities DISABLE ROW LEVEL SECURITY;

-- 5. Foreign Key Column Integrations
ALTER TABLE public.transfers ADD COLUMN IF NOT EXISTS company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL;
ALTER TABLE public.download_logs ADD COLUMN IF NOT EXISTS company_id TEXT REFERENCES public.companies(id) ON DELETE SET NULL;
