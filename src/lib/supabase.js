import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  isSingleton:false
}
);

export async function checkSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabaseClient.auth.getSession();
      if (error) {
        console.error('Session check error:', error.message);
        return null;
      }
      return session;
    } catch (err) {
      console.error('Unexpected error checking session:', err);
      return null;
    }
  }