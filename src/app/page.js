"use client";

import { useEffect } from "react";
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

  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event, "Session:", session);

        if (session?.user) {
          // User has signed in; update the users table
          const {
            data,
            error,
          } = await supabase
            .from("users")
            .select("*")
              .eq("id", session.user.id);
          
          console.log(data, "laksjdflkjasdf")

          if (error) {
            await supabase.auth.signOut();
            router.push("/login");
          }

          if (data.length>0) {
            if (data[0].role === "executive") {
              if (data[0].assistant_id === null) {
                router.push("/settings");
              } else {
                router.push("/voice");
              }
            } else {
              router.push("/projects");
            }
          } else {
            const { error: insertError } = await supabase.from("users").insert({
              id: session?.user.id, // Use the Supabase auth user ID
              email: session?.user.email,
              full_name: session?.user.user_metadata?.full_name || session?.user.email.split("@")[0],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              role: "executive",
            });
    
            if (insertError) {
              console.error("Error inserting user into users table:", insertError);
            } else {
              router.push("/settings");
              console.log("User added to users table:", user.id);
            }
          }
        }
        
      }
    );

    // // Check if the user is already signed in on page load
    // const checkUser = async () => {
    //   const { data: { user } } = await supabase.auth.getUser();
    //   if (user) {
    //     await updateUserInTable(user);
    //   }
    // };

    // Cleanup the listener on component unmount
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
