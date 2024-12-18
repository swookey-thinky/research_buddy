interface ProgressBarProps {
  loaded: number;
  total: number;
  digestName: string;
}

export function ProgressBar({ loaded, total, digestName }: ProgressBarProps) {
  const percentage = total > 0 ? (loaded / total) * 100 : 0;

  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">
          Loading {digestName}
        </span>
        <span className="text-sm font-medium text-gray-700">
          {loaded}/{total} papers
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}