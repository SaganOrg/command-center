import React from "react";
import { Mic, ListChecks, FileText, Library, ArrowRight } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: <Mic className="h-10 w-10" />,
      title: "Capture Tasks Instantly",
      description: "Executives: Record a voice note or type a task. AI transcribes and formats it automatically with all the context your assistant needs.",
      color: "from-brand-orange to-brand-blue",
      benefit: "Save 30 minutes per day on task delegation"
    },
    {
      number: "02",
      icon: <ListChecks className="h-10 w-10" />,
      title: "Collaborate on One Board",
      description: "Assistants see tasks instantly, update status as they work, add comments, and attach files. Executives track progress in real-time without asking.",
      color: "from-brand-blue to-brand-green",
      benefit: "Eliminate 90% of status check-in messages"
    },
    {
      number: "03",
      icon: <FileText className="h-10 w-10" />,
      title: "Get Automatic Updates",
      description: "At end of day, assistants submit a quick report. Executives see what's done, what's pending, and any blockers—all in 2 minutes.",
      color: "from-brand-green to-brand-blue",
      benefit: "Turn 30-minute updates into 2-minute summaries"
    },
    {
      number: "04",
      icon: <Library className="h-10 w-10" />,
      title: "Build Shared Knowledge",
      description: "Store important info, processes, and files in your reference library. Never ask \"where's that document?\" again.",
      color: "from-brand-blue to-brand-orange",
      benefit: "Find any file or info in under 10 seconds"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/10 rounded-full blur-3xl -z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl -z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A simple, powerful workflow designed specifically for executive-assistant teams. Get started in minutes, not weeks.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 md:space-y-12">
          {steps.map((step, idx) => (
            <div key={idx} className="relative">
              {/* Connector Line (except for last item) */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute left-1/2 top-32 w-0.5 h-20 bg-gradient-to-b from-brand-purple/30 to-transparent transform -translate-x-1/2" />
              )}

              <div className={`bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow ${
                idx % 2 === 0 ? 'md:mr-0' : 'md:ml-0'
              }`}>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Content */}
                  <div className={`p-8 md:p-12 ${idx % 2 === 1 ? 'md:order-2' : ''}`}>
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`p-4 rounded-xl bg-gradient-to-br ${step.color} text-white flex-shrink-0`}>
                        {step.icon}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-400 mb-1">STEP {step.number}</div>
                        <h3 className="text-2xl md:text-3xl font-bold text-gray-900">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
                      <ArrowRight className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-700">{step.benefit}</span>
                    </div>
                  </div>

                  {/* Visual */}
                  <div className={`bg-gradient-to-br ${step.color} p-8 md:p-12 min-h-[300px] flex items-center justify-center ${
                    idx % 2 === 1 ? 'md:order-1' : ''
                  }`}>
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
                      {/* Mock UI based on step */}
                      {idx === 0 && (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 pb-3 border-b">
                            <Mic className="h-5 w-5 text-brand-purple" />
                            <div className="text-sm font-semibold text-gray-700">Voice Task Input</div>
                          </div>
                          <div className="space-y-3">
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                          </div>
                          <div className="flex items-center justify-center gap-2 py-3 bg-brand-purple/10 rounded-lg">
                            <div className="w-2 h-2 bg-brand-purple rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-brand-purple">Recording...</span>
                          </div>
                        </div>
                      )}
                      {idx === 1 && (
                        <div className="space-y-3">
                          <div className="text-xs font-semibold text-gray-500 mb-2">IN PROGRESS</div>
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-4 h-4 border-2 border-brand-blue rounded"></div>
                              <div className="flex-1">
                                <div className="h-2 bg-gray-300 rounded w-full mb-1"></div>
                                <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {idx === 2 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b">
                            <div className="text-sm font-semibold text-gray-700">EOD Report</div>
                            <div className="text-xs text-gray-500">Today 5:30 PM</div>
                          </div>
                          <div className="space-y-2">
                            <div className="text-xs font-semibold text-gray-500">Completed (8/12)</div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div className="bg-brand-green h-2 rounded-full" style={{ width: "66%" }}></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-2 bg-gray-200 rounded w-full"></div>
                            <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                            <div className="h-2 bg-gray-200 rounded w-4/6"></div>
                          </div>
                        </div>
                      )}
                      {idx === 3 && (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 pb-3 border-b">
                            <Library className="h-5 w-5 text-brand-indigo" />
                            <div className="text-sm font-semibold text-gray-700">Reference Library</div>
                          </div>
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                              <div className="w-10 h-10 bg-gradient-to-br from-brand-indigo to-brand-purple rounded flex-shrink-0"></div>
                              <div className="flex-1 min-w-0">
                                <div className="h-2 bg-gray-300 rounded w-3/4 mb-1"></div>
                                <div className="h-1.5 bg-gray-200 rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-xl text-gray-600 mb-6">
            See how it all comes together in your workflow
          </p>
          <a href="/login" className="inline-flex items-center gap-2 px-8 py-4 bg-brand-orange text-white font-semibold rounded-lg hover:bg-brand-orange/90 transition-colors shadow-lg">
            Try It Free <ArrowRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
