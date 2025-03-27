"use client";

import { useEffect, useState } from "react";
import { ClipboardList, BookOpen, LayoutGrid, Mic } from "lucide-react";
import FeatureCard from "../components/FeatureCard";
import Hero from "../components/Hero";
import AnimatedTransition from "../components/AnimatedTransition";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const features = [
  {
    icon: ClipboardList,
    title: "End-of-Day Reports",
    description:
      "Structured daily check-ins to keep everyone aligned on priorities, progress, and needs.",
    href: "/reports",
  },
  {
    icon: BookOpen,
    title: "Reference Library",
    description:
      "A shared knowledge base for quick access to critical information and processes.",
    href: "/library",
  },
  {
    icon: LayoutGrid,
    title: "Project Tracker",
    description:
      "Visual task management with customizable Kanban-style workflows.",
    href: "/tasks",
  },
  {
    icon: Mic,
    title: "Voice Task Upload",
    description:
      "Record, transcribe, and transform voice notes into actionable tasks.",
    href: "/voice",
  },
];

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Track loading state

  // Check initial session and listen for auth changes
  useEffect(() => {
    const handleAuth = async () => {
      // Check current session on mount
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log("Initial session:", session);

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        router.push("/login");
        return;
      }

      if (session?.user) {
        await handleUser(session.user);
      } else {
        console.log("No session found, waiting for auth event...");
      }

      // Set up auth state change listener
      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth event:", event, "Session:", session);

          if (event === "SIGNED_IN" && session?.user) {
            await handleUser(session.user);
          } else if (event === "SIGNED_OUT") {
            router.push("/login");
          }
        }
      );

      setLoading(false);

      // Cleanup listener on unmount
      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    // Handle user logic (check or insert user, then redirect)
    const handleUser = async (user) => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id);

      console.log("User query result:", data);

      if (error) {
        console.error("Error fetching user:", error);
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      if (data.length > 0) {
        const userData = data[0];
        if (userData.role === "executive") {
          if (userData.assistant_id === null) {
            router.push("/settings");
          } else {
            router.push("/voice");
          }
        } else {
          router.push("/projects");
        }
      } else {
        // Insert new user
        const { error: insertError } = await supabase.from("users").insert({
          id: user.id,
          email: user.email,
          full_name:
            user.user_metadata?.full_name || user.email.split("@")[0],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          role: "executive",
        });

        if (insertError) {
          console.error("Error inserting user:", insertError);
          await supabase.auth.signOut();
          router.push("/login");
        } else {
          console.log("User inserted:", user.id);
          router.push("/settings");
        }
      }
    };

    handleAuth();
  }, []); // Depend on router to retrigger on navigation

  if (loading) {
    return <div>Loading...</div>; // Show loading state while checking auth
  }

  return (
    <div>
      <AnimatedTransition>
        <Hero />
        <section className="py-16 bg-secondary/50">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center mb-12">
              <h2 className="mb-4">Streamlined Features</h2>
              <p className="text-muted-foreground">
                Everything you need to collaborate efficiently, with no
                unnecessary complexity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  delay={index * 0.1}
                  href={feature.href}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-2xl border/90">
              <div className="p-8">
                <h2 className="mb-4 text-center">Why This App?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                  {[
                    {
                      title: "No Bloat",
                      desc: "Just essential features, without unnecessary complexity.",
                    },
                    {
                      title: "Real-time Collaboration",
                      desc: "Built for seamless EA-boss workflows and communication.",
                    },
                    {
                      title: "Centralized Information",
                      desc: "All tasks, reports, and information in one accessible place.",
                    },
                    {
                      title: "Beautiful Design",
                      desc: "Elegant, minimalist interface inspired by Apple's design principles.",
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium mb-1">
                          {item.title}
                        </h3>
                        <p className="text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </AnimatedTransition>
    </div>
  );
}