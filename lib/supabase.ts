import { createClient, SupabaseClient } from '@supabase/supabase-js';
// Fix: force Node.js to use reliable DNS resolvers so Supabase hostnames resolve
import './dns-fix';

let _adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY'
    );
  }

  _adminClient = createClient(url, key);
  return _adminClient;
}
