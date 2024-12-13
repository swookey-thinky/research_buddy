import { useState, useEffect } from 'react';
import type { Paper } from '@/app/types/types';

export function useArxivPapers(startDate: Date, endDate: Date, query: string) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPapers = async () => {
      try {
        setLoading(true);
        setError(null);

        const startStr = startDate.toISOString().split('T')[0].replace(/-/g, '');
        const endStr = endDate.toISOString().split('T')[0].replace(/-/g, '');

        const params = new URLSearchParams({
          query,
          startDate: startStr,
          endDate: endStr,
          max_results: '1000',
        });

        const response = await fetch(`/api/papers/date-search?${params}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Failed to fetch papers');
        }

        const data = await response.json();
        setPapers(data.papers);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        console.error('ArXiv API Error:', err);
        setError(
          err instanceof Error
            ? `Failed to fetch papers: ${err.message}`
            : 'Failed to fetch papers from arXiv'
        );
        setPapers([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchPapers, 100);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [startDate, endDate, query]);

  return { papers, loading, error };
}