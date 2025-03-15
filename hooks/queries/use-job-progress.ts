import { useState, useEffect } from "react";

export interface JobProgress {
  stage: "runway" | "template" | "upload" | "vision";
  subStage?: string;
  progress: number;
  message?: string;
  error?: string;
}

export const useJobProgress = (jobId?: string, pollingInterval = 3000) => {
  const [progress, setProgress] = useState<JobProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchProgress = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      try {
        const response = await fetch(`/api/jobs/${jobId}/progress`, {
          headers: {
            'Origin': window.location.origin,
          }
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();

        if (isMounted) {
          setProgress(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err
              : new Error("Failed to fetch job progress")
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
          // Continue polling if job is not complete
          const currentProgress = progress?.progress ?? 0;
          if (currentProgress < 100) {
            timeoutId = setTimeout(fetchProgress, pollingInterval);
          }
        }
      }
    };

    fetchProgress();

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [jobId, pollingInterval, progress?.progress]);

  return { progress, isLoading, error };
};
