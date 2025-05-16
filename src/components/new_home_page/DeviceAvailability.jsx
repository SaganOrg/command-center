import React from "react";
import { Laptop, Smartphone, Tablet, Tv } from "lucide-react";
import { Button } from "@/components/ui/button";

const DeviceAvailability = () => {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-white to-blue-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-slide-down">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Access Sagan Command Center Anywhere
          </h2>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Stay productive on any device with our seamless cross-platform experience
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            {
              icon: <Smartphone className="h-10 w-10" />,
              title: "Mobile",
              description: "Take your tasks on the go with our responsive mobile app",
              color: "from-brand-purple to-brand-indigo",
            },
            {
              icon: <Tablet className="h-10 w-10" />,
              title: "Tablet",
              description: "Perfect for reviewing reports and managing your team",
              color: "from-brand-blue to-brand-indigo",
            },
            {
              icon: <Laptop className="h-10 w-10" />,
              title: "Desktop",
              description: "Full-featured experience for maximum productivity",
              color: "from-brand-teal to-brand-blue",
            },
            {
              icon: <Tv className="h-10 w-10" />,
              title: "Web",
              description: "Access from any browser on any device, anywhere",
              color: "from-brand-green to-brand-teal",
            },
          ].map((device, index) => (
            <div 
              key={index}
              className="feature-card flex flex-col items-center text-center group animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`mb-6 p-4 rounded-full bg-gradient-to-br ${device.color} bg-opacity-10 text-white`}>
                {device.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{device.title}</h3>
              <p className="text-gray-600">{device.description}</p>
            </div>
          ))}
        </div>
        
        <div className="relative mt-20 lg:mt-24">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="order-2 lg:order-1">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">Seamless Synchronization</h3>
                <p className="text-gray-600 mb-6">
                  Your data syncs in real-time across all your devices. Start a task on your phone, 
                  continue on your laptop, and finish it on your tablet - all with zero lag or data loss.
                </p>
                <ul className="space-y-3 mb-8">
                  {[
                    "Real-time updates and notifications",
                    "Offline mode with automatic syncing",
                    "Cloud storage for all your files and attachments",
                    "Shared workspace across all platforms"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start">
                      <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-brand-green"></div>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <Button className="btn-primary">Download Apps</Button>
              </div>
              <div className="order-1 lg:order-2">
                <div className="relative">
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-100 rounded-full opacity-70 blur-3xl"></div>
                  <div className="relative z-10 flex justify-center items-center">
                    <div className="w-32 h-64 bg-gray-800 rounded-3xl shadow-xl mr-4 overflow-hidden border-8 border-gray-700">
                      <div className="h-full bg-gradient-to-br from-blue-50 to-white p-2">
                        <div className="h-full rounded-lg overflow-hidden shadow-inner">
                          <div className="h-full bg-white flex flex-col">
                            <div className="h-2 bg-brand-purple w-1/2 mb-1 rounded"></div>
                            <div className="h-1 bg-gray-200 mb-2 rounded"></div>
                            <div className="flex-1 flex flex-col p-1">
                              <div className="flex-1 bg-gray-100 rounded mb-1"></div>
                              <div className="flex-1 bg-gray-100 rounded mb-1"></div>
                              <div className="flex-1 bg-gray-100 rounded"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-56 h-44 bg-gray-700 rounded-lg shadow-xl overflow-hidden border-8 border-gray-800">
                      <div className="h-full bg-gradient-to-br from-blue-50 to-white p-2">
                        <div className="h-full rounded overflow-hidden shadow-inner">
                          <div className="h-full bg-white flex flex-col">
                            <div className="h-2 bg-brand-blue w-1/2 mb-1 rounded"></div>
                            <div className="h-1 bg-gray-200 mb-2 rounded"></div>
                            <div className="flex-1 flex p-1">
                              <div className="w-1/3 bg-gray-100 rounded mr-1"></div>
                              <div className="w-2/3 flex flex-col">
                                <div className="flex-1 bg-gray-100 rounded mb-1"></div>
                                <div className="flex-1 bg-gray-100 rounded"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-center">
            <p className="text-gray-500">Also available as a progressive web app (PWA) for offline access</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeviceAvailability;
