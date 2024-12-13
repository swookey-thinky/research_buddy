import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import type { Paper } from '@/app/types/types';

export function useFilteredPapers(papers: Paper[], selectedTag: string | null) {
  const [filteredPapers, setFilteredPapers] = useState<Paper[]>(papers);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (!selectedTag) {
      setFilteredPapers(papers);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    async function filterPapers() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/papers/by-tag?userId=${user.uid}&tagName=${selectedTag}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const taggedPaperIds = new Set(data.paperIds);

        if (isMounted) {
          const papersWithTag = papers.filter(paper => taggedPaperIds.has(paper.id));
          const missingPaperIds = Array.from(taggedPaperIds)
            .filter(id => !papers.some(p => p.id === id));

          const additionalPapers = await Promise.all(
            missingPaperIds.map(async (paperId) => {
              try {
                const response = await fetch(`/api/papers/${paperId}`, {
                  signal: controller.signal
                });
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                return await response.json();
              } catch (error) {
                if (error instanceof Error && error.name === 'AbortError') {
                  throw error;
                }
                console.error('Error fetching paper:', error);
                return null;
              }
            })
          );

          const validAdditionalPapers = additionalPapers.filter((p): p is Paper => p !== null);
          setFilteredPapers([...papersWithTag, ...validAdditionalPapers]);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('Error filtering papers:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    filterPapers();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [papers, selectedTag, user]);

  return { filteredPapers, loading };
}