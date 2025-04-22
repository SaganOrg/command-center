"use client";

import { useEffect } from "react";
import { ClipboardList, BookOpen, LayoutGrid, Mic } from "lucide-react";
import FeatureCard from "../../components/FeatureCard";
import Hero from "../../components/Hero";
import AnimatedTransition from "../../components/AnimatedTransition";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

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
   const { toast } = useToast();

  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await handleUserCheck(session.user);
        }
      }
    );
  
    // Check user on initial load
    const checkInitialUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await handleUserCheck(user);
      } else {
        // router.push("/login");
      }
    };
  
    // Handle user check and routing logic
    const handleUserCheck = async (user) => {
      try {
        // Check if user exists in users table
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single(); // Use single() to expect one row or none
  
        if (error && error.code !== "PGRST116") { // PGRST116 is "no rows found"
          throw new Error("Error checking user");
        }
  
        if (data) {
          // User exists, check status and redirect
          if (data.status === "pending" || data.status === "rejected") {
            await supabase.auth.signOut();
            toast({
              variant: "destructive",
              title: "Authentication Error",
              description: "Your account is pending approval. You will receive an email once approved.",
            });
            router.push("/login");
            return;
          }
  
          // Redirect based on role and assistant_id
          if (data.role === "executive") {
            router.push(data.assistant_id ? "/voice" : "/settings");
          } else {
            // router.push("/projects");
          }
        } else {
          // User doesn't exist, insert new user
          const { error: insertError } = await supabase.from("users").insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email.split("@")[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            role: "executive",
            status: "pending",
          });
  
          if (insertError) {
            throw new Error("Error inserting user");
          }
  
          router.push("/settings");
        }
      } catch (error) {
        console.error("Error:", error.message);
        await supabase.auth.signOut();
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "An error occurred. Please try again.",
        });
        // router.push("/login");
      }
    };
  
    checkInitialUser();
  
    // Cleanup
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

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
