import React from "react";
import { Calendar, CheckSquare, FileText, MessageSquare, Plus, Smartphone, Users } from "lucide-react";

const featureItems = [
  {
    title: "AI Assistant Integration",
    description: "Smart AI assistants help manage tasks, provide insights, and automate routine work to increase your productivity.",
    icon: <Users className="h-12 w-12 text-brand-purple" />,
  },
  {
    title: "Comprehensive Task Management",
    description: "Create, assign, and track tasks with ease. Both users and AI assistants can see and collaborate on tasks.",
    icon: <CheckSquare className="h-12 w-12 text-brand-blue" />,
  },
  {
    title: "End of Day Reports",
    description: "Automatic daily summaries of your assistant's work, keeping you informed of progress and achievements.",
    icon: <FileText className="h-12 w-12 text-brand-green" />,
  },
  {
    title: "File Attachments",
    description: "Easily attach and share files within tasks, ensuring all project resources are accessible in one place.",
    icon: <Plus className="h-12 w-12 text-brand-indigo" />,
  },
  {
    title: "Cross-Platform Support",
    description: "Access your projects from anywhere with our web and mobile applications for iOS and Android devices.",
    icon: <Smartphone className="h-12 w-12 text-brand-teal" />,
  },
  {
    title: "Real-Time Collaboration",
    description: "Work together with team members and AI assistants in real-time, boosting productivity and coordination.",
    icon: <MessageSquare className="h-12 w-12 text-brand-purple" />,
  },
];

const NewFeatures = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold gradient-text">Powerful Features</h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Our comprehensive project management tool combines powerful features to streamline your workflow
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureItems.map((feature, index) => (
            <div 
              key={index} 
              className="feature-card group hover:border-l-4 hover:border-brand-purple"
            >
              <div className="mb-5 inline-block p-3 rounded-lg bg-gray-50 group-hover:bg-brand-purple/10 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 group-hover:text-brand-purple transition-colors">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-20 bg-gradient-to-r from-brand-purple/10 to-brand-blue/10 rounded-xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Daily Assistant Progress Reports</h3>
              <p className="text-gray-700 mb-6">
                Keep track of your team's and your assistant daily progress with automated End of Day reports. These comprehensive summaries ensure you never miss important updates and achievements.
              </p>
              <ul className="space-y-3">
                {[
                  "Automated task status updates",
                  "Summary of completed work",
                  "Upcoming deadlines and priorities",
                  "Time tracking and productivity analysis",
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckSquare className="h-5 w-5 text-brand-green mr-2 flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-4 pb-2 border-b">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-brand-purple mr-2" />
                    <h4 className="font-medium">EOD Report - May 14, 2025</h4>
                  </div>
                  <span className="text-xs bg-brand-purple/10 text-brand-purple px-2 py-1 rounded-full">Generated 5:30 PM</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Tasks Completed (8/12)</h5>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-brand-green h-2.5 rounded-full" style={{ width: "66%" }}></div>
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Highlights</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Finished website design revisions</li>
                      <li>• Prepared client presentation</li>
                      <li>• Scheduled team meeting for tomorrow</li>
                      <li>• Resolved 3 high-priority support tickets</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Blockers</h5>
                    <p className="text-sm text-gray-600">Waiting for feedback on marketing materials</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-1">Tomorrow's Focus</h5>
                    <p className="text-sm text-gray-600">Finalize Q2 planning and start mobile app testing</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewFeatures;
