import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import type { SavedQuery } from '@/app/types/types';

const DEFAULT_QUERY = '(cat:cs.CL OR cat:cs.CV OR cat:cs.AI) AND (abs:"language model" OR abs:"LLM" OR abs:"MLLM" OR abs:"large language model" OR abs:"small language model")';

export function useArxivQueries() {
  const [queries, setQueries] = useState<SavedQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setQueries([]);
      setLoading(false);
      return;
    }

    const fetchQueries = async () => {
      try {
        const response = await fetch(`/api/arxiv-queries?userId=${user.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch queries');
        }
        const data = await response.json();
        setQueries(data.queries);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch queries');
        console.error('Error fetching queries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchQueries();
  }, [user]);

  const saveQuery = async (name: string, queryString: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/arxiv-queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          name,
          queryString,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save query');
      }

      const savedQuery = await response.json();
      setQueries(prev => [savedQuery, ...prev]);
    } catch (error) {
      console.error('Error saving query:', error);
      throw error;
    }
  };

  const deleteQuery = async (queryId: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/arxiv-queries', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          queryId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete query');
      }

      setQueries(prev => prev.filter(q => q.id !== queryId));
    } catch (error) {
      console.error('Error deleting query:', error);
      throw error;
    }
  };

  return {
    queries,
    loading,
    error,
    saveQuery,
    deleteQuery,
    defaultQuery: DEFAULT_QUERY,
  };
}