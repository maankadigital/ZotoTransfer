# MyTransfer SaaS Architecture & Schema

## Database Schema (PostgreSQL)

```sql
-- Users & Auth
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user', -- 'user', 'admin', 'super_admin'
  mfa_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams & Workspaces
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES users(id),
  plan_id TEXT, -- 'free', 'pro', 'business', 'enterprise'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES users(id),
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'manager', 'member', 'viewer'
  PRIMARY KEY (team_id, user_id)
);

-- Files & Transfers
CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id), -- NULL for anonymous
  sender_email TEXT,
  short_link TEXT UNIQUE,
  title TEXT,
  message TEXT,
  is_public BOOLEAN DEFAULT true,
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id UUID REFERENCES transfers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  mime_type TEXT,
  r2_key TEXT NOT NULL, -- Cloudflare R2 object key
  checksum TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics & Tracking
CREATE TABLE downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  ip_address TEXT,
  user_agent TEXT,
  country_code TEXT,
  device_type TEXT,
  download_time TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Billing
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  team_id UUID REFERENCES teams(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE
);
```

## API Architecture (REST)

- **Auth**: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- **Upload**: 
  - `POST /api/v1/transfer/init` (returns signed URL for chunked upload)
  - `POST /api/v1/transfer/complete` (finalizes metadata)
- **Download**: 
  - `GET /api/v1/transfer/:shortLink` (metadata)
  - `GET /api/v1/transfer/:shortLink/download/:fileId` (logs and redirects to R2)
- **Analytics**: `GET /api/v1/analytics/transfer/:id` (detailed logs)
- **Teams**: `GET /api/v1/teams`, `POST /api/v1/teams/invite`

## Folder Structure (Next.js 15)

```text
/src
  /app
    /(marketing)      -- Layout for home, pricing, about
    /(auth)           -- Login, register
    /(dashboard)      -- App shell, files, analytics, billing
    /api              -- Route handlers
  /components
    /ui               -- shadcn/ui components
    /marketing        -- Hero, pricing cards
    /transfer         -- Upload zone, progress bars
    /dashboard        -- Charts, file tables
  /lib
    /r2               -- Cloudflare R2 client
    /db               -- Prisma/Drizzle setup
    /analytics        -- Tracking logic
  /hooks              -- Custom React hooks
```
