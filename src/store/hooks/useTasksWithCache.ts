import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchTasks,
  loadCachedTasks as loadCachedTasksAction,
  markDataFresh,
} from '@/store/tasksSlice';
import { selectLoadingState, selectPaginationInfo } from '@/store/selectors';
import { loadCachedTasks, cacheTasksAsync } from '@/lib/cache';

export function useTasksWithCache() {
  const dispatch = useAppDispatch();
  const { currentPage, pageSize } = useAppSelector(selectPaginationInfo);
  const { isLoading, isCachedData } = useAppSelector(selectLoadingState);

  const initialLoadDoneRef = useRef(false);

  useEffect(() => {
    if (initialLoadDoneRef.current) return;
    initialLoadDoneRef.current = true;

    const initializeData = async () => {
      const cached = await loadCachedTasks();

      if (cached) {
        dispatch(
          loadCachedTasksAction({
            tasks: cached.tasks,
            page: cached.page,
            total: cached.total,
            cachedAt: cached.cachedAt,
          })
        );
      }

      const result = await dispatch(fetchTasks({ page: 1, pageSize: 20 }));

      if (fetchTasks.fulfilled.match(result)) {
        const { tasks, page, total } = result.payload;
        cacheTasksAsync(tasks, page, 20, total).catch(console.error);
        dispatch(markDataFresh());
      }
    };

    initializeData();
  }, [dispatch]);

  useEffect(() => {
    if (!initialLoadDoneRef.current) return;

    const loadPage = async () => {
      const result = await dispatch(fetchTasks({ page: currentPage, pageSize }));

      if (fetchTasks.fulfilled.match(result)) {
        const { tasks, page, total } = result.payload;
        cacheTasksAsync(tasks, page, pageSize, total).catch(console.error);
      }
    };

    loadPage();
  }, [currentPage, pageSize, dispatch]);

  return {
    isLoading,
    isCachedData,
  };
}
