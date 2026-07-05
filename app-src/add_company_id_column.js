import pg from 'pg';
const { Client } = pg;

const password = 'Maanka@2026';
const ref = 'pnqnvgfyzltilwuljvpx';
const host = 'aws-0-eu-west-1.pooler.supabase.com';
const escapedPassword = encodeURIComponent(password);
const connectionString = `postgresql://postgres.${ref}:${escapedPassword}@${host}:6543/postgres`;

const client = new Client({ 
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('⚡ Adding company_id column to shared_folders table...');

  await client.query(`
    ALTER TABLE public.shared_folders 
    ADD COLUMN IF NOT EXISTS company_id text;
  `);

  console.log('✅ Column added successfully!');
  await client.end();
}

run().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
