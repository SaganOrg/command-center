import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function AuthCallback() {
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

  // Refresh the session
  const { error } = await supabase.auth.getSession();

  if (error) {
    console.error("Error refreshing session:", error.message);
    // Redirect to login with error query parameter
    return redirect("/login?error=auth_failed");
  }

  // Redirect to the main app
  return redirect("/");
}