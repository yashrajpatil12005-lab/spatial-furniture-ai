'use client';

import React, { useEffect, useState, useRef, useSyncExternalStore } from 'react';

interface ARModelViewerProps {
  src?: string;
  alt?: string;
  className?: string;
}

const emptySubscribe = () => () => {};

export default function ARModelViewer({
  src = '/models/arm_chair.glb',
  alt = '3D chair model',
  className = '',
}: ARModelViewerProps) {
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [libraryLoaded, setLibraryLoaded] = useState(false);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const viewerRef = useRef<HTMLElement | null>(null);

  // Dynamically load @google/model-viewer on client
  useEffect(() => {
    if (!isMounted) return;

    let isSubscribed = true;

    import('@google/model-viewer')
      .then(() => {
        if (isSubscribed) {
          setLibraryLoaded(true);
        }
      })
      .catch((err) => {
        console.error('Failed to load @google/model-viewer module:', err);
        if (isSubscribed) {
          setLoadError('Failed to initialize 3D viewer library. Please refresh.');
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [isMounted]);

  // Attach event listeners to model-viewer element for load, error, and progress
  useEffect(() => {
    if (!libraryLoaded) return;

    const el = viewerRef.current;
    if (!el) return;

    const handleLoad = () => {
      setModelLoaded(true);
      setLoadError(null);
    };

    const handleError = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      console.error('model-viewer loading error:', detail || e);
      setLoadError('Unable to load 3D model. Please verify the model file.');
    };

    const handleProgress = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (typeof detail?.totalProgress === 'number') {
        setLoadProgress(Math.round(detail.totalProgress * 100));
      }
    };

    el.addEventListener('load', handleLoad);
    el.addEventListener('error', handleError);
    el.addEventListener('progress', handleProgress);

    return () => {
      el.removeEventListener('load', handleLoad);
      el.removeEventListener('error', handleError);
      el.removeEventListener('progress', handleProgress);
    };
  }, [libraryLoaded]);

  const handleRetry = () => {
    setLoadError(null);
    setModelLoaded(false);
    setLoadProgress(0);
    const el = viewerRef.current;
    if (el) {
      // Force reload by reassigning src
      const currentSrc = el.getAttribute('src');
      el.removeAttribute('src');
      setTimeout(() => {
        if (currentSrc) el.setAttribute('src', currentSrc);
      }, 50);
    }
  };

  // SSR skeleton placeholder
  if (!isMounted || !libraryLoaded) {
    return (
      <div
        className={`w-full h-[420px] rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col items-center justify-center p-6 text-center ${className}`}
      >
        <div className="w-10 h-10 border-3 border-[#10B981] border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-[#111827]">Initializing 3D Viewer...</p>
        <p className="text-[11px] text-[#64748B] mt-1">Preparing WebXR spatial engine</p>
      </div>
    );
  }

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-[#E2E8F0] bg-[#F8FAFC] ${className}`}>
      {/* Loading overlay while GLB is downloading/parsing */}
      {!modelLoaded && !loadError && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#F8FAFC]/90 backdrop-blur-xs p-6 text-center">
          <div className="w-10 h-10 border-3 border-[#10B981] border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-[#111827]">Loading 3D Chair Model...</p>
          {loadProgress > 0 && (
            <p className="text-[11px] font-medium text-[#10B981] mt-1">{loadProgress}%</p>
          )}
        </div>
      )}

      {/* Error state */}
      {loadError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/95 p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-[#111827] mb-1">{loadError}</p>
          <button
            onClick={handleRetry}
            className="mt-3 px-3 py-1.5 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Google Model Viewer Web Component */}
      <model-viewer
        ref={viewerRef}
        src={src}
        alt={alt}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        style={{
          width: '100%',
          height: '420px',
          backgroundColor: '#F8FAFC',
          display: 'block',
        }}
      >
        {/* Native AR Launch Button slot */}
        <button
          slot="ar-button"
          className="absolute bottom-4 right-4 z-20 px-4 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
            />
          </svg>
          <span>View in Your Room (AR)</span>
        </button>

        {/* 3D Interaction Badge */}
        {modelLoaded && (
          <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full bg-white/80 backdrop-blur-xs border border-[#E2E8F0] text-[10px] font-medium text-[#475569] pointer-events-none select-none flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            <span>Interactive 3D • Drag to rotate • Pinch to zoom</span>
          </div>
        )}
      </model-viewer>
    </div>
  );
}
