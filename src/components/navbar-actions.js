'use server';

const { createServerClient } = require('@supabase/ssr');
const { cookies } = require('next/headers');

// Initialize Supabase client
const createSupabaseClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
};

// Check session and fetch user data
async function checkSession() {
  const supabase = createSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { session: null, user: null };
  }

  const { data, error } = await supabase
    .from('users')
    .select('id, email, role, status, assistant_id')
    .eq('id', session.user.id)
    .single();

  if (error) {
    throw new Error(error.message || 'Error fetching user data');
  }

  return { session, user: data };
}

// Sign out
async function signOut() {
  const supabase = createSupabaseClient();
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