import { useState, useEffect } from 'react';
import type { Paper } from '@/app/types/types';

export function useTitleSearch(searchTerm: string) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setPapers([]);
      return;
    }

    const controller = new AbortController();

    const searchPapers = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          query: searchTerm.trim(),
          max_results: '1000',
        });

        const response = await fetch(`/api/papers/search?${params}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Failed to search papers');
        }

        const data = await response.json();
        setPapers(data.papers);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        setError(err instanceof Error ? err.message : 'An error occurred');
        setPapers([]);
      } finally {
        setLoading(false);
      }
    };

    searchPapers();

    return () => {
      controller.abort();
    };
  }, [searchTerm]);

  return { papers, loading, error };
}