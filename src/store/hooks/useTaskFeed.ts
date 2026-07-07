import { useEffect, useRef, useCallback } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { handleTaskEvent, fetchSingleTask } from '@/store/tasksSlice';
import { normalizeWebSocketEvent } from '@/lib/normalize';
import { store } from '@/store';
import { selectIsTaskKnown } from '@/store/selectors';

interface UseTaskFeedOptions {
  url?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

interface UseTaskFeedReturn {
  isConnected: boolean;
  error: string | null;
}

export function useTaskFeed({
  url = 'ws://localhost:4000/ws',
  reconnectInterval = 3000,
  maxReconnectAttempts = 10,
}: UseTaskFeedOptions = {}): UseTaskFeedReturn {
  const dispatch = useAppDispatch();

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const isConnectedRef = useRef(false);
  const errorRef = useRef<string | null>(null);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!mountedRef.current) return;
        console.log('[WebSocket] Connected');
        isConnectedRef.current = true;
        errorRef.current = null;
        reconnectAttemptsRef.current = 0;
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const rawData = JSON.parse(event.data);
          const normalizedEvent = normalizeWebSocketEvent(rawData);

          if (!normalizedEvent) return;

          const taskId = normalizedEvent.taskId;
          const state = store.getState();
          const isKnown = selectIsTaskKnown(state, taskId);

          if (isKnown) {
            dispatch(handleTaskEvent(normalizedEvent));
          } else {
            dispatch(fetchSingleTask(taskId));
          }
        } catch (e) {
          console.error('[WebSocket] Failed to parse message:', e);
        }
      };

      ws.onerror = () => {
        errorRef.current = 'WebSocket connection error';
      };

      ws.onclose = (event) => {
        if (!mountedRef.current) return;

        console.log('[WebSocket] Closed:', event.code);
        isConnectedRef.current = false;

        if (
          event.code !== 1000 &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          console.log(
            `[WebSocket] Reconnecting in ${reconnectInterval}ms (attempt ${reconnectAttemptsRef.current})`
          );

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          errorRef.current = 'Max reconnection attempts reached';
        }
      };
    } catch (e) {
      console.error('[WebSocket] Failed to connect:', e);
      errorRef.current = 'Failed to establish WebSocket connection';
    }
  }, [url, reconnectInterval, maxReconnectAttempts, dispatch]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [connect]);

  return {
    isConnected: isConnectedRef.current,
    error: errorRef.current,
  };
}
