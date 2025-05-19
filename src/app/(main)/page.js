"use client";

import { useEffect } from "react";
import { ClipboardList, BookOpen, LayoutGrid, Mic } from "lucide-react";
import FeatureCard from "../../components/FeatureCard";
import Hero from "../../components/Hero";
import AnimatedTransition from "../../components/AnimatedTransition";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import HeroNew from "@/components/new_home_page/Hero";
import NewFeatures from "@/components/new_home_page/NewFeatures";
import TestimonialsNew from "@/components/new_home_page/TestimonialsNew";
import FooterNew from "@/components/new_home_page/FooterNew";
import DeviceAvailability from "@/components/new_home_page/DeviceAvailability";

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

      <HeroNew />
      <NewFeatures />
      <DeviceAvailability />
      {/* <TestimonialsNew /> */}

 
<FooterNew />
  </div>
  );
}
