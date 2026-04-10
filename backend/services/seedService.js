const fetch = require("node-fetch");
const Post = require("../models/Post");

const JSONPLACEHOLDER_URL = "https://jsonplaceholder.typicode.com/posts";

async function seedPosts() {
  try {
    const count = await Post.countDocuments();
    if (count > 0) {
      console.log(`DB already has ${count} posts — skipping seed.`);
      return { seeded: false, count };
    }

    console.log("Fetching posts from JSONPlaceholder...");
    const res = await fetch(JSONPLACEHOLDER_URL);
    if (!res.ok) throw new Error(`JSONPlaceholder responded with ${res.status}`);

    const posts = await res.json();

    const docs = posts.map((p) => ({
      externalId: p.id,
      userId: p.userId,
      title: p.title,
      body: p.body,
    }));

    await Post.insertMany(docs, { ordered: false });
    console.log(`Seeded ${docs.length} posts into MongoDB.`);
    return { seeded: true, count: docs.length };
  } catch (err) {
    console.error("Seed error:", err.message);
    return { seeded: false, error: err.message };
  }
}

async function refreshPosts() {
  try {
    console.log("Refreshing posts from JSONPlaceholder...");
    const res = await fetch(JSONPLACEHOLDER_URL);
    if (!res.ok) throw new Error(`JSONPlaceholder responded with ${res.status}`);

    const posts = await res.json();

    let upserted = 0;
    for (const p of posts) {
      await Post.findOneAndUpdate(
        { externalId: p.id },
        { userId: p.userId, title: p.title, body: p.body },
        { upsert: true, new: true }
      );
      upserted++;
    }

    console.log(`Refreshed ${upserted} posts.`);
    return { refreshed: true, count: upserted };
  } catch (err) {
    console.error("Refresh error:", err.message);
    throw err;
  }
}

module.exports = { seedPosts, refreshPosts };
