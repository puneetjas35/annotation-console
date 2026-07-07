import {
  createSlice,
  createEntityAdapter,
  createAsyncThunk,
  PayloadAction,
  EntityState,
} from '@reduxjs/toolkit';
import type { RawTasksResponse } from '@/types/api';
import { Task, TaskStatus, TaskType, TaskEvent } from '@/types/domain';
import { normalizeTasks, normalizeTask } from '@/lib/normalize';

// RTK v2: No selectId needed if entity has 'id' field
// sortComparer is still supported
 export const tasksAdapter = createEntityAdapter<Task>({
  sortComparer: (a, b) => b.updatedAt - a.updatedAt,
});

export interface TaskFilters {
  status: TaskStatus | 'all';
  type: TaskType | 'all';
  search: string;
}

// Use EntityState from RTK for proper typing
export interface TasksState {
  entities: EntityState<Task, string>;
  currentPage: number;
  pageSize: number;
  totalTasks: number;
  filters: TaskFilters;
  selectedTaskId: string | null;
  loadingStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  isCachedData: boolean;
  lastFetchedAt: number | null;
  knownTaskIds: string[];
}

const initialState: TasksState = {
  entities: tasksAdapter.getInitialState(),
  currentPage: 1,
  pageSize: 20,
  totalTasks: 0,
  filters: {
    status: 'all',
    type: 'all',
    search: '',
  },
  selectedTaskId: null,
  loadingStatus: 'idle',
  error: null,
  isCachedData: false,
  lastFetchedAt: null,
  knownTaskIds: [],
};

export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (
    { page, pageSize }: { page: number; pageSize: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/tasks?page=${page}&pageSize=${pageSize}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data: RawTasksResponse = await response.json();
      const normalizedTasks = normalizeTasks(data.items);

      return {
        tasks: normalizedTasks,
        page: data.page,
        pageSize: data.pageSize,
        total: data.total,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch tasks';
      return rejectWithValue(message);
    }
  }
);

export const fetchSingleTask = createAsyncThunk(
  'tasks/fetchSingleTask',
  async (taskId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/tasks/${taskId}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return normalizeTask(data);
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'Failed to fetch task'
      );
    }
  }
);

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setFilter: (state, action: PayloadAction<Partial<TaskFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },

    setSelectedTask: (state, action: PayloadAction<string | null>) => {
      state.selectedTaskId = action.payload;
    },

    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    handleTaskEvent: (state, action: PayloadAction<TaskEvent>) => {
      const event = action.payload;

      switch (event.kind) {
        case 'task.updated': {
          const existing = state.entities.entities[event.taskId];
          if (existing) {
            tasksAdapter.updateOne(state.entities, {
              id: event.taskId,
              changes: {
                status: event.status,
                updatedAt: event.updatedAt,
              },
            });
          }
          break;
        }

        case 'task.assigned': {
          const existing = state.entities.entities[event.taskId];
          if (existing) {
            tasksAdapter.updateOne(state.entities, {
              id: event.taskId,
              changes: {
                assignee: event.assignee,
                updatedAt: Date.now(),
              },
            });
          }
          break;
        }

        case 'annotation.created': {
          const existing = state.entities.entities[event.taskId];
          if (existing) {
            tasksAdapter.updateOne(state.entities, {
              id: event.taskId,
              changes: {
                annotationCount: existing.annotationCount + 1,
                updatedAt: event.at,
              },
            });
          }
          break;
        }
      }
    },

    loadCachedTasks: (
      state,
      action: PayloadAction<{
        tasks: Task[];
        page: number;
        total: number;
        cachedAt: number;
      }>
    ) => {
      const { tasks, page, total, cachedAt } = action.payload;
      tasksAdapter.setAll(state.entities, tasks);
      state.currentPage = page;
      state.totalTasks = total;
      state.isCachedData = true;
      state.lastFetchedAt = cachedAt;
      state.knownTaskIds = tasks.map((t) => t.id);
    },

    markDataFresh: (state) => {
      state.isCachedData = false;
    },

    addTask: (state, action: PayloadAction<Task>) => {
  tasksAdapter.upsertOne(state.entities, action.payload);

  if (!state.knownTaskIds.includes(action.payload.id)) {
    state.knownTaskIds.push(action.payload.id);
  }
},
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loadingStatus = 'loading';
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        const { tasks, page, total } = action.payload;

        if (page === state.currentPage) {
          tasksAdapter.setAll(state.entities, tasks);
        } else {
          tasksAdapter.upsertMany(state.entities, tasks);
        }

        state.currentPage = page;
        state.totalTasks = total;
        state.loadingStatus = 'succeeded';
        state.isCachedData = false;
        state.lastFetchedAt = Date.now();

        for (const task of tasks) {
          if (!state.knownTaskIds.includes(task.id)) {
            state.knownTaskIds.push(task.id);
          }
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loadingStatus = 'failed';
        state.error = action.payload as string;
      })
    .addCase(fetchSingleTask.fulfilled, (state, action) => {
  if (action.payload) {
    tasksAdapter.upsertOne(state.entities, action.payload);

    if (!state.knownTaskIds.includes(action.payload.id)) {
      state.knownTaskIds.push(action.payload.id);
    }
  }
})
  },
});

export const {
  setFilter,
  setSelectedTask,
  setPage,
  handleTaskEvent,
  loadCachedTasks,
  markDataFresh,
  addTask,
} = tasksSlice.actions;

export const tasksSelectors = tasksAdapter.getSelectors();

export default tasksSlice.reducer;
