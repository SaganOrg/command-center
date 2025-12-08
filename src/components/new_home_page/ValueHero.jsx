"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Zap, Users, Clock } from "lucide-react";
import Link from 'next/link';

const ValueHero = () => {
  return (
    <div className="relative pt-20 pb-16 md:pt-32 md:pb-28 overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-white" />
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-radial from-brand-purple/20 to-transparent opacity-50" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-radial from-brand-blue/20 to-transparent opacity-40" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue/10 rounded-full mb-6 animate-fade-in">
            <Zap className="h-4 w-4 text-brand-blue" />
            <span className="text-sm font-medium text-brand-blue">The Command Center for Executive-Assistant Teams</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight animate-slide-up">
            <span className="block text-gray-900">Transform How You Work</span>
            <span className="block gradient-text mt-2">With Your Assistant</span>
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Stop drowning in emails and scattered tools. Sagan Command Center gives executive-assistant teams
            a <span className="font-semibold text-gray-900">single platform to collaborate, track work, and stay aligned</span>—saving hours every week.
          </p>

          {/* Key Benefits */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Save 10+ hours/week</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">Zero learning curve</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">AI-powered workflows</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-brand-orange hover:bg-brand-orange/90 rounded-lg shadow-lg hover:shadow-xl transition-all">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:border-brand-blue hover:text-brand-blue transition-colors">
              See How It Works
            </a>
          </div>

          <p className="mt-4 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            No credit card required • Set up in under 5 minutes
          </p>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-brand-blue">
            <div className="text-4xl font-bold text-brand-blue mb-2">10+</div>
            <div className="text-gray-600">Hours saved per week</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-brand-orange">
            <div className="text-4xl font-bold text-brand-orange mb-2">95%</div>
            <div className="text-gray-600">Fewer missed tasks</div>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow border-t-4 border-brand-green">
            <div className="text-4xl font-bold text-brand-green mb-2">3x</div>
            <div className="text-gray-600">Faster communication</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValueHero;
