import { useEffect, useState, useCallback, useRef } from 'react';
import { getAllContactSubmissions } from '../../utils/database';
import { enquiryEvents, type EnquiryEvent } from '../../utils/enquiryEvents';

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const loadUnreadCount = useCallback(async () => {
    try {
      const submissions = await getAllContactSubmissions();
      const newCount = submissions.filter(s => s.status === 'new').length;
      setUnreadCount(newCount);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  }, []);

  // Handle enquiry events for instant updates
  const handleEnquiryEvent = useCallback((event: EnquiryEvent) => {
    if (event.type === 'deleted' && event.previousStatus === 'new') {
      // Deleted a 'new' enquiry - decrement count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } else if (event.type === 'status-changed') {
      if (event.previousStatus === 'new' && event.newStatus !== 'new') {
        // Changed from 'new' to something else - decrement count
        setUnreadCount(prev => Math.max(0, prev - 1));
      } else if (event.previousStatus !== 'new' && event.newStatus === 'new') {
        // Changed to 'new' from something else - increment count
        setUnreadCount(prev => prev + 1);
      }
    }
  }, []);

  // Start/stop polling based on tab visibility
  const startPolling = useCallback(() => {
    if (intervalRef.current) return; // Already polling
    // Poll every 60 seconds for new external enquiries
    intervalRef.current = setInterval(loadUnreadCount, 60000);
  }, [loadUnreadCount]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Initial load
    loadUnreadCount();

    // Subscribe to enquiry events for instant updates
    const unsubscribe = enquiryEvents.subscribe(handleEnquiryEvent);

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Tab became visible - refresh immediately and start polling
        loadUnreadCount();
        startPolling();
      } else {
        // Tab hidden - stop polling to save resources
        stopPolling();
      }
    };

    // Start polling if tab is visible
    if (document.visibilityState === 'visible') {
      startPolling();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      unsubscribe();
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadUnreadCount, handleEnquiryEvent, startPolling, stopPolling]);

  if (unreadCount === 0) return null;

  return (
    <div className="relative inline-flex ml-auto">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    </div>
  );
}