'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/firebase/AuthContext';
import { trackPageView } from '@/lib/analytics';

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const { user, userData, loading } = useAuth();

  useEffect(() => {
    if (loading || !user || userData?.role !== 'customer') return;
    if (!pathname || pathname.startsWith('/admin')) return;

    void trackPageView(user.uid, pathname);
  }, [pathname, user, userData?.role, loading]);

  return null;
}
