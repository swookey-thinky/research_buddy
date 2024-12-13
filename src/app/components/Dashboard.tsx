'use client';

import React, { useState } from 'react';
import { BookOpen, Loader2, Github, Sparkles, Newspaper, List, Search } from 'lucide-react';
import { useArxivPapers } from '@/app/hooks/useArxivPapers';
import { PaperCard } from '@/app/components/PaperCard';
import { UserMenu } from '@/app/components/UserMenu';
import { LoginButton } from '@/app/components/LoginButton';
import { DatePicker } from '@/app/components/DatePicker';
import { QueryPicker } from '@/app/components/QueryPicker';
import { TagFilter } from '@/app/components/TagFilter';
import { PaperSidebar } from '@/app/components/PaperSidebar';
import { KeywordSearch } from '@/app/components/KeywordSearch';
import { TitleSearch } from '@/app/components/TitleSearch';
import { useArxivQueries } from '@/app/hooks/useArxivQueries';
import { useAuth } from '@/app/contexts/AuthContext';
import { useFilteredPapers } from '@/app/hooks/useFilteredPapers';
import { ReadingList } from '@/app/components/ReadingList';
import { HuggingFace } from '@/app/components/HuggingFace';
import { Digest } from '@/app/components/Digest';
import type { Paper } from '@/app/types/types';

type Tab = 'papers' | 'reading-list' | 'hugging-face' | 'digest';

export function Dashboard() {
  const { user } = useAuth();
  const { defaultQuery } = useArxivQueries();
  const [currentQuery, setCurrentQuery] = useState(defaultQuery);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [currentTab, setCurrentTab] = useState<Tab>('papers');

  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    date.setUTCHours(0, 0, 0, 0);
    return date;
  });

  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setUTCHours(23, 59, 59, 999);
    return date;
  });

  const { papers, loading: papersLoading, error: papersError } = useArxivPapers(startDate, endDate, currentQuery);
  const { filteredPapers, loading: filterLoading } = useFilteredPapers(papers, selectedTag);

  const loading = papersLoading || filterLoading;
  const error = papersError;

  const handleQueryChange = (query: string) => {
    setCurrentQuery(query);
    setSelectedTag(null);
  };

  const handleTagSelect = (tag: string | null) => {
    setSelectedTag(tag);
    setCurrentQuery(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center max-w-xl mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-6">
            <BookOpen className="w-12 h-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Research Buddy</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8">
            Sign in to track and triage the latest research papers from ArXiv
          </p>
          <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
            <p className="text-sm text-gray-600 mb-4">
              <strong className="text-gray-800">Note about signing in:</strong> An account is only needed to save tags,
              create reading lists, and store custom search queries.
            </p>
            <p className="text-sm text-gray-600">
              <strong className="text-gray-800">Privacy commitment:</strong> We will never sell your information
              or use your email address to contact you.
            </p>
          </div>
          <LoginButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-16 bg-white shadow-lg flex flex-col items-center py-4 space-y-8">
          <button
            onClick={() => setCurrentTab('papers')}
            className={`p-3 rounded-xl transition-colors ${
              currentTab === 'papers'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Search"
          >
            <Search className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentTab('reading-list')}
            className={`p-3 rounded-xl transition-colors ${
              currentTab === 'reading-list'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Reading List"
          >
            <List className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentTab('hugging-face')}
            className={`p-3 rounded-xl transition-colors ${
              currentTab === 'hugging-face'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Hugging Face"
          >
            <Sparkles className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCurrentTab('digest')}
            className={`p-3 rounded-xl transition-colors ${
              currentTab === 'digest'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="Digest"
          >
            <Newspaper className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="ml-2 pr-4 pb-8">
            <header className="flex flex-col mb-8">
              <div className="flex items-center justify-between mb-4 bg-blue-200/40 backdrop-blur-sm px-6 py-4 rounded-lg shadow-sm">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-12 h-12 text-blue-600" />
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">Research Buddy</h1>
                    <div className="space-y-1">
                      <p className="text-xl text-gray-600">
                        Track and Triage the Latest Research Papers on ArXiv
                      </p>
                      <a
                        href="https://github.com/swookey-thinky/research_buddy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                      >
                        <Github className="w-4 h-4" />
                        View source code on GitHub
                      </a>
                    </div>
                  </div>
                </div>
                <UserMenu />
              </div>

              {/* Section Title */}
              {currentTab === 'papers' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Search</h2>
                  </div>
                  <p className="text-gray-600">
                    Search and filter through the latest research papers from ArXiv
                  </p>
                </div>
              ) : currentTab === 'reading-list' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <List className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Reading List</h2>
                  </div>
                  <p className="text-gray-600">
                    Access your saved papers and manage your reading list
                  </p>
                </div>
              ) : currentTab === 'hugging-face' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Hugging Face</h2>
                  </div>
                  <p className="text-gray-600">
                    Browse the latest machine learning papers from Hugging Face's daily paper listings at huggingface.co/papers
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-blue-600" />
                    <h2 className="text-xl font-semibold text-gray-900">Digest</h2>
                  </div>
                  <p className="text-gray-600">
                    View daily research digests based on your search criteria
                  </p>
                </div>
              )}
            </header>

            {/* Content based on selected tab */}
            {currentTab === 'papers' ? (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1 space-y-6">
                  <TagFilter
                    selectedTag={selectedTag}
                    onTagSelect={handleTagSelect}
                  />
                  <QueryPicker
                    currentQuery={currentQuery}
                    onQueryChange={handleQueryChange}
                  />
                  <TitleSearch
                    onPaperSelect={setSelectedPaper}
                    selectedPaperId={selectedPaper?.id}
                  />
                  <KeywordSearch
                    onPaperSelect={setSelectedPaper}
                    selectedPaperId={selectedPaper?.id}
                  />
                </div>
                <div className="lg:col-span-3">
                  {error && (
                    <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg mb-6">
                      <p className="font-semibold">Error loading papers</p>
                      <p className="text-sm mt-1">{error}</p>
                    </div>
                  )}

                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  ) : filteredPapers.length > 0 ? (
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="inline-block bg-white px-4 py-2 rounded-full shadow-sm">
                          <span className="font-medium text-gray-700">
                            {filteredPapers.length} paper{filteredPapers.length === 1 ? '' : 's'} found
                          </span>
                        </div>
                      </div>
                      <div className="space-y-6">
                        {filteredPapers.map((paper) => (
                          <PaperCard
                            key={paper.id}
                            paper={paper}
                            onSelect={() => setSelectedPaper(paper)}
                            isSelected={paper.id === selectedPaper?.id}
                          />
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-600 bg-white p-8 rounded-lg shadow">
                      <p className="text-lg font-medium">No papers found</p>
                      <p className="mt-2">Try adjusting your search criteria or date range</p>
                    </div>
                  )}
                </div>
              </div>
            ) : currentTab === 'reading-list' ? (
              <ReadingList
                onPaperSelect={setSelectedPaper}
                selectedPaperId={selectedPaper?.id}
              />
            ) : currentTab === 'hugging-face' ? (
              <HuggingFace
                onPaperSelect={setSelectedPaper}
                selectedPaperId={selectedPaper?.id}
              />
            ) : (
              <Digest
                onPaperSelect={setSelectedPaper}
                selectedPaperId={selectedPaper?.id}
              />
            )}
          </div>
        </div>

        <PaperSidebar
          paper={selectedPaper}
          onClose={() => setSelectedPaper(null)}
        />
      </div>
    </div>
  );
}
