import { configureStore } from '@reduxjs/toolkit';
import tasksReducer from '@/store/tasksSlice';


export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // We use Set for knownTaskIds, which isn't serializable
        ignoredPaths: ['tasks.knownTaskIds'],
        ignoredActions: ['tasks/loadCachedTasks'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
