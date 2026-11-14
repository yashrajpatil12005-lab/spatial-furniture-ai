'use client';

import { useEffect, useState } from 'react';
import {
  getAnalyticsEvents,
  AnalyticsEvent,
} from '@/lib/analytics';

type EventRecord = AnalyticsEvent & { id: string };

function countBy(
  events: EventRecord[],
  key: 'pagePath' | 'productName' | 'category'
) {
  const counts: Record<string, number> = {};

  events.forEach((event) => {
    const value = event[key];
    if (value) counts[value] = (counts[value] || 0) + 1;
  });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}

export default function AdminAnalytics() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    getAnalyticsEvents()
      .then((data) => {
        if (active) setEvents(data);
      })
      .catch((err) => {
        console.error('Analytics loading error:', err);
        if (active) setError('Unable to load analytics. Check Firestore rules.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const pageEvents = events.filter((e) => e.eventType === 'page_view');
  const productEvents = events.filter((e) => e.eventType === 'product_view');

  const uniqueCustomers = new Set(events.map((e) => e.userId)).size;
  const popularProducts = countBy(productEvents, 'productName');
  const popularPages = countBy(pageEvents, 'pagePath');
  const popularCategories = countBy(productEvents, 'category');

  const cards = [
    { label: 'Customer Visitors', value: uniqueCustomers },
    { label: 'Total Page Visits', value: pageEvents.length },
    { label: 'Product Views', value: productEvents.length },
    { label: 'Tracked Events', value: events.length },
  ];

  const renderList = (items: [string, number][]) => (
    <div className="space-y-4">
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No activity recorded yet.</p>
      ) : items.map(([name, count]) => {
        const max = items[0][1] || 1;
        return (
          <div key={name}>
            <div className="flex justify-between gap-3 text-sm mb-2">
              <span className="font-medium text-slate-700 break-all">{name}</span>
              <span className="font-bold text-slate-900">{count}</span>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-7">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          Customer Analytics
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Understand customer visits and furniture interests.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading analytics...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => (
              <div key={card.label} className="rounded-xl bg-slate-50 border border-slate-100 p-5">
                <p className="text-xs text-slate-500">{card.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {card.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-slate-900 mb-5">
                Most Viewed Products
              </h3>
              {renderList(popularProducts)}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-5">
                Most Visited Pages
              </h3>
              {renderList(popularPages)}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-5">
                Popular Furniture Categories
              </h3>
              {renderList(popularCategories)}
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-5">
                Analytics Information
              </h3>
              <p className="text-sm text-slate-600 leading-7">
                Unique customers are counted by Firebase user ID.
                Analytics are based on the latest 2,000 recorded events.
                Only authenticated customer activity is tracked.
              </p>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
