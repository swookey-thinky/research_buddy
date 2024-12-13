import { useState, useEffect } from 'react';
import type { Paper } from '@/app/types/types';

export function useHuggingFacePapers(date: Date) {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchPapers() {
      try {
        setLoading(true);
        setError(null);

        const dateStr = date.toISOString().split('T')[0];
        const params = new URLSearchParams({
          date: dateStr,
        });

        const response = await fetch(`/api/papers/huggingface?${params}`, {
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
        console.error('Error fetching papers:', err);
        setError('Failed to fetch papers. Please try again later.');
        setPapers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchPapers();

    return () => {
      controller.abort();
    };
  }, [date]);

  return { papers, loading, error };
}