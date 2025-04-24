// hooks/useTabActivity.js
'use client';

import { useEffect, useRef } from 'react';
import { checkSession } from '@/lib/supabase';

export function useTabActivity(inactivityThreshold = 3600) {
  const lastActiveRef = useRef(Date.now() / 1000); // Store last active time in seconds

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const currentTime = Date.now() / 1000;
        const timeElapsed = currentTime - lastActiveRef.current;

        // Check if the tab was inactive for more than the threshold (e.g., 1 hour)
        if (timeElapsed > inactivityThreshold) {
          console.log('Tab reactivated after inactivity, checking session...');
          const session = await checkSession();

          // If no session or invalid session, reload the page
          if (!session) {
            console.log('No valid session found, reloading page...');
            window.location.reload();
          } else {
            console.log('Valid session found, no reload needed.');
          }
        }

        // Update last active time
        lastActiveRef.current = currentTime;
      }
    };

    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup on component unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [inactivityThreshold]);
}