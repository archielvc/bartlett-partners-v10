import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { getAllContactSubmissions } from '../../utils/database';

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    
    // Poll for new submissions every 30 seconds (reduced from 2 seconds to prevent database spam)
    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const submissions = await getAllContactSubmissions();
      // Count submissions from last 24 hours that haven't been marked as read
      const recent = submissions.filter(s => {
        // Only count 'new' status
        return s.status === 'new';
      });
      setUnreadCount(recent.length);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  if (unreadCount === 0) return null;

  return (
    <div className="relative inline-flex ml-auto">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
        {unreadCount > 9 ? '9+' : unreadCount}
      </span>
    </div>
  );
}