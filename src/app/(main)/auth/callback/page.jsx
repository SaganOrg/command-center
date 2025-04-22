// app/auth/callback/page.jsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/supabase-js";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    const handleCallback = async () => {
      // Refresh the session to ensure the token is stored
      const { error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error refreshing session:", error.message);
        router.push("/login?error=auth_failed");
        return;
      }

      // Redirect to the main app or desired page
      router.push("/");
    };

    handleCallback();
  }, [router]);

  return <div>Loading...</div>;
}