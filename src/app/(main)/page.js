"use client";

import ValueHero from "@/components/new_home_page/ValueHero";
import ProblemSolution from "@/components/new_home_page/ProblemSolution";
import ValueFeatures from "@/components/new_home_page/ValueFeatures";
import HowItWorks from "@/components/new_home_page/HowItWorks";
import SocialProof from "@/components/new_home_page/SocialProof";
import FinalCTA from "@/components/new_home_page/FinalCTA";
import FooterNew from "@/components/new_home_page/FooterNew";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Value-Driven Hero Section */}
      <ValueHero />

      {/* Problem/Solution Comparison */}
      <ProblemSolution />

      {/* How It Works - Step by Step */}
      <HowItWorks />

      {/* Value-Driven Features */}
      <ValueFeatures />

      {/* Social Proof & Testimonials */}
      <SocialProof />

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <FooterNew />
    </div>
  );
}
