'use server';

const { createServerClient } = require('@supabase/ssr');
const { cookies } = require('next/headers');

// Initialize Supabase client
const createSupabaseClient = async () => {
  const cookieStore = await cookies();
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

// Login with email and password
async function loginWithEmail(email, password) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error( 'Login failed. Please try again.');
  }

  return { session: data.session, user: data.user };
}

// Signup with email, password, and name
async function signupWithEmail(email, password, name) {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    throw new Error( 'Signup failed. Please try again.');
  }

  if (data.user) {
    const userId = data.user.id;
    const { error: updateError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email: data.user.email,
        role: 'executive',
        full_name: name,
        status: 'approved', // Changed from 'pending' to 'approved'
      })
      .select();

    if (updateError) {
      throw new Error('Please try again later');
    }

    // Commented out sign out - users can now login immediately
    // const { error: signOutError } = await supabase.auth.signOut();
    // if (signOutError) {
    // }

    return {
      message:
        'Your account has been created successfully. You can now log in.',
    };
  }

  throw new Error('Signup failed. No user data returned.');
}

// Initiate Google OAuth login

// Reset password via email
async function resetPassword(email) {
  const supabase = await createSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://commandcenter.getsagan.com/reset-password',
  });

  if (error) {
    throw new Error( 'Failed to send reset email. Please try again.');
  }

  return { message: 'Password reset email sent! Check your inbox.' };
}

export {
  loginWithEmail,
  signupWithEmail,

  resetPassword,
};