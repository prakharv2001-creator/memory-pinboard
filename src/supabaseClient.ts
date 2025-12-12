import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project details from:
// https://supabase.com/dashboard/project/grkzahgyzmqzmewfvetd/settings/api
const supabaseUrl = 'https://grkzahgyzmqzmewfvetd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdya3phaGd5em1xem1ld2Z2ZXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY5NzU3NTUsImV4cCI6MjA1MjU1MTc1NX0.vFBz6PQXvvxFxQxXxXxXxXxXxXxXxXxXxXxXxXx';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
