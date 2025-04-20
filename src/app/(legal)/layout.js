import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Link from "next/link";

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
        <div className="min-h-screen flex flex-col">
          {/* <nav className="bg-background border-b border-border/30 py-2 px-4">
            <div className="container mx-auto flex justify-between items-center">
              <Link href="/" className="font-medium text-lg">
                Sagan Command Center
              </Link>
            </div>
          </nav> */}
          <main className="flex-1 pt-6 pb-6">
            {children}
          </main>
          <footer className="py-6 border-t border-border/30 bg-white">
            <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
              <p>© {new Date().getFullYear()} Sagan Command Center</p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
