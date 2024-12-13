'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { PaperCard } from '@/app/components/PaperCard';
import { useAuth } from '@/app/contexts/AuthContext';
import type { Paper } from '@/app/types/types';

interface ReadingListProps {
  onPaperSelect: (paper: Paper) => void;
  selectedPaperId?: string;
}

export function ReadingList({ onPaperSelect, selectedPaperId }: ReadingListProps) {
  const { user } = useAuth();
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPapers([]);
      setLoading(false);
      return;
    }

    async function fetchReadingList() {
      try {
        const response = await fetch(`/api/reading-list?userId=${user.uid}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPapers(data.papers);
      } catch (error) {
        console.error('Error fetching reading list:', error);
        setError('Failed to fetch reading list. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    fetchReadingList();
  }, [user]);

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {papers.length === 0 ? (
        <p className="text-gray-600">No papers in reading list</p>
      ) : (
        <div className="space-y-4">
          {papers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              onSelect={() => onPaperSelect(paper)}
              isSelected={paper.id === selectedPaperId}
            />
          ))}
        </div>
      )}
    </div>
  );
}