import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  const supabase = await createSupabaseServerClient();

  if (code) {
    // Exchange code for session
    const { data: { session }, error: authError } = await supabase.auth.exchangeCodeForSession(code);
    
    if (authError) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    if (session?.user) {
      try {
        // Check if user exists in users table
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single(); // Expect one row or none

        if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
          throw new Error('Error checking user');
        }

        if (data) {
          // User exists, check status and redirect
          // Only block rejected users, allow pending users
          if (data.status === 'rejected') {
            await supabase.auth.signOut();
            return NextResponse.redirect(`${origin}/login?error=account_rejected`);
          }

          // Redirect based on role and assistant_id
          if (data.role === 'executive') {
            const redirectPath = data.assistant_id ? '/voice' : '/settings';
            return getRedirectResponse(request, origin, redirectPath);
          } else {
            return getRedirectResponse(request, origin, '/projects');
          }
        } else {
          // User doesn't exist, insert new user
          const { error: insertError } = await supabase.from('users').insert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: 'executive',
            status: 'approved', // New users are automatically approved
          });

          if (insertError) {
            throw new Error('Error inserting user');
          }

          return getRedirectResponse(request, origin, '/settings');
        }
      } catch (error) {
        // console.error('Error:', error.message);
        await supabase.auth.signOut();
        return NextResponse.redirect(`${origin}/login?error=account_pending`);
      }
    }
  }

  // Default error redirect
  return NextResponse.redirect(`${origin}/login?error=account_pending`);
}

// Helper function to handle redirect logic based on environment and headers
function getRedirectResponse(request, origin, path) {
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}${path}`);
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}${path}`);
  } else {
    return NextResponse.redirect(`${origin}${path}`);
  }
}