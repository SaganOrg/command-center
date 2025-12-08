import React from "react";
import {
  Mic,
  ListChecks,
  FileText,
  Library,
  Brain,
  Clock,
  Zap,
  Users,
  Tag,
  Search
} from "lucide-react";

const ValueFeatures = () => {
  const features = [
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Voice-to-Task in Seconds",
      description: "Too busy to type? Record your thoughts and let AI transcribe and format them into clear, actionable tasks.",
      benefits: ["Save 5-10 min per task", "Never lose a thought", "Perfect for on-the-go"],
      color: "brand-orange",
      stat: "10x faster"
    },
    {
      icon: <ListChecks className="h-8 w-8" />,
      title: "Visual Task Management",
      description: "Kanban-style board with 6 workflow stages. Both executive and assistant see the same real-time view—no more \"what's the status?\" messages.",
      benefits: ["Drag-and-drop simplicity", "Real-time updates", "Zero status meetings"],
      color: "brand-blue",
      stat: "Zero learning curve"
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "2-Minute EOD Reports",
      description: "Your assistant fills out a simple form once a day. You get a structured report showing completed work, blockers, and tomorrow's priorities.",
      benefits: ["Automated summaries", "7-day history", "Identify patterns"],
      color: "brand-green",
      stat: "15x faster reporting"
    },
    {
      icon: <Library className="h-8 w-8" />,
      title: "Shared Reference Library",
      description: "Stop digging through emails for that one document. Store processes, templates, passwords, and files in a searchable knowledge base.",
      benefits: ["Instant search", "Tag organization", "File attachments"],
      color: "brand-blue",
      stat: "Find anything in 10 sec"
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Workflows",
      description: "Let AI handle the busywork: transcribe voice notes, generate task titles, and format information so it's ready to act on.",
      benefits: ["Auto transcription", "Smart formatting", "Context extraction"],
      color: "brand-orange",
      stat: "Powered by GPT & Whisper"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Built for Two-Person Teams",
      description: "Not a bloated enterprise tool. Purpose-built for the unique dynamics of executive-assistant partnerships.",
      benefits: ["Role-based access", "Privacy controls", "Simple onboarding"],
      color: "brand-green",
      stat: "Setup in 5 minutes"
    }
  ];

  const highlights = [
    {
      icon: <Zap className="h-6 w-6 text-yellow-500" />,
      title: "Lightning Fast",
      description: "Built for speed. Every action is instant."
    },
    {
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      title: "Save 10+ Hours/Week",
      description: "Eliminate repetitive communication overhead."
    },
    {
      icon: <Tag className="h-6 w-6 text-purple-500" />,
      title: "Stay Organized",
      description: "Tags, labels, and search make everything findable."
    },
    {
      icon: <Search className="h-6 w-6 text-green-500" />,
      title: "Never Lose Context",
      description: "Full history and attachments on every task."
    }
  ];

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Everything You Need, Nothing You Don't
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Powerful features designed specifically for executive-assistant teams. Each one solves a real pain point.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200 hover:border-brand-purple/50 hover:shadow-xl transition-all duration-300"
            >
              {/* Icon & Stat */}
              <div className="flex items-start justify-between mb-6">
                <div className={`p-3 rounded-xl bg-${feature.color}/10 text-${feature.color} group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold text-${feature.color}`}>{feature.stat}</div>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-brand-purple transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                {feature.description}
              </p>

              {/* Benefits */}
              <ul className="space-y-2">
                {feature.benefits.map((benefit, bidx) => (
                  <li key={bidx} className="flex items-center gap-2 text-sm text-gray-700">
                    <div className={`w-1.5 h-1.5 rounded-full bg-${feature.color}`}></div>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Highlights Bar */}
        <div className="bg-gradient-to-r from-brand-blue/5 via-brand-orange/5 to-brand-green/5 rounded-2xl p-8 md:p-12">
          <h3 className="text-2xl md:text-3xl font-bold text-center mb-10 text-gray-900">
            Why Teams Love Sagan Command Center
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {highlights.map((item, idx) => (
              <div key={idx} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-md mb-4">
                  {item.icon}
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Cross-Platform Note */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            Access from any device: Web, iOS, Android, Tablet
          </p>
          <div className="flex justify-center gap-4 opacity-60">
            <span className="text-sm font-medium text-gray-700">💻 Desktop</span>
            <span className="text-sm font-medium text-gray-700">📱 Mobile</span>
            <span className="text-sm font-medium text-gray-700">🌐 Web</span>
            <span className="text-sm font-medium text-gray-700">📟 Tablet</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ValueFeatures;
