'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { checkSession, signOut } from './navbar-actions';
import { createBrowserClient } from '@supabase/ssr';

const adminMenu = [
  { href: '/admin', icon: <Mic className="h-4 w-4 mr-1" />, label: 'Dashboard' },
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
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([
  ]);
  const { toast } = useToast();
  const notificationRef = useRef(null);
  const bellRef = useRef(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  useEffect(() => {
  if (!isLoggedIn || !loggedInUser?.id) return;

  async function fetchInitial() {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('recipient_id', loggedInUser.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data);
    }
  }
  fetchInitial();
}, [isLoggedIn, loggedInUser?.id]);

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

        // Only block rejected users, allow pending users
        if (user.status === 'rejected') {
          await signOut();
          setIsLoggedIn(false);
          setLoggedInUser(null);
          toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: 'Your account has been rejected. Please contact support.',
          });
          router.push('/login?error=account_rejected');
        } else {
          setIsLoggedIn(true);
          setLoggedInUser(user);
          console.log(user);
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

       if (!isLoggedIn || !loggedInUser?.id) return;

    const channel = supabase
  .channel('notifications-channel')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `recipient_id=eq.${loggedInUser.id}`,
    },
    (payload) => {
      const newNotification = payload.new;
      setNotifications((prev) => [
        ...prev,
        {
          id: newNotification.id,
          message: newNotification.message,
          title: newNotification.title,
          seen: newNotification.seen,
        },
      ]);
    }
  )
  .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
          'flex items-center justify-start text-left font-medium transition-all',
          pathname === item.href
            ? 'bg-brand-purple/10 text-brand-purple hover:bg-brand-purple/20'
            : 'text-gray-700 hover:bg-gray-100 hover:text-brand-purple'
        )}
        asChild
      >
        <Link href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
          {item.icon}
          <span>{item.label}</span>
        </Link>
      </Button>
    ));

  useEffect(() => {
    if (!isNotificationOpen) return;

    function handleClickOutside(event) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target) &&
        bellRef.current &&
        !bellRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotificationOpen]);

  return (
    <nav className="bg-white/95 border-b border-gray-200 shadow-sm backdrop-blur-lg fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-purple to-brand-blue rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent hidden sm:block">
              Sagan Command Center
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent sm:hidden">
              Sagan
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-1">
              {isLoggedIn && loggedInUser?.admin == true && renderMenuItems(adminMenu)}
              {isLoggedIn && loggedInUser?.role === 'executive' && renderMenuItems(privateMenuItems)}
              {isLoggedIn && loggedInUser?.role === 'assistant' && renderMenuItems(privateAssistantItems)}
            </div>

            {/* Notification Button - Only for logged in users */}
            {isLoggedIn && (
              <Button
                ref={bellRef}
                variant="ghost"
                size="icon"
                className="relative hover:bg-brand-purple/10 hover:text-brand-purple transition-colors"
                onClick={() => setIsNotificationOpen((open) => !open)}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {notifications.filter((n) => !n.seen).length > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg">
                    {notifications.filter((n) => !n.seen).length}
                  </span>
                )}
              </Button>
            )}

            {/* Desktop Login/Logout Button */}
            <div className="hidden md:flex">
              {isLoggedIn && loggedInUser?.role ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center gap-1 hover:bg-red-50 hover:text-red-600 transition-colors"
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-4 w-4" />
                  <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                </Button>
              ) : (
                <Link href="/login">
                  <Button className="flex items-center gap-2 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90 text-white shadow-md hover:shadow-lg transition-all">
                    <LogIn className="h-4 w-4" />
                    <span>Get Started</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile Hamburger Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden hover:bg-brand-purple/10"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col space-y-1">
              {isLoggedIn && loggedInUser?.admin == true && renderMenuItems(adminMenu)}
              {isLoggedIn && loggedInUser?.role === 'executive' && renderMenuItems(privateMenuItems)}
              {isLoggedIn && loggedInUser?.role === 'assistant' && renderMenuItems(privateAssistantItems)}

              <div className="pt-2 mt-2 border-t border-gray-200">
                {isLoggedIn && loggedInUser?.role ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full flex items-center justify-start gap-1 hover:bg-red-50 hover:text-red-600 transition-colors"
                    disabled={isLoggingOut}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                  </Button>
                ) : (
                  <Link href="/login" className="block" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple/90 hover:to-brand-blue/90 text-white shadow-md">
                      <LogIn className="h-4 w-4" />
                      <span>Get Started</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Notification Dropdown - Only for logged in users */}
      {isLoggedIn && isNotificationOpen && (
        <div
          ref={notificationRef}
          className="absolute right-4 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-brand-purple to-brand-blue px-4 py-3 flex items-center justify-between">
            <h3 className="font-semibold text-white text-lg">Notifications</h3>
            {notifications.filter((n) => !n.seen).length > 0 && (
              <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
                {notifications.filter((n) => !n.seen).length} new
              </span>
            )}
          </div>
          <ul className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="p-8 text-center">
                <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500 font-medium">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">We'll notify you when something arrives</p>
              </li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    'p-4 border-b border-gray-100 last:border-b-0 cursor-pointer transition-all hover:bg-gradient-to-r hover:from-brand-purple/5 hover:to-brand-blue/5',
                    !n.seen && 'bg-brand-purple/5 border-l-4 border-l-brand-purple'
                  )}
                  onClick={async () => {
                    setIsNotificationOpen(false);
                    await fetch('/api/notifications/markAsSeen', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ notificationId: n.id, userId: loggedInUser?.id }),
                    });
                    setNotifications((prev) =>
                      prev.map((noti) => (noti.id === n.id ? { ...noti, seen: true } : noti))
                    );
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-brand-purple flex-shrink-0" style={{ opacity: n.seen ? 0 : 1 }}></div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm mb-1', !n.seen ? 'font-semibold text-gray-900' : 'text-gray-700')}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">{n.message}</p>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
          {notifications.length > 0 && (
            <div className="bg-gray-50 px-4 py-2 text-center border-t border-gray-200">
              <button className="text-sm font-medium text-brand-purple hover:text-brand-blue transition-colors">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;