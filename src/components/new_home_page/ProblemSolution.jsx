import React from "react";
import { X, Check, Mail, MessageSquare, FileQuestion, Clock } from "lucide-react";

const ProblemSolution = () => {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            The Old Way vs. The Sagan Way
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Most executive-assistant teams waste hours every day on inefficient communication and scattered tools. There's a better way.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-20">
          {/* Without Sagan */}
          <div className="bg-red-50 rounded-2xl p-8 border-2 border-red-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-red-100 rounded-lg">
                <X className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Without Sagan</h3>
            </div>
            <ul className="space-y-4">
              {[
                "Endless back-and-forth emails to clarify tasks",
                "Tasks get lost in scattered tools and threads",
                "No visibility into what your assistant is working on",
                "EOD updates take 30+ minutes to compile",
                "Important files buried in email attachments",
                "Repeating the same information over and over"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <X className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* With Sagan */}
          <div className="bg-green-50 rounded-2xl p-8 border-2 border-green-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-green-100 rounded-lg">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">With Sagan</h3>
            </div>
            <ul className="space-y-4">
              {[
                "Create tasks instantly with voice or text—crystal clear context",
                "Everything organized in one visual board you both can see",
                "Real-time visibility into task status and progress",
                "Automated EOD reports generated in 2 minutes",
                "Shared reference library with instant search",
                "All context and history in one place, always accessible"
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pain Points Addressed */}
        <div className="bg-gradient-to-br from-brand-blue/5 to-brand-green/5 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-900">
            Built for the Unique Challenges of Executive-Assistant Partnerships
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Mail className="h-8 w-8 text-brand-orange" />,
                problem: "Email Overload",
                solution: "Centralized task management eliminates endless email chains"
              },
              {
                icon: <MessageSquare className="h-8 w-8 text-brand-blue" />,
                problem: "Context Loss",
                solution: "All task details, history, and attachments in one place"
              },
              {
                icon: <FileQuestion className="h-8 w-8 text-brand-green" />,
                problem: "Information Silos",
                solution: "Shared reference library keeps everyone on the same page"
              },
              {
                icon: <Clock className="h-8 w-8 text-brand-blue" />,
                problem: "Status Updates",
                solution: "Automated daily reports save hours of manual reporting"
              }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-xl shadow-md mb-4">
                  {item.icon}
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">{item.problem}</h4>
                <p className="text-gray-600 text-sm">{item.solution}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
