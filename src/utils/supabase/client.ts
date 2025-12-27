// =====================================================
// CENTRALIZED SUPABASE CLIENT
// =====================================================
// Single source of truth for Supabase client instance
// Import this file instead of creating multiple clients

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create the Supabase client URL
const supabaseUrl = `https://${projectId}.supabase.co`;
const supabaseAnonKey = publicAnonKey;

// Create a single Supabase client instance
// This prevents the "multiple instances" warning
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Export URL and key for use in other utilities if needed
export { supabaseUrl, supabaseAnonKey };
