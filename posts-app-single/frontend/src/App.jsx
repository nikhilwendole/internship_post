import React, { useState, useEffect, useCallback, useRef } from "react";
import PostCard from "./components/PostCard";
import PostModal from "./components/PostModal";
import { useWebSocketSearch } from "./hooks/useWebSocketSearch";
import { fetchPosts, triggerFetch } from "./api";

/* ── inject global styles ── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --ink:    #0d0d0d;
    --paper:  #f5f0e8;
    --cream:  #ede8dc;
    --warm:   #d4c9b0;
    --gold:   #c9a84c;
    --gold2:  #e8c86d;
    --rust:   #b5491e;
    --muted:  #6b6355;
    --faint:  #9e9585;
    --line:   rgba(0,0,0,0.12);
  }

  html { scroll-behavior: smooth; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--paper);
    color: var(--ink);
    min-height: 100vh;
    line-height: 1.6;
  }
  ::selection { background: var(--gold); color: var(--ink); }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes ticker {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes pulse { 0%,100%{opacity:.45} 50%{opacity:1} }

  .a1 { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) both; }
  .a2 { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.07s both; }
  .a3 { animation: fadeUp 0.5s cubic-bezier(.22,1,.36,1) 0.14s both; }

  input:focus { outline: none; }
  button { cursor: pointer; font-family: inherit; border: none; background: none; }
  ::-webkit-scrollbar { width: 5px; }
  ::-webkit-scrollbar-track { background: var(--cream); }
  ::-webkit-scrollbar-thumb { background: var(--warm); border-radius: 3px; }
`;

if (typeof document !== "undefined") {
  const el = document.createElement("style");
  el.textContent = css;
  document.head.appendChild(el);
}

const WS_CONFIG = {
  connected:    { dot: "#4ade80", label: "LIVE" },
  connecting:   { dot: "#facc15", label: "SYNC" },
  disconnected: { dot: "#f87171", label: "OFF" },
  error:        { dot: "#f87171", label: "ERR" },
};

export default function App() {
  const [posts, setPosts]           = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage]             = useState(1);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [query, setQuery]           = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState(null);
  const debounceRef = useRef(null);
  const inputRef    = useRef(null);

  const { status: wsStatus, results, searching, search, clearResults } = useWebSocketSearch();

  const loadPosts = useCallback(async (p = 1) => {
    setLoading(true); setError(null);
    try {
      const data = await fetchPosts(p, 20);
      setPosts(data.posts); setPagination(data.pagination); setPage(p);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadPosts(1); }, [loadPosts]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { clearResults(); return; }
    debounceRef.current = setTimeout(() => search(query.trim()), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search, clearResults]);

  const handleRefresh = async () => {
    setRefreshing(true); setRefreshMsg(null);
    try {
      const data = await triggerFetch();
      setRefreshMsg(`${data.count} posts synced`);
      await loadPosts(1); setQuery(""); clearResults();
    } catch (e) { setRefreshMsg(`Error: ${e.message}`); }
    finally {
      setRefreshing(false);
      setTimeout(() => setRefreshMsg(null), 4000);
    }
  };

  const displayPosts = results ? results.posts : posts;
  const isSearching  = query.trim().length > 0;
  const wsCfg        = WS_CONFIG[wsStatus] || WS_CONFIG.disconnected;

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ═══════════════════════ MASTHEAD ═══════════════════════ */}
      <header style={h.root}>
        <div style={h.topBar} />

        <div style={h.inner}>
          {/* Left col */}
          <div style={h.leftCol}>
            <div style={h.dateLabel}>
              {new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" })}
            </div>
            <div style={h.editionTag}>Digital Edition</div>
          </div>

          {/* Center — brand */}
          <div style={h.brand}>
            <div style={h.brandKicker}>THE DAILY</div>
            <div style={h.brandName}>POST EXPLORER</div>
            <div style={h.brandRule} />
            <div style={h.brandTagline}>JSONPlaceholder · MongoDB · WebSocket</div>
          </div>

          {/* Right col */}
          <div style={h.rightCol}>
            <div style={h.wsPill}>
              <span style={{ ...h.wsDot, background: wsCfg.dot }} />
              <span style={h.wsLabel}>{wsCfg.label}</span>
            </div>
            <button
              style={{ ...h.syncBtn, opacity: refreshing ? 0.5 : 1 }}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? "SYNCING…" : "↻ SYNC"}
            </button>
          </div>
        </div>

        {/* Double rule */}
        <div style={h.ruleThick} />
        <div style={h.ruleThin} />
      </header>

      {/* ═══════════════════════ TICKER ═══════════════════════ */}
      <div style={tk.wrap} aria-hidden>
        <div style={tk.inner}>
          {["BREAKING: 100 POSTS ARCHIVED · REAL-TIME WEBSOCKET SEARCH ACTIVE · MONGODB CONNECTED · JSONPLACEHOLDER API SYNCED · "].concat(
            ["BREAKING: 100 POSTS ARCHIVED · REAL-TIME WEBSOCKET SEARCH ACTIVE · MONGODB CONNECTED · JSONPLACEHOLDER API SYNCED · "]
          ).map((t, i) => (
            <span key={i} style={tk.text}>{t}</span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════ SEARCH ═══════════════════════ */}
      <div style={sr.section} className="a1">
        <div style={sr.wrap}>
          <div style={sr.row}>
            <span style={sr.eyebrow}>SEARCH THE ARCHIVE</span>
            <input
              ref={inputRef}
              style={sr.input}
              placeholder="Type to search posts…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              autoFocus
            />
            <div style={sr.controls}>
              {searching && <div style={sr.spinner} />}
              {query && !searching && (
                <button style={sr.clear} onClick={() => { setQuery(""); clearResults(); inputRef.current?.focus(); }}>✕</button>
              )}
            </div>
          </div>
          <div style={sr.divider} />
          <div style={sr.metaRow}>
            {isSearching && !searching && results ? (
              <span style={sr.resultMeta}>
                Found <strong style={{ color: "var(--gold)", fontFamily: "'Playfair Display', serif" }}>{results.count}</strong> result{results.count !== 1 ? "s" : ""} matching "<em>{query}</em>"
              </span>
            ) : !isSearching && pagination ? (
              <span style={sr.resultMeta}>
                Showing page {pagination.page} of {pagination.totalPages} — {pagination.total} posts total
              </span>
            ) : null}
            {refreshMsg && <span style={{ color: "var(--rust)", fontFamily: "'DM Mono', monospace", fontSize: "11px" }}>{refreshMsg}</span>}
          </div>
        </div>
      </div>

      {/* ═══════════════════════ STATS ROW ═══════════════════════ */}
      {!isSearching && pagination && (
        <div style={st.row} className="a2">
          {[
            ["TOTAL", pagination.total],
            ["PAGE", `${pagination.page}/${pagination.totalPages}`],
            ["SHOWING", displayPosts.length],
            ["ENGINE", "MongoDB"],
            ["REALTIME", "WebSocket"],
          ].map(([label, val], i, arr) => (
            <React.Fragment key={label}>
              <div style={st.cell}>
                <div style={st.cellLabel}>{label}</div>
                <div style={{ ...st.cellVal, color: label === "ENGINE" || label === "REALTIME" ? "var(--gold)" : "var(--ink)" }}>{val}</div>
              </div>
              {i < arr.length - 1 && <div style={st.divider} />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* ═══════════════════════ GRID ═══════════════════════ */}
      <main style={gd.main} className="a3">
        {error ? (
          <div style={gd.errorWrap}>
            <div style={gd.errCode}>503</div>
            <div style={gd.errTitle}>Service Unavailable</div>
            <div style={gd.errMsg}>{error}</div>
            <button style={gd.errBtn} onClick={() => loadPosts(page)}>RETRY</button>
          </div>
        ) : loading ? (
          <div style={gd.grid}>
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} style={{ ...gd.skelCard, animationDelay: `${i * 50}ms` }}>
                <div style={gd.sk1} /><div style={gd.sk2} /><div style={gd.sk3} /><div style={gd.sk4} />
              </div>
            ))}
          </div>
        ) : displayPosts.length === 0 ? (
          <div style={gd.emptyWrap}>
            <div style={gd.emptyGlyph}>∅</div>
            <div style={gd.emptyTitle}>Nothing Found</div>
            <div style={gd.emptySub}>Try a different search term</div>
          </div>
        ) : (
          <div style={gd.grid}>
            {displayPosts.map((post, i) => (
              <PostCard key={post._id} post={post} query={isSearching ? query : ""} onClick={setSelectedPost} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isSearching && pagination && pagination.totalPages > 1 && (
          <div style={pg.wrap}>
            <button style={{ ...pg.arrow, opacity: pagination.hasPrev ? 1 : 0.25 }} disabled={!pagination.hasPrev} onClick={() => loadPosts(page - 1)}>← PREV</button>
            <div style={pg.nums}>
              {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => {
                const p = i + 1;
                return <button key={p} style={p === page ? pg.active : pg.num} onClick={() => loadPosts(p)}>{p}</button>;
              })}
              {pagination.totalPages > 7 && <span style={pg.dots}>…</span>}
            </div>
            <button style={{ ...pg.arrow, opacity: pagination.hasNext ? 1 : 0.25 }} disabled={!pagination.hasNext} onClick={() => loadPosts(page + 1)}>NEXT →</button>
          </div>
        )}
      </main>

      {/* ═══════════════════════ FOOTER ═══════════════════════ */}
      <footer style={ft.root}>
        <div style={ft.goldBar} />
        <div style={ft.inner}>
          <span style={ft.name}>POST EXPLORER</span>
          <span style={ft.stack}>React · Express · MongoDB · WebSocket</span>
          <span style={ft.year}>© {new Date().getFullYear()}</span>
        </div>
      </footer>

      {selectedPost && <PostModal post={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  );
}

/* ── style blocks ── */

const h = {
  root: { background: "var(--paper)", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 0 var(--line), 0 4px 16px rgba(0,0,0,0.07)" },
  topBar: { height: "4px", background: "var(--ink)" },
  inner: { maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "14px 32px", gap: "16px" },
  leftCol: { display: "flex", flexDirection: "column", gap: "2px" },
  dateLabel: { fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.04em", textTransform: "uppercase" },
  editionTag: { fontFamily: "'DM Mono', monospace", fontSize: "9px", color: "var(--faint)", letterSpacing: "0.08em" },
  brand: { textAlign: "center" },
  brandKicker: { fontFamily: "'DM Mono', monospace", fontSize: "9px", letterSpacing: "0.28em", color: "var(--gold)", textTransform: "uppercase", marginBottom: "3px" },
  brandName: { fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 3vw, 38px)", fontWeight: 900, letterSpacing: "-0.01em", color: "var(--ink)", lineHeight: 1 },
  brandRule: { height: "1px", background: "var(--ink)", margin: "5px auto 4px", width: "75%" },
  brandTagline: { fontFamily: "'DM Mono', monospace", fontSize: "8.5px", color: "var(--muted)", letterSpacing: "0.1em", textTransform: "uppercase" },
  rightCol: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "10px" },
  wsPill: { display: "flex", alignItems: "center", gap: "5px", padding: "4px 10px", background: "var(--cream)", border: "1px solid var(--line)", borderRadius: "2px" },
  wsDot: { width: "6px", height: "6px", borderRadius: "50%", flexShrink: 0 },
  wsLabel: { fontFamily: "'DM Mono', monospace", fontSize: "9px", color: "var(--muted)", letterSpacing: "0.1em" },
  syncBtn: { fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.08em", background: "var(--ink)", color: "var(--paper)", padding: "6px 14px", borderRadius: "2px", transition: "opacity 0.15s" },
  ruleThick: { height: "3px", background: "var(--ink)", margin: "0 0 2px" },
  ruleThin:  { height: "1px", background: "var(--ink)" },
};

const tk = {
  wrap: { background: "var(--ink)", overflow: "hidden", padding: "6px 0" },
  inner: { display: "inline-flex", animation: "ticker 35s linear infinite", whiteSpace: "nowrap" },
  text: { fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--gold)", letterSpacing: "0.12em", paddingRight: "0" },
};

const sr = {
  section: { maxWidth: "1280px", margin: "0 auto", padding: "28px 32px 0" },
  wrap: {},
  row: { display: "flex", alignItems: "center", gap: "16px" },
  eyebrow: { fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.18em", color: "var(--muted)", flexShrink: 0 },
  input: { flex: 1, fontFamily: "'Playfair Display', serif", fontSize: "clamp(20px, 2.5vw, 30px)", fontWeight: 700, fontStyle: "italic", color: "var(--ink)", background: "transparent", border: "none", caretColor: "var(--gold)" },
  controls: { display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 },
  spinner: { width: "16px", height: "16px", border: "2px solid var(--warm)", borderTopColor: "var(--ink)", borderRadius: "50%", animation: "spin 0.7s linear infinite" },
  clear: { color: "var(--muted)", fontSize: "13px", padding: "2px 6px" },
  divider: { height: "2px", background: "var(--ink)", margin: "10px 0 8px" },
  metaRow: { display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "18px" },
  resultMeta: { fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "var(--muted)", fontStyle: "italic" },
};

const st = {
  row: { maxWidth: "1280px", margin: "16px auto 0", padding: "0 32px", display: "flex", alignItems: "stretch" },
  cell: { flex: 1, padding: "10px 16px", background: "var(--cream)", display: "flex", flexDirection: "column", gap: "2px", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)", borderLeft: "1px solid var(--line)" },
  cellLabel: { fontFamily: "'DM Mono', monospace", fontSize: "8.5px", letterSpacing: "0.18em", color: "var(--faint)", textTransform: "uppercase" },
  cellVal: { fontFamily: "'Playfair Display', serif", fontSize: "15px", fontWeight: 700, lineHeight: 1.2 },
  divider: { width: "1px", background: "var(--line)" },
};

const gd = {
  main: { maxWidth: "1280px", margin: "0 auto", padding: "20px 32px 64px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1px", background: "var(--line)", border: "1px solid var(--line)", marginBottom: "40px" },
  skelCard: { background: "var(--paper)", padding: "24px", display: "flex", flexDirection: "column", gap: "10px", animation: "pulse 1.4s ease-in-out infinite" },
  sk1: { height: "9px", background: "var(--warm)", borderRadius: "1px", width: "35%" },
  sk2: { height: "17px", background: "var(--cream)", borderRadius: "1px", width: "80%" },
  sk3: { height: "11px", background: "var(--cream)", borderRadius: "1px", width: "100%" },
  sk4: { height: "11px", background: "var(--cream)", borderRadius: "1px", width: "60%" },
  errorWrap: { textAlign: "center", padding: "80px 24px", border: "1px solid var(--line)", background: "var(--cream)" },
  errCode: { fontFamily: "'Playfair Display', serif", fontSize: "96px", fontWeight: 900, color: "var(--warm)", lineHeight: 1 },
  errTitle: { fontSize: "18px", fontWeight: 600, margin: "4px 0" },
  errMsg: { fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--muted)", margin: "4px 0 20px" },
  errBtn: { fontFamily: "'DM Mono', monospace", fontSize: "11px", letterSpacing: "0.1em", background: "var(--ink)", color: "var(--paper)", padding: "9px 22px", borderRadius: "2px" },
  emptyWrap: { textAlign: "center", padding: "100px 24px", border: "1px solid var(--line)", background: "var(--cream)" },
  emptyGlyph: { fontSize: "72px", color: "var(--warm)", lineHeight: 1, marginBottom: "16px" },
  emptyTitle: { fontFamily: "'Playfair Display', serif", fontSize: "24px", fontWeight: 700 },
  emptySub: { fontSize: "13px", color: "var(--muted)", marginTop: "6px" },
};

const pg = {
  wrap: { display: "flex", alignItems: "center", justifyContent: "center", gap: "2px" },
  arrow: { fontFamily: "'DM Mono', monospace", fontSize: "10px", letterSpacing: "0.1em", color: "var(--ink)", padding: "8px 16px", border: "1px solid var(--line)", borderRadius: "2px", background: "var(--cream)", transition: "opacity 0.15s" },
  nums: { display: "flex", gap: "2px" },
  num: { fontFamily: "'DM Mono', monospace", fontSize: "12px", background: "var(--cream)", color: "var(--muted)", width: "36px", height: "36px", border: "1px solid var(--line)", borderRadius: "2px" },
  active: { fontFamily: "'DM Mono', monospace", fontSize: "12px", background: "var(--ink)", color: "var(--paper)", width: "36px", height: "36px", border: "1px solid var(--ink)", borderRadius: "2px" },
  dots: { fontFamily: "'DM Mono', monospace", fontSize: "12px", color: "var(--muted)", padding: "0 8px", lineHeight: "36px" },
};

const ft = {
  root: { background: "var(--ink)" },
  goldBar: { height: "3px", background: "var(--gold)" },
  inner: { maxWidth: "1280px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "18px 32px" },
  name: { fontFamily: "'Playfair Display', serif", fontSize: "16px", fontWeight: 900, color: "var(--paper)" },
  stack: { fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--gold)", letterSpacing: "0.12em", textTransform: "uppercase" },
  year: { fontFamily: "'DM Mono', monospace", fontSize: "10px", color: "var(--muted)", textAlign: "right" },
};
