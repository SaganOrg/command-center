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
  // const router = useRouter();
  //  const { toast } = useToast();

  // // Listen for auth state changes
  // useEffect(() => {
  //   const { data: authListener } = supabase.auth.onAuthStateChange(
  //     async (event, session) => {
  //       if (session?.user) {
  //         await handleUserCheck(session.user);
  //       }
  //     }
  //   );
  
  //   // Check user on initial load
  //   const checkInitialUser = async () => {
  //     const { data: { user } } = await supabase.auth.getUser();
  //     if (user) {
  //       await handleUserCheck(user);
  //     } else {
  //       // router.push("/login");
  //     }
  //   };
  
  //   // Handle user check and routing logic
  //   const handleUserCheck = async (user) => {
  //     try {
  //       // Check if user exists in users table
  //       const { data, error } = await supabase
  //         .from("users")
  //         .select("*")
  //         .eq("id", user.id)
  //         .single(); // Use single() to expect one row or none
  
  //       if (error && error.code !== "PGRST116") { // PGRST116 is "no rows found"
  //         throw new Error("Error checking user");
  //       }
  
  //       if (data) {
  //         // User exists, check status and redirect
  //         if (data.status === "pending" || data.status === "rejected") {
  //           await supabase.auth.signOut();
  //           toast({
  //             variant: "destructive",
  //             title: "Authentication Error",
  //             description: "Your account is pending approval. You will receive an email once approved.",
  //           });
  //           router.push("/login");
  //           return;
  //         }
  
  //         // Redirect based on role and assistant_id
  //         if (data.role === "executive") {
  //           router.push(data.assistant_id ? "/voice" : "/settings");
  //         } else {
  //           // router.push("/projects");
  //         }
  //       } else {
  //         // User doesn't exist, insert new user
  //         const { error: insertError } = await supabase.from("users").insert({
  //           id: user.id,
  //           email: user.email,
  //           full_name: user.user_metadata?.full_name || user.email.split("@")[0],
  //           created_at: new Date().toISOString(),
  //           updated_at: new Date().toISOString(),
  //           role: "executive",
  //           status: "pending",
  //         });
  
  //         if (insertError) {
  //           throw new Error("Error inserting user");
  //         }
  
  //         router.push("/settings");
  //       }
  //     } catch (error) {
  //       console.error("Error:", error.message);
  //       await supabase.auth.signOut();
  //       toast({
  //         variant: "destructive",
  //         title: "Authentication Error",
  //         description: "Your account is pending approval. You will receive an email once approved. ",
  //       });
  //       // router.push("/login");
  //     }
  //   };
  
  //   checkInitialUser();
  
  //   // Cleanup
  //   return () => {
  //     authListener.subscription.unsubscribe();
  //   };
  // }, []);

  return (
    <div className="min-h-screen bg-background text-foreground dark:bg-background-dark dark:text-foreground-dark">
    {/* Header */}
    {/* <header className="bg-card shadow-sm fixed w-full z-10 dark:bg-card-dark">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary dark:text-primary-dark">SoloSync</h1>
        <nav className="flex space-x-6 items-center">
          <a href="#features" className="text-foreground hover:text-primary transition dark:text-foreground-dark dark:hover:text-primary-dark">Features</a>
          <a href="#why" className="text-foreground hover:text-primary transition dark:text-foreground-dark dark:hover:text-primary-dark">Why SoloSync</a>
          <a href="#testimonials" className="text-foreground hover:text-primary transition dark:text-foreground-dark dark:hover:text-primary-dark">Testimonials</a>
          <a href="#mobile" className="text-foreground hover:text-primary transition dark:text-foreground-dark dark:hover:text-primary-dark">Mobile App</a>
          <a href="/login" className="text-foreground hover:text-primary transition dark:text-foreground-dark dark:hover:text-primary-dark">Login</a>
          <a href="/signup" className="btn-primary">Get Started</a>
        </nav>
      </div>
    </header> */}

    {/* Hero Section */}
    <section className="bg-card pt-24 pb-20 dark:bg-card-dark">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center animate-slide-up">
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight dark:text-foreground-dark">Master Your Projects Effortlessly</h2>
          <p className="text-xl text-muted-foreground mb-8 dark:text-muted-foreground-dark">Sagan command center provides intuitive tools to streamline project management for solo professionals and small teams.</p>
          <a href="/login" className="btn-primary">Try It Free</a>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <svg className="w-64 h-64 text-primary dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </section>

    {/* Why Use SoloSync Section */}
    <section id="why" className="py-20 bg-accent dark:bg-accent-dark">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-bold text-foreground text-center mb-12 dark:text-foreground-dark animate-fade-in">Why Choose Sagan Command Center</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Solo-Optimized Design', desc: 'Tailored for individual professionals with a focus on simplicity and efficiency.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { title: 'Time-Saving Automation', desc: 'Automate tasks and reporting to maximize your productivity.', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
            { title: 'Intuitive Interface', desc: 'Seamless navigation designed to enhance your workflow.', icon: 'M5 13l4 4L19 7' },
          ].map((item, index) => (
            <div key={index} className="text-center p-6 bg-card rounded-lg card-hover dark:bg-card-dark animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <svg className="w-12 h-12 text-primary mx-auto mb-4 dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              <h4 className="text-xl font-semibold text-primary mb-2 dark:text-primary-dark">{item.title}</h4>
              <p className="text-muted-foreground dark:text-muted-foreground-dark">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Key Features Section */}
    <section id="features" className="py-20 bg-card dark:bg-card-dark">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-bold text-foreground text-center mb-12 dark:text-foreground-dark animate-fade-in">Core Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { title: 'Single Employee Focus', desc: 'Optimized for solo users, ensuring streamlined project management.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z', bg: 'primary' },
            { title: 'Quick Project Setup', desc: 'Create and organize projects effortlessly in minutes.', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01m-.01 4h.01', bg: 'secondary' },
            { title: 'Automated Reporting', desc: 'Daily summaries to keep you informed and on track.', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', bg: 'primary' },
            { title: 'File Attachments', desc: 'Easily upload and manage project documents.', icon: 'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122', bg: 'secondary' },
          ].map((feature, index) => (
            <div key={index} className="text-center p-6 bg-accent rounded-lg card-hover dark:bg-accent-dark animate-scale-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className={`bg-${feature.bg} text-${feature.bg}-foreground rounded-full p-4 inline-block mb-4 dark:bg-${feature.bg}-dark dark:text-${feature.bg}-foreground-dark`}>
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                </svg>
              </div>
              <h4 className="text-xl font-semibold text-foreground mb-2 dark:text-foreground-dark">{feature.title}</h4>
              <p className="text-muted-foreground dark:text-muted-foreground-dark">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Testimonials Section */}
    <section id="testimonials" className="py-20 bg-accent dark:bg-accent-dark">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl font-bold text-foreground text-center mb-12 dark:text-foreground-dark animate-fade-in">What Our Users Say</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { quote: 'SoloSync’s automation has transformed my freelance workflow. It’s a game-changer!', name: 'Alex Johnson', role: 'Freelance Designer', rating: 5 },
            { quote: 'File attachments keep my projects organized and accessible. Love it!', name: 'Maria Garcia', role: 'Business Consultant', rating: 4 },
            { quote: 'Perfect for my small team. SoloSync saves us hours every week!', name: 'David Lee', role: 'Small Business Owner', rating: 5 },
          ].map((testimonial, index) => (
            <div key={index} className="p-8 bg-card rounded-xl border border-border card-hover dark:bg-card-dark dark:border-border-dark animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <svg className="w-12 h-12 text-secondary mb-4 dark:text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <p className="text-muted-foreground mb-6 italic dark:text-muted-foreground-dark">“{testimonial.quote}”</p>
              <div className="flex items-center">
                <svg className="w-12 h-12 text-primary mr-4 dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <div>
                  <p className="font-semibold text-foreground dark:text-foreground-dark">{testimonial.name}</p>
                  <p className="text-muted-foreground text-sm dark:text-muted-foreground-dark">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mt-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-muted'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Mobile App Section */}
    <section id="mobile" className="py-20 bg-card dark:bg-card-dark">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center animate-slide-up">
        <div className="md:w-1/2 text-center md:text-left">
          <h3 className="text-3xl font-bold text-foreground mb-4 dark:text-foreground-dark">Manage Anywhere, Anytime</h3>
          <p className="text-xl text-muted-foreground mb-8 dark:text-muted-foreground-dark">The Sagan Command Center mobile app, available on the App Store, keeps your projects at your fingertips.</p>
          <a className="btn-secondary">Download Now</a>
        </div>
        <div className="md:w-1/2 mt-10 md:mt-0 flex justify-center">
          <svg className="w-64 h-64 text-secondary dark:text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
    </section>

    {/* Trust and Reviews Section */}
    <section className="py-20 bg-accent dark:bg-accent-dark">
      <div className="container mx-auto px-4 text-center">
        <h3 className="text-3xl font-bold text-foreground mb-12 dark:text-foreground-dark animate-fade-in">Trusted by Professionals</h3>
        <div className="flex flex-col md:flex-row justify-center space-y-8 md:space-y-0 md:space-x-12">
          {[
            { platform: 'Trustpilot', rating: '4.9/5 (500+ Reviews)' },
            { platform: 'Capterra', rating: 'Top-Rated Software' },
            { platform: 'G2', rating: 'Project Management Leader' },
          ].map((review, index) => (
            <div key={index} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
              <svg className="w-16 h-16 text-primary mx-auto mb-4 dark:text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <p className="text-muted-foreground font-medium dark:text-muted-foreground-dark">{review.platform}: {review.rating}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-background-dark text-foreground-dark py-12 dark:bg-card-dark dark:text-foreground-dark">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-lg font-semibold mb-4">Sagan Command Center</h4>
            <p className="text-muted-foreground dark:text-muted-foreground-dark">Empowering solo professionals with efficient project management tools.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-muted-foreground hover:text-foreground transition dark:text-muted-foreground-dark dark:hover:text-foreground-dark">Features</a></li>
              <li><a href="#why" className="text-muted-foreground hover:text-foreground transition dark:text-muted-foreground-dark dark:hover:text-foreground-dark">Why Sagan Command Center</a></li>
              <li><a href="#mobile" className="text-muted-foreground hover:text-foreground transition dark:text-muted-foreground-dark dark:hover:text-foreground-dark">Mobile App</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="/about" className="text-muted-foreground hover:text-foreground transition dark:text-muted-foreground-dark dark:hover:text-foreground-dark">About Us</a></li>
              <li><a href="/blog" className="text-muted-foreground hover:text-foreground transition dark:text-muted-foreground-dark dark:hover:text-foreground-dark">Blog</a></li>
              <li><a href="/careers" className="text-muted-foreground hover:text-foreground transition dark:text-muted-foreground-dark dark:hover:text-foreground-dark">Careers</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="/help" className="text-muted-foreground hover:text-foreground transition dark:text-muted-foreground-dark dark:hover:text-foreground-dark">Help Center</a></li>
              <li><a href="/contact" className="text-muted-foreground hover:text-foreground transition dark:text-muted-foreground-dark dark:hover:text-foreground-dark">Contact Us</a></li>
              <li><a href="/terms" className="text-muted-foreground hover:text-foreground transition dark:text-muted-foreground-dark dark:hover:text-foreground-dark">Terms of Service</a></li>
              <li><a href="/privacy" className="text-muted-foreground hover:text-foreground transition dark:text-muted-foreground-dark dark:hover:text-foreground-dark">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 text-center text-muted-foreground dark:text-muted-foreground-dark">
          {/* <p>© 2025 SoloSync. All rights reserved.</p> */}
          <div className="mt-4 flex justify-center space-x-6">
            {[
              { path: 'M18.36 5.64c-1.95-1.96-5.11-2.64-7.8-1.54l-.93 3.84c1.36-.33 2.8.04 3.96 1.2 1.17 1.17 1.54 2.61 1.2 3.96l3.84-.93c1.1-2.69.42-5.85-1.54-7.8zM5.64 18.36c1.95 1.96 5.11 2.64 7.8 1.54l.93-3.84c-1.36.33-2.8-.04-3.96-1.2-1.17-1.17-1.54-2.61-1.2-3.96l-3.84.93c-1.1 2.69-.42 5.85 1.54 7.8zM12 22C6.48 22 2 17.52 2 12S6.48 2 12 2s10 4.48 10 10-4.48 10-10 10zm0-2c4.41 0 8-3.59 8-8s-3.59-8-8-8-8 3.59-8 8 3.59 8 8 8z' },
              { path: 'M22 4.01c-.81.36-1.68.6-2.59.71.47-.28.82-.69 1-1.19-.45.27-.93.49-1.45.6-.86-.92-2.09-1.49-3.45-1.49-2.61 0-4.72 2.11-4.72 4.72 0 .37.04.73.12 1.07-3.92-.2-7.39-2.07-9.71-4.92-.41.7-.64 1.51-.64 2.37 0 1.64.83 3.08 2.09 3.93-.77-.02-1.49-.23-2.12-.58v.06c0 2.29 1.63 4.2 3.79 4.63-.4.11-.82.16-1.25.16-.31 0-.61-.03-.91-.09.61 1.91 2.39 3.3 4.49 3.34-1.64 1.29-3.71 2.06-5.96 2.06-.39 0-.77-.02-1.14-.07 2.11 1.36 4.62 2.15 7.32 2.15 8.78 0 13.58-7.27 13.58-13.58 0-.21 0-.41-.01-.62.93-.67 1.74-1.51 2.38-2.46-.85.38-1.77.63-2.73.74z' },
              { path: 'M19 3a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14m-2 2H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2zm-8 2.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zm0 1a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm5 6.5c0-.28-.22-.5-.5-.5h-4a.5.5 0 00-.5.5.5.5 0 00.5.5h4a.5.5 0 00.5-.5z' },
            ].map((icon, index) => (
              <a key={index} href="#" className="text-muted-foreground hover:text-foreground transition dark:text-muted-foreground-dark dark:hover:text-foreground-dark">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d={icon.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  </div>
  );
}
