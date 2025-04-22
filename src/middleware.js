import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function middleware(request) {
  const cookieStore = await cookies();

  // Initialize Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore setAll errors in Server Components
          }
        },
      },
    }
  );

  // Get the session
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  console.log('Session:', session ? 'Found' : 'Missing');
  if (sessionError) {
    console.error('Session error:', sessionError.message);
  }

  if (request.nextUrl.pathname === "/auth/callback") {
    const { error } = await supabase.auth.getSession();
    if (error) {
      console.error("Error refreshing session:", error.message);
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Redirect to the main app
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Handle /login route for authenticated users
  if (request.nextUrl.pathname === '/login') {
    if (session && !sessionError) {
      // Get user information
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.log('No user found, allowing access to /login');
        return NextResponse.next();
      }

      // Check user status and role
      const { data: userData, error: userDataError } = await supabase
        .from('users')
        .select('status, role, assistant_id')
        .eq('id', user.id)
        .single();

      if (userDataError || !userData) {
        console.error('Error fetching user data:', userDataError?.message);
        // Create new user if not found
        const { error: insertError } = await supabase.from('users').insert({
          id: user.id,
          email: user.email,
          full_name: user.email?.split('@')[0],
          role: 'executive',
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error('Error inserting user:', insertError.message);
          return NextResponse.redirect(new URL('/login?error=user_not_found', request.url));
        }

        console.log('New user created, redirecting to /settings');
        return NextResponse.redirect(new URL('/settings', request.url));
      }

      console.log('User data:', { status: userData.status, role: userData.role });

      // Handle pending/rejected users
      if (userData.status === 'pending' || userData.status === 'rejected') {
        console.log('User status is pending/rejected, signing out');
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL('/login?error=account_pending', request.url));
      }

      // Redirect authenticated users based on role
      // if (userData.role === 'executive') {
      //   if (userData.assistant_id === null) {
      //     console.log('Executive with no assistant_id, redirecting to /settings');
      //     return NextResponse.redirect(new URL('/settings', request.url));
      //   }
      //   console.log('Executive, redirecting to /voice');
      //   return NextResponse.redirect(new URL('/voice', request.url));
      // } else if (userData.role === 'assistant') {
      //   console.log('Assistant, redirecting to /projects');
      //   return NextResponse.redirect(new URL('/projects', request.url));
      // } else if (userData.role === 'admin') {
      //   console.log('Admin, redirecting to /admin');
      //   return NextResponse.redirect(new URL('/admin', request.url));
      // }
    }
    // Allow unauthenticated users to access /login
    console.log('No session, allowing access to /login');
    return NextResponse.next();
  }

  // Define protected routes
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/voice',
    '/projects',
    '/settings',
    '/admin',
    '/reports',
    '/attachments',
  ];

  // Check if the requested path is a protected route
  if (protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    if (!session || sessionError) {
      console.log('No session found, redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Get user information
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log('No user found, redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check user status and role
    const { data: userData, error: userDataError } = await supabase
      .from('users')
      .select('status, role, assistant_id')
      .eq('id', user.id)
      .single();

    if (userDataError || !userData) {
      console.error('Error fetching user data:', userDataError?.message);
      // Create new user if not found
      const { error: insertError } = await supabase.from('users').insert({
        id: user.id,
        email: user.email,
        full_name: user.email?.split('@')[0],
        role: 'executive',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (insertError) {
        console.error('Error inserting user:', insertError.message);
        return NextResponse.redirect(new URL('/login?error=user_not_found', request.url));
      }

      console.log('New user created, redirecting to /settings');
      return NextResponse.redirect(new URL('/settings', request.url));
    }

    console.log('User data:', { status: userData.status, role: userData.role });

    // Handle pending/rejected users
    if (userData.status === 'pending' || userData.status === 'rejected') {
      console.log('User status is pending/rejected, signing out');
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/login?error=account_pending', request.url));
    }

    // Role-based routing for protected routes
    // if (userData.role === 'executive') {
    //   if (userData.assistant_id === null && !request.nextUrl.pathname.startsWith('/settings')) {
    //     console.log('Executive with no assistant_id, redirecting to /settings');
    //     return NextResponse.redirect(new URL('/settings', request.url));
    //   }
    //   if (!request.nextUrl.pathname.startsWith('/voice') && !request.nextUrl.pathname.startsWith('/settings')) {
    //     console.log('Executive, redirecting to /voice');
    //     return NextResponse.redirect(new URL('/voice', request.url));
    //   }
    // } else if (userData.role === 'assistant' && !request.nextUrl.pathname.startsWith('/projects')) {
    //   console.log('Assistant, redirecting to /projects');
    //   return NextResponse.redirect(new URL('/projects', request.url));
    // } else if (userData.role === 'admin' && !request.nextUrl.pathname.startsWith('/admin')) {
    //   console.log('Admin, redirecting to /admin');
    //   return NextResponse.redirect(new URL('/admin', request.url));
    // }
  }

  // Allow the request to proceed for non-protected routes
  console.log('Allowing request to proceed');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login', // Add /login to middleware matcher
    '/voice',
    '/settings',
    '/projects',
    '/admin',
    '/reports',
    '/attachments',
    '/auth/callback',
    // Exclude public routes
    '/((?!signup|api|_next/static|_next/image|favicon.ico).*)',
  ],
};