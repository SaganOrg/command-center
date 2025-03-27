"use client";
import React, { useState, useEffect, useCallback } from "react";

import { createClient } from "@supabase/supabase-js";
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
import { supabase } from '@/lib/supabase'


const privateMenuItems = [
  {
    href: "/voice",
    icon: <Mic className="h-4 w-4 mr-1" />,
    label: "Voice Input",
  },
  {
    href: "/projects",
    icon: <ListChecks className="h-4 w-4 mr-1" />,
    label: "Project Board",
  },
  {
    href: "/reports",
    icon: <ClipboardList className="h-4 w-4 mr-1" />,
    label: "Reports",
  },
  {
    href: "/attachments",
    icon: <BookOpen className="h-4 w-4 mr-1" />,
    label: "Reference",
  },
  {
    href: "/settings",
    icon: <Settings className="h-4 w-4 mr-1" />,
    label: "Settings",
  },
];

const privateAssistantMenuItems =  [

  {
    href: "/projects",
    icon: <ListChecks className="h-4 w-4 mr-1" />,
    label: "Project Board",
  },
  {
    href: "/reports",
    icon: <ClipboardList className="h-4 w-4 mr-1" />,
    label: "Reports",
  },
  {
    href: "/attachments",
    icon: <BookOpen className="h-4 w-4 mr-1" />,
    label: "Reference",
  }
];

const Navbar = () => {
  const location = usePathname();
  const navigate = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(false);

  // Private menu items (visible only when logged in)
 

  // Check authentication state on mount and listen for changes if Supabase is available
  useEffect(() => {
    // Define async function
    const handleAuth = async () => {
      try {
        if (!supabase) {
          setIsLoggedIn(false);
          return;
        }
  
        // Check initial session
        const { data: { session } } = await supabase.auth.getSession();
        setIsLoggedIn(!!session);
        
        if (session) {
          const { data: publicUser, error: publicError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id);
          
            console.log(publicUser)
          
          
          if (publicError) throw publicError;
          setLoggedInUser(publicUser[0].role);
        }
  
        // Set up auth listener
        const { data: authListener } = await supabase.auth.onAuthStateChange(
          async (event, session) => {
            setIsLoggedIn(!!session);
            
            if (session) {
              const { data: publicUser, error: publicError } = await supabase
                .from("users")
                .select("*")
                .eq("id", session.user.id);
              
              console.log(publicUser)
              
              if (publicError) throw publicError;
              setLoggedInUser(publicUser[0].role);
            }
          }
        );
  
        // Cleanup
        return () => {
          authListener?.subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth handling error:", error);
      }
    };
  
    // Execute the async function
    handleAuth();
  }, [navigate]); // Added supabase as dependency since it's used in the effect

  const handleLogout = (async () => {
    if (!supabase) {
      navigate.push("/login");
      return;
    }
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error.message);
    } else {
      navigate.push("/login");
    }
  });
  
  const handleLogin = (() => {
    navigate.push("/login");
  });

  return (
    <nav className="bg-background border-b border-border/30 py-2 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="font-medium text-lg">
          Sagan Command Center
        </Link>
        <div className="flex items-center">
          <div className="flex space-x-1 mr-4">
            {/* Private menu items (visible only when logged in) */}
            {isLoggedIn && loggedInUser==="executive" &&
              privateMenuItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center",
                    location.pathname === item.href &&
                      "bg-accent text-accent-foreground"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}
              {isLoggedIn && loggedInUser==="assistant" &&
              privateAssistantMenuItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex items-center",
                    location.pathname === item.href &&
                      "bg-accent text-accent-foreground"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                </Button>
              ))}
          </div>
          {/* Public Login button (converts to Logout when logged in) */}
          <Button
            variant="outline"
            size="sm"
            onClick={isLoggedIn ? handleLogout : handleLogin}
            className="flex items-center mx-2"
          >
            {isLoggedIn ? (
              <>
                <LogOut className="h-4 w-4 mr-1" />
                <span>Logout</span>
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4 mr-1" />
                <span>Login / Signup</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
