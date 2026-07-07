# Annotation Console

A production-ready annotation management dashboard built with **Next.js**, **TypeScript**, **Redux Toolkit**, and **Tailwind CSS**.

The application displays annotation tasks, supports live updates, server-side pagination, markdown streaming, caching, and state normalization while following modern React best practices.

---

## Features

### Task Feed
- Server-side paginated task list
- Sorting
- Filtering
- Search
- Loading states
- Empty states
- Error handling

### Task Details
- Task metadata
- Assignee information
- Status badges
- Annotation count
- Last updated timestamp

### AI Summary
- Streams markdown using Server-Sent Events (SSE)
- Sanitized markdown rendering
- Loading indicator
- Streaming indicator
- Graceful error handling

### Real-Time Updates
- WebSocket integration
- Live task updates
- Live assignment changes
- Live annotation count updates

### State Management
- Redux Toolkit
- Entity Adapter normalization
- Cached page support
- Memoized selectors
- Async thunks

### Testing
- Jest
- React Testing Library
- Component tests
- Reducer tests
- Normalization tests

---

# Tech Stack

- Next.js
- TypeScript
- Redux Toolkit
- React
- Tailwind CSS
- Jest
- React Testing Library
- DOMPurify
- React Markdown

---

# Folder Structure

```
src/
 ├── app/
 ├── components/
 ├── lib/
 ├── store/
 │    ├── hooks/
 │    ├── selectors.ts
 │    ├── tasksSlice.ts
 │    └── store.ts
 ├── types/
 
```

---

# Installation

Install dependencies

```bash
npm install
```

Run the Next.js application

```bash
npm run dev
```

---

# Running the Mock Server

Navigate to the mock server folder.

```bash
cd mock-server
```

Install dependencies

```bash
npm install
```

Start the mock server

```bash
npm run mock
```

Mock server runs at

```
http://localhost:4000
```

---

# Running Tests

```bash
npm test
```

or

```bash
npm run test
```

---

# Architecture

The application follows a feature-oriented architecture.

```
API
      ↓
Async Thunks
      ↓
Redux Slice
      ↓
Entity Adapter
      ↓
Selectors
      ↓
React Components
```

Tasks are normalized using Redux Toolkit Entity Adapter for efficient updates and lookups.

---

# State Management

The application uses Redux Toolkit with:

- Entity Adapter
- Async Thunks
- Memoized Selectors
- Cached pages
- Optimistic updates where appropriate

---

# Security

Markdown content is sanitized before rendering to prevent XSS attacks.

---

# Assumptions

- Backend provides paginated task APIs.
- Summary endpoint streams markdown using Server-Sent Events.
- WebSocket sends task update events.
- Unknown task types are safely normalized.
- Invalid backend statuses are mapped to `Unknown`.

---

# Trade-offs

- Client-side sorting is used after fetching a page.
- Cache is kept in Redux memory only.
- No authentication was implemented as it was outside the assignment scope.

---

# Future Improvements

- Infinite scrolling
- Persistent cache using IndexedDB
- Virtualized task list
- Better retry strategy
- Offline support
- Optimistic updates
- Accessibility improvements
- Performance monitoring

---

# Author

Puneet