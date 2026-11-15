
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore';

import { db } from '@/lib/firebase/config';
import { useAuth } from '@/lib/firebase/AuthContext';

interface RoomScan {
  id: string;
  customerId: string;
  imagePath: string;
  productId: string;
  productName: string;
  analysis: string;
  createdAt: Timestamp | null;
}

interface SignedImage {
  path: string;
  signedUrl: string;
}

export default function RoomScansGallery() {
  const { user } = useAuth();

  const [scans, setScans] = useState<RoomScan[]>([]);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const requestId = useRef(0);

  const loadRoomScans = useCallback(async () => {
    const currentRequest = ++requestId.current;

    if (!user) {
      setScans([]);
      setImageUrls({});
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);

      // Clear old signed URLs because they expire after five minutes.
      setImageUrls({});

      // Fetch the latest 100 room scans.
      const scansQuery = query(
        collection(db, 'room_scans'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );

      const snapshot = await getDocs(scansQuery);

      if (currentRequest !== requestId.current) return;

      const records: RoomScan[] = snapshot.docs.map((document) => {
        const data = document.data();

        return {
          id: document.id,
          customerId: data.customerId || '',
          imagePath: data.imagePath || '',
          productId: data.productId || '',
          productName: data.productName || 'Unknown product',
          analysis: data.analysis || 'No analysis available.',
          createdAt:
            data.createdAt instanceof Timestamp
              ? data.createdAt
              : null,
        };
      });

      setScans(records);

      const paths = [
        ...new Set(
          records
            .map((scan) => scan.imagePath)
            .filter(Boolean)
        ),
      ];

      if (paths.length === 0) {
        setImageUrls({});
        return;
      }

      // Generate fresh temporary URLs for private images.
      const token = await user.getIdToken();

      const response = await fetch('/api/room-scans/signed-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ paths }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || 'Unable to load room images.'
        );
      }

      if (currentRequest !== requestId.current) return;

      if (!Array.isArray(result.signedUrls)) {
        throw new Error('Invalid image URL response.');
      }

      const urlMap: Record<string, string> = {};

      (result.signedUrls as SignedImage[]).forEach((item) => {
        if (item.path && item.signedUrl) {
          urlMap[item.path] = item.signedUrl;
        }
      });

      setImageUrls(urlMap);
    } catch (err: unknown) {
      if (currentRequest !== requestId.current) return;

      console.error('[Room Scans Gallery]', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load customer room scans.'
      );
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [user]);

  useEffect(() => {
    loadRoomScans();

    return () => {
      requestId.current += 1;
    };
  }, [loadRoomScans]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRoomScans();
  };

  const formatDate = (timestamp: Timestamp | null) => {
    if (!timestamp) return 'Date unavailable';

    return timestamp.toDate().toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <section className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#111827]">
            Customer Room Scans
          </h2>

          <p className="mt-1 text-sm text-[#64748B]">
            View customer room photos and AI-generated room analysis.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="rounded-xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#111827] hover:bg-[#F8FAFC] disabled:opacity-50"
        >
          {refreshing ? 'Refreshing...' : 'Refresh scans'}
        </button>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-80 rounded-2xl bg-white border border-[#E2E8F0] animate-pulse"
            />
          ))}
        </div>
      ) : error ? (

        /* Error */
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p className="font-semibold">
            Unable to load room scans
          </p>

          <p className="mt-1">{error}</p>

          <button
            onClick={handleRefresh}
            className="mt-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : scans.length === 0 ? (

        /* Empty State */
        <div className="rounded-2xl border border-dashed border-[#CBD5E1] bg-white p-10 text-center">
          <div className="text-4xl mb-3">🏠</div>

          <h3 className="text-lg font-bold text-[#111827]">
            No room scans yet
          </h3>

          <p className="mt-2 text-sm text-[#64748B]">
            Customer room uploads will appear here after successful AI analysis.
          </p>
        </div>
      ) : (

        /* Room Scan Cards */
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#64748B]">
              Showing {scans.length} recent room scans
            </p>

            <span className="rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-semibold text-[#047857]">
              Private images
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {scans.map((scan) => (
              <article
                key={scan.id}
                className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-sm"
              >
                {/* Room Image */}
                <div className="aspect-[16/10] bg-[#F1F5F9]">
                  {imageUrls[scan.imagePath] ? (
                    <img
                      src={imageUrls[scan.imagePath]}
                      alt="Customer uploaded room"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-[#64748B]">
                      Image unavailable
                    </div>
                  )}
                </div>

                {/* Scan Information */}
                <div className="space-y-3 p-5">
                  <div>
                    <h3 className="font-bold text-[#111827]">
                      {scan.productName}
                    </h3>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Uploaded: {formatDate(scan.createdAt)}
                    </p>
                  </div>

                  {/* AI Analysis */}
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                      AI Room Analysis
                    </p>

                    <p className="text-sm leading-6 text-[#475569] whitespace-pre-wrap line-clamp-6">
                      {scan.analysis}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
