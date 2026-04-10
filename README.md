# Posts Explorer

A full-stack web application that fetches posts from the JSONPlaceholder API, stores them in MongoDB, and displays them in a React frontend with real-time WebSocket search.

## Live URLs

- **Frontend (Vercel):** `https://posts-app.vercel.app` ← replace with your URL
- **Backend (Railway):** `https://posts-app-backend.railway.app` ← replace with your URL

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas (free tier) |
| WebSocket | `ws` library |
| External API | JSONPlaceholder |
| Deployment | Frontend → Vercel, Backend → Railway |

## Features

- **REST API** — fetch all posts (paginated), get single post, search posts, trigger re-fetch
- **WebSocket** — real-time search with 300ms debounce; auto-reconnects on disconnect
- **Seeding** — on first boot, backend auto-fetches 100 posts from JSONPlaceholder and stores them in MongoDB
- **Refresh** — "Refresh Posts" button in the UI triggers `POST /api/posts/fetch` to upsert all posts
- **Pagination** — 20 posts per page with navigation controls
- **Highlight** — search matches are highlighted in results

## Project Structure

```
/
├── backend/
│   ├── index.js              # Express server + WebSocket server
│   ├── models/Post.js        # Mongoose schema
│   ├── routes/posts.js       # REST routes
│   ├── services/seedService.js  # JSONPlaceholder fetch + seed logic
│   ├── vercel.json
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Main component
│   │   ├── api.js            # REST API helpers
│   │   ├── hooks/
│   │   │   └── useWebSocketSearch.js
│   │   └── components/
│   │       ├── PostCard.jsx
│   │       └── PostModal.jsx
│   ├── vite.config.js
│   ├── vercel.json
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## REST API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/posts` | Get all posts (paginated). Query: `?page=1&limit=20` |
| GET | `/api/posts/:id` | Get single post by externalId or MongoDB `_id` |
| GET | `/api/posts/search` | Search posts. Query: `?q=keyword` |
| POST | `/api/posts/fetch` | Re-fetch & upsert all posts from JSONPlaceholder |
| GET | `/api/health` | Health check (DB connection status) |

## WebSocket API

**Endpoint:** `ws://your-backend/ws`

**Client → Server:**
```json
{ "type": "search", "query": "sunt aut" }
```

**Server → Client:**
```json
{
  "type": "search_results",
  "query": "sunt aut",
  "results": [...],
  "count": 3
}
```

---

## Running Locally

### Prerequisites

- Node.js 18+
- A MongoDB Atlas connection string (free tier at [mongodb.com/atlas](https://www.mongodb.com/atlas))

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/posts-app.git
cd posts-app
```

### 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your MONGO_URI
npm run dev
# Server starts on http://localhost:5000
```

**Backend `.env` variables:**

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB Atlas connection string |
| `PORT` | ❌ | Port number (default: 5000) |
| `FRONTEND_URL` | ❌ | Frontend origin for CORS (e.g. `http://localhost:3000`) |

### 3. Set up the frontend

```bash
cd frontend
npm install
cp .env.example .env
# In dev, Vite proxies /api to localhost:5000 — no env changes needed
npm run dev
# App starts on http://localhost:3000
```

**Frontend `.env` variables (for production only):**

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend REST base URL, e.g. `https://your-backend.railway.app/api` |
| `VITE_WS_URL` | WebSocket URL, e.g. `wss://your-backend.railway.app/ws` |

> In local dev, leave these empty — Vite's proxy handles API calls and the WebSocket hook defaults to `localhost:5000`.

---

## Deployment

### Important: WebSocket on Vercel

Vercel's serverless functions do **not** support persistent WebSocket connections. The backend must be deployed on a platform that supports long-lived connections.

**Recommended: Railway (free tier)**

### Deploy Backend to Railway

1. Go to [railway.app](https://railway.app) and create a new project
2. Connect your GitHub repo → select the `backend` folder as the root
3. Add environment variables:
   - `MONGO_URI` = your Atlas connection string
   - `FRONTEND_URL` = your Vercel frontend URL (added after frontend deploy)
4. Railway auto-detects Node.js and runs `npm start`
5. Copy the generated Railway URL (e.g. `https://posts-app-backend.railway.app`)

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   - `VITE_API_URL` = `https://your-backend.railway.app/api`
   - `VITE_WS_URL` = `wss://your-backend.railway.app/ws`
4. Deploy — Vercel picks up `vercel.json` automatically

### Update CORS on Backend

After deploying, go back to Railway and add:
```
FRONTEND_URL=https://your-app.vercel.app
```

---

## MongoDB Atlas Setup

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist `0.0.0.0/0` in Network Access (for Railway/Render dynamic IPs)
4. Copy the connection string — it looks like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/postsapp?retryWrites=true&w=majority
   ```

---

## How It Works

1. **On startup**, the Express server connects to MongoDB. If the `posts` collection is empty, it fetches all 100 posts from `https://jsonplaceholder.typicode.com/posts` and inserts them.
2. **The frontend** calls `GET /api/posts` on load to display the first page of posts.
3. **Searching** opens a WebSocket connection to `/ws`. As the user types (debounced 300ms), the client sends `{ type: "search", query: "..." }` and the server responds with matching posts from MongoDB using a case-insensitive regex.
4. **The Refresh button** calls `POST /api/posts/fetch`, which re-fetches from JSONPlaceholder and upserts all posts.
