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
  // const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null); // Adjust type based on your user schema
  const [authError, setAuthError] = useState(null);

 const { toast } = useToast();

  useEffect(() => {
    // Handle URL query parameters for errors
    // const error = searchParams.get("error");
    // if (error === "account_pending") {
    //   toast({
    //     variant: "destructive",
    //     title: "Access Denied",
    //     description: "Please wait until your account is approved by an admin",
    //   });
    //   // setAuthError("Please wait until your account is approved by an admin");
    //   setIsLoggedIn(false);
    //   setLoggedInUser(null);
    //   // Force client-side sign-out to clear stale session
    //   supabase.auth.signOut().then(() => {
    //     console.log("Client-side sign-out triggered due to pending/rejected status");
    //   });
    // } else if (error === "user_not_found") {
    //   toast({
    //     variant: "destructive",
    //     title: "Access Denied",
    //     description: "User not found. Please contact support.",
    //   });
    //   // setAuthError("User not found. Please contact support.");
    //   setIsLoggedIn(false);
    //   setLoggedInUser(null);
    // } else {
    //   setAuthError(null); // Clear error if no relevant query param
    // }

    // Initial session check
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
          // setAuthError("Please wait until your account is approved by an admin");
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
        // setAuthError("Authentication error. Please log in again.");
        router.push("/login");
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth event:", event, "Session:", session ? "Found" : "Missing");
        if (event === "SIGNED_OUT") {
          setIsLoggedIn(false);
          setLoggedInUser(null);
          setAuthError(null); // Clear error on manual sign-out
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
              // setAuthError("Please wait until your account is approved by an admin");
              router.push("/login?error=account_pending");
            } else {
              setIsLoggedIn(true);
              setLoggedInUser(data);
              setAuthError(null);
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
            // setAuthError("User data error. Please log in again.");
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
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setIsLoggedIn(false);
      setLoggedInUser(null);
      setAuthError(null);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Failed to log out. Please try again.",
      });
      // setAuthError("Failed to log out. Please try again.");
    }
  };

  return (
    <nav className="bg-background border-b border-border/30 py-2 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-medium text-lg">
          Sagan Command Center
        </Link>
        <div className="flex items-center">
          {/* {authError && (
            <div className="text-red-500 mr-4">{authError}</div>
          )} */}
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
            >
              <LogOut className="h-4 w-4 mr-1" />
              <span>Logout</span>
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