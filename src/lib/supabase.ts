/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Use environment variables if available, otherwise fallback to the provided credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://immwdjlbadltxvfaeqfv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImltbXdkamxiYWRsdHh2ZmFlcWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyNDkzMjIsImV4cCI6MjA4ODgyNTMyMn0.jSOyyZNMMtS97FrqyB85aiB1buf-AmLJil9GrVtu6j8';

if (!supabaseUrl || supabaseUrl === '') {
  throw new Error('Supabase URL is required. Please set VITE_SUPABASE_URL in your environment.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
