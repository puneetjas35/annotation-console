import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTaskSummaryOptions {
  taskId: string | null;
  apiBase?: string;
}

interface UseTaskSummaryReturn {
  content: string;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
}

export function useTaskSummary({
  taskId,
  apiBase = 'http://localhost:4000',
}: UseTaskSummaryOptions): UseTaskSummaryReturn {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const currentTaskIdRef = useRef<string | null>(null);

  const fetchSummary = useCallback(
    async (id: string) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      currentTaskIdRef.current = id;

      setContent('');
      setError(null);
      setIsLoading(true);
      setIsStreaming(false);

      try {
        const response = await fetch(`${apiBase}/api/tasks/${id}/summary`, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        setIsLoading(false);
        setIsStreaming(true);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            setIsStreaming(false);
            break;
          }

          if (currentTaskIdRef.current !== id) {
            reader.cancel();
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (line.startsWith('event: done')) {
              setIsStreaming(false);
              break;
            }

            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6);
              try {
                const chunk = JSON.parse(jsonStr);
                if (typeof chunk === 'string') {
                  setContent((prev) => prev + chunk);
                }
              } catch {
                console.warn('Failed to parse SSE chunk:', jsonStr);
              }
            }
          }
        }
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
          return;
        }

        setIsLoading(false);
        setIsStreaming(false);
        setError(e instanceof Error ? e.message : 'Failed to load summary');
      }
    },
    [apiBase]
  );

  useEffect(() => {
    if (!taskId) {
      setContent('');
      setError(null);
      setIsLoading(false);
      setIsStreaming(false);
      return;
    }

    fetchSummary(taskId);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [taskId, fetchSummary]);

  return {
    content,
    isLoading,
    isStreaming,
    error,
  };
}
