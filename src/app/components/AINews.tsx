import { useState, useEffect } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { SingleDatePicker } from './SingleDatePicker';

export function AINews() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newsUrl, setNewsUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNewsUrl() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/ainews?date=${selectedDate.toISOString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch news URL');
        }
        const data = await response.json();
        setNewsUrl(data.url === 'none' ? null : data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchNewsUrl();
  }, [selectedDate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
            <Calendar className="w-5 h-5 text-blue-600" />
            <SingleDatePicker
              selectedDate={selectedDate}
              onChange={setSelectedDate}
            />
          </div>
        </div>

        {error && (
          <div className="text-center text-red-600 bg-red-50 p-4 rounded-lg mb-6">
            <p className="font-semibold">Error loading AI news</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : newsUrl ? (
          <iframe
            src={newsUrl}
            className="w-full h-[calc(100vh-12rem)] rounded-lg shadow-lg"
          />
        ) : (
          <div className="text-center text-gray-600 bg-white p-8 rounded-lg shadow">
            <p className="text-lg font-medium">No AI news available for {selectedDate.toLocaleDateString()}</p>
            <p className="mt-2">Try selecting a different date</p>
          </div>
        )}
      </div>
    </div>
  );
}