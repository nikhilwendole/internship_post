const BASE = import.meta.env.VITE_API_URL || "/api";

export async function fetchPosts(page = 1, limit = 20) {
  const res = await fetch(`${BASE}/posts?page=${page}&limit=${limit}`);
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  return res.json();
}

export async function fetchPost(id) {
  const res = await fetch(`${BASE}/posts/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch post: ${res.status}`);
  return res.json();
}

export async function triggerFetch() {
  const res = await fetch(`${BASE}/posts/fetch`, { method: "POST" });
  if (!res.ok) throw new Error(`Failed to refresh posts: ${res.status}`);
  return res.json();
}

export async function searchPosts(q) {
  const res = await fetch(`${BASE}/posts/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error(`Search failed: ${res.status}`);
  return res.json();
}
