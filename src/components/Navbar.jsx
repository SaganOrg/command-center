"use client";
import React, { useState, useEffect } from "react";
import {
  Mic,
  ListChecks,
  ClipboardList,
  BookOpen,
  Settings,
  LogIn,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const adminMenu = [
  { href: "/admin", icon: <Mic className="h-4 w-4 mr-1" />, label: "Dashboard" },
  { href: "/voice", icon: <Mic className="h-4 w-4 mr-1" />, label: "Voice Input" },
  { href: "/projects", icon: <ListChecks className="h-4 w-4 mr-1" />, label: "Project Board" },
  { href: "/reports", icon: <ClipboardList className="h-4 w-4 mr-1" />, label: "Reports" },
  { href: "/attachments", icon: <BookOpen className="h-4 w-4 mr-1" />, label: "Reference" },
  { href: "/settings", icon: <Settings className="h-4 w-4 mr-1" />, label: "Settings" },
];

const privateMenuItems = [
  { href: "/voice", icon: <Mic className="h-4 w-4 mr-1" />, label: "Voice Input" },
  { href: "/projects", icon: <ListChecks className="h-4 w-4 mr-1" />, label: "Project Board" },
  { href: "/reports", icon: <ClipboardList className="h-4 w-4 mr-1" />, label: "Reports" },
  { href: "/attachments", icon: <BookOpen className="h-4 w-4 mr-1" />, label: "Reference" },
  { href: "/settings", icon: <Settings className="h-4 w-4 mr-1" />, label: "Settings" },
];

const privateAssistantItems = [
  { href: "/projects", icon: <ListChecks className="h-4 w-4 mr-1" />, label: "Project Board" },
  { href: "/reports", icon: <ClipboardList className="h-4 w-4 mr-1" />, label: "Reports" },
  { href: "/attachments", icon: <BookOpen className="h-4 w-4 mr-1" />, label: "Reference" },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("Initial session check:", session ? "Found" : "Missing");
        if (!session) {
          setIsLoggedIn(false);
          setLoggedInUser(null);
          return;
        }

        const { data, error } = await supabase
          .from("users")
          .select("id, email, role, status, assistant_id")
          .eq("id", session.user.id)
          .single();
        if (error) throw error;

        if (data.status === "pending" || data.status === "rejected") {
          await supabase.auth.signOut();
          setIsLoggedIn(false);
          setLoggedInUser(null);
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "Please wait until your account is approved by an admin",
          });
          router.push("/login?error=account_pending");
        } else {
          setIsLoggedIn(true);
          setLoggedInUser(data);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setIsLoggedIn(false);
        setLoggedInUser(null);
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "Authentication error. Please log in again.",
        });
        router.push("/login");
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event, "Session:", session ? "Found" : "Missing");
        if (event === "SIGNED_OUT") {
          setIsLoggedIn(false);
          setLoggedInUser(null);
          if (pathname !== "/login") {
            router.push("/login");
          }
        } else if (session) {
          try {
            const { data, error } = await supabase
              .from("users")
              .select("id, email, role, status, assistant_id")
              .eq("id", session.user.id)
              .single();
            if (error) throw error;
            if (data.status === "pending" || data.status === "rejected") {
              await supabase.auth.signOut();
              setIsLoggedIn(false);
              setLoggedInUser(null);
              toast({
                variant: "destructive",
                title: "Access Denied",
                description: "Please wait until your account is approved by an admin",
              });
              router.push("/login?error=account_pending");
            } else {
              setIsLoggedIn(true);
              setLoggedInUser(data);
            }
          } catch (error) {
            console.error("Error fetching user:", error);
            setIsLoggedIn(false);
            setLoggedInUser(null);
            toast({
              variant: "destructive",
              title: "Access Denied",
              description: "User not found. Please contact support.",
            });
            router.push("/login?error=user_not_found");
          }
        } else {
          setIsLoggedIn(false);
          setLoggedInUser(null);
          if (pathname !== "/login") {
            router.push("/login");
          }
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [pathname, router, toast]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      // Clear local storage explicitly
      localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}-auth-token`);
      // Clear cookies if used
      document.cookie = `sb-${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;

      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setIsLoggedIn(false);
      setLoggedInUser(null);
      // Use full page redirect to ensure fresh state
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-background border-b border-border/30 py-2 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-medium text-lg">
          Sagan Command Center
        </Link>
        <div className="flex items-center">
          <div className="flex space-x-1 mr-4">
            {isLoggedIn && loggedInUser?.role === "admin" && (
              <>
                {adminMenu.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center",
                      pathname === item.href && "bg-accent text-accent-foreground"
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                ))}
              </>
            )}
            {isLoggedIn && loggedInUser?.role === "executive" && (
              <>
                {privateMenuItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center",
                      pathname === item.href && "bg-accent text-accent-foreground"
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                ))}
              </>
            )}
            {isLoggedIn && loggedInUser?.role === "assistant" && (
              <>
                {privateAssistantItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "flex items-center",
                      pathname === item.href && "bg-accent text-accent-foreground"
                    )}
                    asChild
                  >
                    <Link href={item.href}>
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </Button>
                ))}
              </>
            )}
          </div>
          {isLoggedIn && loggedInUser?.role ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center mx-2"
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center mx-2"
            >
              <Link href="/login" className="flex justify-center items-center">
                <LogIn className="h-4 w-4 mr-1" />
                <span>Login / Signup</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;