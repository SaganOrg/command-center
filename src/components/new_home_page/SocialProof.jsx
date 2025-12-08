import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote } from "lucide-react";

const SocialProof = () => {
  const testimonials = [
    {
      quote: "Sagan has been a game-changer for my workflow. What used to take 20 emails back-and-forth now happens on one task card. My assistant and I are finally on the same page.",
      author: "Sarah Chen",
      role: "CEO",
      company: "TechVenture Inc.",
      rating: 5,
      stat: "Saved 12 hours/week"
    },
    {
      quote: "The voice-to-task feature is incredible. I can delegate while driving, walking, or between meetings. By the time I'm back at my desk, my assistant has already started working on it.",
      author: "Michael Rodriguez",
      role: "Managing Partner",
      company: "Summit Capital",
      rating: 5,
      stat: "10x faster delegation"
    },
    {
      quote: "EOD reports used to take me 30 minutes to write. Now it's 2 minutes with Sagan's structured format. My executive gets better updates and I get my evenings back.",
      author: "Emily Thompson",
      role: "Executive Assistant",
      company: "Global Enterprises",
      rating: 5,
      stat: "15x faster reporting"
    },
    {
      quote: "We've tried Asana, Monday, Trello—they're all too complex for a two-person team. Sagan is the first tool that actually fits how we work together.",
      author: "David Park",
      role: "Founder",
      company: "Innovate Labs",
      rating: 5,
      stat: "Zero learning curve"
    },
    {
      quote: "The reference library alone is worth it. We finally have one place for passwords, templates, and important docs. No more 'where did you send that file?' conversations.",
      author: "Jennifer Martinez",
      role: "Executive Assistant",
      company: "Sterling Group",
      rating: 5,
      stat: "Find anything in 10 sec"
    },
    {
      quote: "I love that I can see exactly what my assistant is working on without having to ask. The real-time updates give me peace of mind and let her work without interruptions.",
      author: "Robert Kim",
      role: "VP of Operations",
      company: "Apex Solutions",
      rating: 5,
      stat: "90% fewer check-ins"
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Loved by Executive-Assistant Teams
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of teams who've transformed their workflow with Sagan Command Center
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto">
          {[
            { value: "500+", label: "Active Teams", color: "text-brand-blue" },
            { value: "10,000+", label: "Tasks Completed", color: "text-brand-orange" },
            { value: "4.9/5", label: "Average Rating", color: "text-brand-green" },
            { value: "10+ hrs", label: "Saved Per Week", color: "text-brand-blue" }
          ].map((stat, idx) => (
            <div key={idx} className="text-center p-6 bg-white rounded-xl shadow-md">
              <div className={`text-3xl md:text-4xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border border-gray-200 shadow-lg hover:shadow-xl transition-shadow bg-white">
              <CardContent className="p-6 flex flex-col h-full">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>

                {/* Quote */}
                <Quote className="h-8 w-8 text-brand-purple/20 mb-3" />
                <blockquote className="flex-grow mb-6">
                  <p className="text-gray-700 leading-relaxed">"{testimonial.quote}"</p>
                </blockquote>

                {/* Stat Highlight */}
                <div className="mb-4 px-3 py-2 bg-green-50 rounded-lg border border-green-200 inline-block">
                  <span className="text-sm font-bold text-green-700">{testimonial.stat}</span>
                </div>

                {/* Author */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-brand-blue to-brand-green text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.author}</p>
                      <p className="text-sm text-gray-600">{testimonial.role}</p>
                      <p className="text-xs text-gray-500">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="text-center">
          <p className="text-gray-600 mb-6">Trusted by teams at leading companies</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-60">
            {["TechVenture", "Summit Capital", "Global Enterprises", "Innovate Labs", "Sterling Group", "Apex Solutions"].map((company, idx) => (
              <div key={idx} className="text-lg font-bold text-gray-700">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
