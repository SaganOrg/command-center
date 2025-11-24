'use server';

const { createClient } = require('@supabase/supabase-js');

// Create Supabase admin client with service role key (server-side only)
const createSupabaseAdmin = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};

// Delete user from auth using admin privileges
async function deleteUserFromAuth(userId) {
  const supabaseAdmin = createSupabaseAdmin();

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);

  if (error) {
    throw new Error(error.message || 'Failed to delete user from authentication');
  }

  return { success: true };
}

export { deleteUserFromAuth };
