import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useAllUserTags } from '@/app/hooks/useAllUserTags';
import type { PaperTag } from '@/app/types/types';

export function usePaperTags(paperId: string) {
  const [tags, setTags] = useState<PaperTag[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { tagColors, invalidateCache } = useAllUserTags();

  useEffect(() => {
    if (!user || !paperId) {
      setTags([]);
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchPaperTags() {
      try {
        const response = await fetch(`/api/paper-tags?userId=${user.uid}&paperId=${paperId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setTags(data.tags);
        }
      } catch (error) {
        console.error('Error fetching paper tags:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPaperTags();
    return () => {
      isMounted = false;
    };
  }, [paperId, user]);

  const addTag = async (name: string) => {
    if (!user) return;

    try {
      const response = await fetch('/api/paper-tags/manage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          paperId,
          name,
          existingColor: tagColors[name],
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add tag');
      }

      const data = await response.json();
      setTags(prev => [...prev, data.tag].sort((a, b) => b.createdAt - a.createdAt));
      invalidateCache();
    } catch (error) {
      console.error('Error adding tag:', error);
      throw error instanceof Error ? error : new Error('Failed to add tag. Please try again.');
    }
  };

  const removeTag = async (tagId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/paper-tags/manage?tagId=${tagId}&userId=${user.uid}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove tag');
      }

      setTags(prev => prev.filter(tag => tag.id !== tagId));
      invalidateCache();
    } catch (error) {
      console.error('Error removing tag:', error);
      throw new Error('Failed to remove tag. Please try again.');
    }
  };

  return {
    tags,
    loading,
    addTag,
    removeTag,
  };
}