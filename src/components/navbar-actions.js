'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
const { cookies } = require('next/headers');

async function checkSession() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { session: null, user: null };
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, status, assistant_id, admin')
    .eq('id', session.user.id)
    .single();

  if (error) {
    throw new Error(error.message || 'Error fetching user data');
  }

  return { session, user: data };
}

// Sign out
async function signOut() {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message || 'Failed to log out');
  }

  // Clear cookies explicitly
  const cookieStore = cookies();
  cookieStore.delete(`sb-${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}-auth-token`);
}

export {
  checkSession,
  signOut,
};