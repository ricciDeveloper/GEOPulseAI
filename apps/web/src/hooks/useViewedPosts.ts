'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'geopulse:viewed_posts';

export interface UseViewedPostsReturn {
  /** Set of viewed article IDs (populated after hydration) */
  viewedIds: Set<string>;
  /** Returns true if the article has been viewed */
  isViewed: (id: string) => boolean;
  /** Marks an article as viewed and persists to localStorage */
  markAsViewed: (id: string) => void;
  /** Total number of viewed articles */
  viewedCount: number;
  /** Clears all viewed history */
  clearViewed: () => void;
  /** True after localStorage has been read (avoids SSR hydration mismatch) */
  isHydrated: boolean;
}

/**
 * Tracks which articles the user has viewed, persisting to localStorage.
 * SSR-safe: initialises with an empty set and hydrates after mount.
 */
export function useViewedPosts(): UseViewedPostsReturn {
  const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage after mount (client-only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setViewedIds(new Set(parsed));
        }
      }
    } catch {
      // Ignore corrupted localStorage data
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const markAsViewed = useCallback((id: string) => {
    setViewedIds(prev => {
      if (prev.has(id)) return prev; // No-op if already viewed

      const next = new Set(prev);
      next.add(id);

      // Persist asynchronously to avoid blocking the render
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        // Silently fail if localStorage is unavailable (private mode, quota exceeded)
      }

      return next;
    });
  }, []);

  const clearViewed = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Silent fail
    }
    setViewedIds(new Set());
  }, []);

  const isViewed = useCallback(
    (id: string) => viewedIds.has(id),
    [viewedIds]
  );

  return {
    viewedIds,
    isViewed,
    markAsViewed,
    viewedCount: viewedIds.size,
    clearViewed,
    isHydrated,
  };
}
