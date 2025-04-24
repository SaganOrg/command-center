import React from "react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { VoiceRecorder } from "./VoiceRecorder";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function Voice() {
  // Initialize Supabase server client
  const supabase = await createSupabaseServerClient();

  // Fetch user and role
  let user = null;
  let userRole = null;
  let assistantId = null;

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      redirect("/login");
    }

    user = data.user;

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role, assistant_id")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      throw new Error("Failed to fetch user role");
    }

    userRole = userData.role;
    assistantId = userData.assistant_id;
  } catch (error) {
    console.error("Error fetching user data:", error);
    redirect("/login");
  }

  // Check if OpenAI API key is available
  const hasOpenAI = !!process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  return (
    <div className="container mx-auto px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Voice Input</h1>
      </div>

      {!hasOpenAI && (
        <div className="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
          <div className="flex">
            <svg
              className="h-4 w-4 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Configuration Missing
              </h3>
              <div className="mt-2 text-sm text-red-700">
                The OpenAI API key is not configured. Voice transcription and
                title generation are disabled. Please add the OPENAI_API_KEY
                environment variable to enable these features.
              </div>
            </div>
          </div>
        </div>
      )}

      <VoiceRecorder
        userId={user.id}
        userRole={userRole}
        assistantId={assistantId}
        hasOpenAI={hasOpenAI}
      />

      <div className="text-xs text-center text-gray-500 mt-12 pb-6">
        Built by Sagan
      </div>
    </div>
  );
}