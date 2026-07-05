import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pnqnvgfyzltilwuljvpx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBucW52Z2Z5emx0aWx3dWxqdnB4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1MDQyODUsImV4cCI6MjA5ODA4MDI4NX0.PwnQxrJcTuj7SJpe_y1vmtRgRYODGVmb8fOP_L7-HoE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
