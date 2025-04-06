import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sagan Command Center",
  // description: "",
};

// const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        cz-shortcut-listen="true"
      >
        {/* <QueryClientProvider client={queryClient}> */}
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <main className="flex-1 pt-6 pb-6">
                {" "}
                {/* Increased bottom padding further */}
                <AnimatePresence >{children}</AnimatePresence>
              </main>
              <footer className="py-6 border-t border-border/30 bg-secondary/50">
                <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
                  <p>© {new Date().getFullYear()} Sagan Command Center</p>
                </div>
              </footer>
            </div>
          </TooltipProvider>
        {/* </QueryClientProvider> */}
      </body>
    </html>
  );
}
