'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic,
  ListChecks,
  ClipboardList,
  BookOpen,
  Settings,
  LogIn,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { checkSession, signOut } from './navbar-actions';

const adminMenu = [
  { href: '/admin', icon: <Mic className="h-4 w-4 mr-1" />, label: 'Dashboard' },
  // { href: '/voice', icon: <Mic className="h-4 w-4 mr-1" />, label: 'Voice Input' },
  // { href: '/projects', icon: <ListChecks className="h-4 w-4 mr-1" />, label: 'Project Board' },
  // { href: '/reports', icon: <ClipboardList className="h-4 w-4 mr-1" />, label: 'Reports' },
  // { href: '/attachments', icon: <BookOpen className="h-4 w-4 mr-1" />, label: 'Reference' },
  // { href: '/settings', icon: <Settings className="h-4 w-4 mr-1" />, label: 'Settings' },
];

const privateMenuItems = [
  { href: '/voice', icon: <Mic className="h-4 w-4 mr-1" />, label: 'Voice Input' },
  { href: '/projects', icon: <ListChecks className="h-4 w-4 mr-1" />, label: 'Project Board' },
  { href: '/reports', icon: <ClipboardList className="h-4 w-4 mr-1" />, label: 'Reports' },
  { href: '/attachments', icon: <BookOpen className="h-4 w-4 mr-1" />, label: 'Reference' },
  { href: '/settings', icon: <Settings className="h-4 w-4 mr-1" />, label: 'Settings' },
];

const privateAssistantItems = [
  { href: '/projects', icon: <ListChecks className="h-4 w-4 mr-1" />, label: 'Project Board' },
  { href: '/reports', icon: <ClipboardList className="h-4 w-4 mr-1" />, label: 'Reports' },
  { href: '/attachments', icon: <BookOpen className="h-4 w-4 mr-1" />, label: 'Reference' },
];

const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { session, user } = await checkSession();
        console.log('Initial session check:', session ? 'Found' : 'Missing');
        if (!session || !user) {
          setIsLoggedIn(false);
          setLoggedInUser(null);
          return;
        }

        if (user.status === 'pending' || user.status === 'rejected') {
          await signOut();
          setIsLoggedIn(false);
          setLoggedInUser(null);
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'Please wait until your account is approved by an admin',
          });
          router.push('/login?error=account_pending');
        } else {
          setIsLoggedIn(true);
          setLoggedInUser(user);
          console.log(user)
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoggedIn(false);
        setLoggedInUser(null);
        toast({
          variant: 'destructive',
          title: 'Access Denied',
          description: 'Authentication error. Please log in again.',
        });
        router.push('/login');
      }
    };

    checkUserSession();
  }, [pathname, router, toast]);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      localStorage.removeItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID}-auth-token`);
      await signOut();
      setIsLoggedIn(false);
      setLoggedInUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: 'Logout Failed',
        description: 'Failed to log out. Please try again.',
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const renderMenuItems = (items) =>
    items.map((item) => (
      <Button
        key={item.href}
        variant="ghost"
        size="sm"
        className={cn(
          'flex items-center w-full justify-start text-left',
          pathname === item.href && 'bg-accent text-accent-foreground'
        )}
        asChild
      >
        <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
          {item.icon}
          <span>{item.label}</span>
        </Link>
      </Button>
    ));

  return (
    <nav className="bg-white/80 border-b border-border/30 py-4 px-6 backdrop-blur-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className=" text-2xl font-semibold">
          Sagan Command Center
        </Link>
        <div className="flex items-center">
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-1 mr-4">
            {isLoggedIn && loggedInUser?.admin == true && renderMenuItems(adminMenu)}
            {isLoggedIn && loggedInUser?.role === 'executive' && renderMenuItems(privateMenuItems)}
            {isLoggedIn && loggedInUser?.role === 'assistant' && renderMenuItems(privateAssistantItems)}
          </div>
          {/* Desktop Login/Logout Button */}
          <div className="hidden md:flex">
            {isLoggedIn && loggedInUser?.role ? (
              <Button
                variant="default"
                size="lg"
                onClick={handleLogout}
                className="flex items-center mx-2"
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </Button>
            ) : (
              <Button variant="default" size="lg" className="flex items-center mx-2">
                <Link href="/login" className="flex justify-center items-center">
                  <LogIn className="h-4 w-4 mr-1" />
                  <span>Login / Signup</span>
                </Link>
              </Button>
            )}
          </div>
          {/* Mobile Hamburger Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border/30 py-4 px-4">
          <div className="flex flex-col space-y-2">
            {isLoggedIn && loggedInUser?.role === 'admin' && renderMenuItems(adminMenu)}
            {isLoggedIn && loggedInUser?.role === 'executive' && renderMenuItems(privateMenuItems)}
            {isLoggedIn && loggedInUser?.role === 'assistant' && renderMenuItems(privateAssistantItems)}
            {isLoggedIn && loggedInUser?.role ? (
              <Button
                variant="default"
                size="lg"
                onClick={handleLogout}
                className="flex items-center justify-start "
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4 mr-1" />
                <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </Button>
            ) : (
              <Button variant="default" size="lg" className="flex items-center justify-start ">
                <Link
                  href="/login"
                  className="flex justify-center items-center w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  <span>Login / Signup</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;