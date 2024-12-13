import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/app/contexts/AuthContext';

export function useAllUserTags() {
  const queryClient = useQueryClient();
  const { user } = useAuth();


  const {
    data: allUserTags = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ['userTags', user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];

      const params = new URLSearchParams({
        userId: user.uid,
        type: 'all',
      });

      const response = await fetch(`/api/paper-tags?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      const data = await response.json();
      return data.tags || [];
    },
    enabled: !!user?.uid,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep unused data in cache for 30 minutes
  });

  // Create a map of tag names to their colors
  const tagColors = allUserTags.reduce((acc, tag) => {
    if (!acc[tag.name]) {
      acc[tag.name] = tag.color;
    }
    return acc;
  }, {});

  // Function to manually invalidate the cache
  const invalidateCache = () => {
    queryClient.invalidateQueries({ queryKey: ['userTags', user?.uid] });
  };

  return {
    allUserTags,
    tagColors,
    loading,
    error: error instanceof Error ? error.message : null,
    invalidateCache,
  };
}