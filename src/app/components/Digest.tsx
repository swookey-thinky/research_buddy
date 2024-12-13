'use client';

import React, { useState, useEffect } from 'react';
import { TopicPicker } from '@/app/components/TopicPicker';
import { MessageSquare, Save, Loader2, Trash2, Pencil, Calendar, ChevronRight } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import type { Paper } from '@/app/types/types';
import { PaperCard } from '@/app/components/PaperCard';
import { SingleDatePicker } from '@/app/components/SingleDatePicker';

interface SavedDigest {
  id: string;
  name: string;
  topics: string;
  description: string;
  createdAt: number;
}

interface DigestProps {
  onPaperSelect: (paper: Paper) => void;
  selectedPaperId?: string;
}

export function Digest({ onPaperSelect, selectedPaperId }: DigestProps) {
  const { user } = useAuth();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNaming, setIsNaming] = useState(false);
  const [digestName, setDigestName] = useState('');
  const [savedDigests, setSavedDigests] = useState<SavedDigest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [digestResults, setDigestResults] = useState<Record<string, Paper[]>>({});
  const [editingDigest, setEditingDigest] = useState<SavedDigest | null>(null);
  const [editedTopics, setEditedTopics] = useState<string[]>([]);
  const [editedDescription, setEditedDescription] = useState('');
  const [editedName, setEditedName] = useState('');
  const [isLoadingPapers, setIsLoadingPapers] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [expandedDigests, setExpandedDigests] = useState<Record<string, boolean>>({});

  // Fetch saved digests
  useEffect(() => {
    if (!user) {
      setSavedDigests([]);
      setIsLoading(false);
      return;
    }

    const fetchDigests = async () => {
      try {
        const response = await fetch(`/api/digests?userId=${user.uid}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSavedDigests(data.digests);
      } catch (error) {
        console.error('Error fetching digests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDigests();
  }, [user]);

  // Fetch digest results using the API
  useEffect(() => {
    if (!user || savedDigests.length === 0) return;

    const fetchDigestResults = async () => {
      setIsLoadingPapers(true);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const results: Record<string, Paper[]> = {};

      try {
        for (const digest of savedDigests) {
          const response = await fetch('/api/digest-papers', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.uid,
              digestName: digest.name,
              date: formattedDate
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          results[digest.name] = data.results;
        }

        setDigestResults(results);
      } catch (error) {
        console.error('Error fetching digest results:', error);
        setError('Failed to fetch papers. Please try again.');
      } finally {
        setIsLoadingPapers(false);
      }
    };

    fetchDigestResults();
  }, [user, savedDigests, selectedDate]);

  const handleDeleteDigest = async (digestId: string) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/digests/${digestId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error deleting digest:', error);
      setError('Failed to delete digest. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!user || isSaving) return;

    if (!isNaming) {
      setIsNaming(true);
      return;
    }

    if (!digestName.trim()) {
      setError('Please enter a name for your digest');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/digests/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          name: digestName.trim(),
          topics: selectedTopics.join(','),
          description: description,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Clear form after successful save
      setSelectedTopics([]);
      setDescription('');
      setDigestName('');
      setIsNaming(false);
    } catch (error) {
      console.error('Error saving digest:', error);
      setError('Failed to save digest. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsNaming(false);
    setDigestName('');
    setError(null);
  };

  const handleEditDigest = (digest: SavedDigest) => {
    setEditingDigest(digest);
    setEditedTopics(digest.topics.split(','));
    setEditedDescription(digest.description);
    setEditedName(digest.name);
  };

  const handleCancelEdit = () => {
    setEditingDigest(null);
    setEditedTopics([]);
    setEditedDescription('');
    setEditedName('');
  };

  const handleSaveEdit = async () => {
    if (!user || !editingDigest) return;

    try {
      const response = await fetch(`/api/digests/${editingDigest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editedName.trim(),
          topics: editedTopics.join(','),
          description: editedDescription,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setEditingDigest(null);
    } catch (error) {
      console.error('Error updating digest:', error);
      setError('Failed to update digest. Please try again.');
    }
  };

  const toggleDigestExpansion = (digestId: string) => {
    setExpandedDigests(prev => ({
      ...prev,
      [digestId]: !prev[digestId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 text-center mb-4">
          Digest
        </h1>

        <div className="max-w-3xl mx-auto mb-8">
          <p className="text-center text-gray-600 text-lg leading-relaxed">
            Create your personalized ArXiv digest by selecting topics and describing your research interests.
            Every night, we&apos;ll analyze new papers that match your criteria and provide a curated digest with
            summaries of the most relevant papers.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <TopicPicker
              selectedTopics={selectedTopics}
              onTopicsChange={setSelectedTopics}
            />

            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Interests Description</h2>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Describe the types of papers you&apos;re interested in using natural language
                </p>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="E.g., I'm interested in papers about large language models, particularly those focusing on efficiency and environmental impact..."
                  className="w-full h-32 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre"
                  style={{ whiteSpace: 'pre-wrap' }}
                />
              </div>
            </div>

            <div className="flex flex-col items-center">
              {isNaming ? (
                <div className="w-full space-y-4">
                  <input
                    type="text"
                    value={digestName}
                    onChange={(e) => setDigestName(e.target.value)}
                    placeholder="Enter digest name..."
                    className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !digestName.trim()}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save Digest
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={isSaving || selectedTopics.length === 0}
                  className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-5 h-5" />
                  Save Digest
                </button>
              )}
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>

          <div className="lg:col-span-3">
            <section className="space-y-6 mb-12">
              <h2 className="text-2xl font-semibold text-gray-900">Your Saved Digests</h2>

              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : savedDigests.length === 0 ? (
                <div className="text-center text-gray-600 bg-white p-8 rounded-lg shadow">
                  <p className="text-lg font-medium">No saved digests</p>
                  <p className="mt-2">Create your first digest using the form on the left</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {savedDigests.map((digest) => (
                    <div key={digest.id} className="bg-white rounded-lg shadow-sm p-4">
                      {editingDigest?.id === digest.id ? (
                        <div className="space-y-4">
                          <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <TopicPicker
                            selectedTopics={editedTopics}
                            onTopicsChange={setEditedTopics}
                          />
                          <textarea
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            className="w-full h-32 px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="px-3 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium text-gray-900">{digest.name}</h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditDigest(digest)}
                                className="text-gray-400 hover:text-blue-600 transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteDigest(digest.id)}
                                className="text-gray-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                              {digest.topics.split(',').map((topic) => (
                                <span
                                  key={topic}
                                  className="px-2 py-1 text-sm bg-blue-50 text-blue-700 rounded-full"
                                >
                                  {topic}
                                </span>
                              ))}
                            </div>
                            <p className="text-gray-600 whitespace-pre-wrap">{digest.description}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-gray-900">Papers for {selectedDate.toLocaleDateString()}</h2>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <SingleDatePicker
                    selectedDate={selectedDate}
                    onChange={setSelectedDate}
                  />
                </div>
              </div>

              {isLoadingPapers ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                </div>
              ) : (
                savedDigests.map((digest) => (
                  <div key={digest.id} className="bg-white rounded-lg shadow-sm p-4">
                    <div
                      className="flex items-center justify-between mb-4 cursor-pointer"
                      onClick={() => toggleDigestExpansion(digest.id)}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight
                          className={`w-5 h-5 text-gray-500 transition-transform ${
                            expandedDigests[digest.id] ? 'transform rotate-90' : ''
                          }`}
                        />
                        <h3 className="text-lg font-medium text-gray-900">{digest.name}</h3>
                      </div>
                      <div className="inline-block bg-gray-50 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-gray-700">
                          {digestResults[digest.name]?.length || 0} paper{(digestResults[digest.name]?.length || 0) === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>
                    {expandedDigests[digest.id] && (
                      <>
                        {digestResults[digest.name]?.length > 0 ? (
                          <div className="space-y-4">
                            {digestResults[digest.name].map((paper) => (
                              <div key={paper.id} className="space-y-2">
                                <PaperCard
                                  paper={paper}
                                  onSelect={() => onPaperSelect(paper)}
                                  isSelected={paper.id === selectedPaperId}
                                />
                                <div className="ml-4 text-sm text-gray-600">
                                  <span className="font-medium">Why it&apos;s relevant: </span>
                                  {(paper as any).reason}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-600 text-sm">No papers found for today</p>
                        )}
                      </>
                    )}
                  </div>
                ))
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}