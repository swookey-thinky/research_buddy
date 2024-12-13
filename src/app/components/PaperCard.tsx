'use client';

import React, { useState, useEffect } from 'react';
import { BookmarkPlus, BookmarkCheck, ExternalLink, BookOpen, Tag, Users } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import type { Paper } from '@/app/types/types';
import { PaperTags } from '@/app/components/PaperTags';

interface PaperCardProps {
  paper: Paper;
  onSelect: () => void;
  isSelected: boolean;
}

export function PaperCard({ paper, onSelect, isSelected }: PaperCardProps) {
  const { user } = useAuth();
  const [isInReadingList, setIsInReadingList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatPublishedDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toUTCString().split(' ').slice(1, 4).join(' ');
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    async function checkReadingListStatus() {
      try {
        const response = await fetch(`/api/reading-list/paper?userId=${user.uid}&paperId=${paper.id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setIsInReadingList(data.isInReadingList);
      } catch (error) {
        console.error('Error checking reading list status:', error);
      }
    }

    checkReadingListStatus();
  }, [user, paper.id]);

  const toggleReadingList = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/reading-list/paper', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          paperId: paper.id,
          action: isInReadingList ? 'remove' : 'add'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsInReadingList(!isInReadingList);
    } catch (error) {
      console.error('Error toggling reading list:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.external-link-btn, .paper-tags, .reading-list-btn')) {
      return;
    }
    onSelect();
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-xl shadow-lg p-6 max-w-4xl transition-all hover:shadow-xl cursor-pointer group relative ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-xl font-bold text-gray-800 flex-1 group-hover:text-blue-600 transition-colors">
          {paper.title}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleReadingList}
            disabled={isLoading || !user}
            className={`reading-list-btn p-1.5 rounded-full transition-colors ${
              isInReadingList
                ? 'text-blue-600 hover:text-blue-700'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title={isInReadingList ? 'Remove from Reading List' : 'Add to Reading List'}
          >
            {isInReadingList ? (
              <BookmarkCheck className="w-5 h-5 fill-current" />
            ) : (
              <BookmarkPlus className="w-5 h-5" />
            )}
          </button>
          <a
            href={paper.link}
            target="_blank"
            rel="noopener noreferrer"
            className="external-link-btn p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <BookOpen className="w-4 h-4" />
          <span>{formatPublishedDate(paper.published)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Tag className="w-4 h-4" />
          <span>{paper.category}</span>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-1 text-sm text-gray-600">
        <Users className="w-4 h-4" />
        <p className="truncate">{paper.authors.join(', ')}</p>
      </div>

      <p className="mt-4 text-gray-600 line-clamp-3 group-hover:text-gray-700">
        {paper.summary}
      </p>

      <div className="paper-tags">
        <PaperTags paperId={paper.id} />
      </div>

      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-100 pointer-events-none transition-colors" />
    </div>
  );
}