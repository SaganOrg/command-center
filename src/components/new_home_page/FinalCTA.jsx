import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Sparkles } from "lucide-react";
import Link from 'next/link';

const FinalCTA = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-brand-green via-brand-blue to-brand-orange relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center text-white">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Start Your Free Trial Today</span>
          </div>

          {/* Headline */}
          <h2 className="text-3xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Ready to Transform How You
            <br />
            Work with Your Assistant?
          </h2>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join hundreds of executive-assistant teams saving 10+ hours every week.
            Get started in less than 5 minutes—no credit card required.
          </p>

          {/* Benefits */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-10 text-left sm:text-center">
            {[
              "Free forever for individuals",
              "No credit card required",
              "Set up in 5 minutes",
              "Cancel anytime"
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-white/95">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-brand-orange text-white text-lg font-bold rounded-lg hover:bg-brand-orange/90 shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all">
              Get Started Free
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          <p className="text-white/80 text-sm">
            Have questions? <a href="mailto:support@sagancommand.com" className="underline font-medium hover:text-white">Contact our team</a>
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid sm:grid-cols-2 md:grid-cols-4 gap-6 text-white">
          {[
            {
              icon: "🎤",
              title: "Voice Input",
              description: "AI-powered transcription"
            },
            {
              icon: "📋",
              title: "Task Board",
              description: "Visual collaboration"
            },
            {
              icon: "📊",
              title: "EOD Reports",
              description: "2-minute summaries"
            },
            {
              icon: "📚",
              title: "Knowledge Base",
              description: "Shared reference library"
            }
          ].map((feature, idx) => (
            <div key={idx} className="text-center p-6 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-colors">
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h4 className="font-bold text-lg mb-1">{feature.title}</h4>
              <p className="text-sm text-white/80">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Trust Signal */}
        <div className="mt-16 text-center">
          <p className="text-white/70 text-sm mb-4">Trusted by 500+ executive-assistant teams</p>
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg key={i} className="h-6 w-6 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
            <span className="ml-2 text-white/90 font-medium">4.9/5 average rating</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
