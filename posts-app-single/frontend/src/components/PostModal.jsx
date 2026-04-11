import React, { useEffect } from "react";

export default function PostModal({ post, onClose }) {
  useEffect(() => {
    const fn = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(13,13,13,0.7)",
        backdropFilter: "blur(3px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "var(--paper)",
        maxWidth: "640px", width: "100%",
        maxHeight: "85vh",
        overflowY: "auto",
        position: "relative",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      }}>
        {/* top gold bar */}
        <div style={{ height: "3px", background: "var(--gold)" }} />

        {/* header */}
        <div style={{
          padding: "20px 28px 0",
          borderBottom: "1px solid var(--line)",
          paddingBottom: "16px",
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "flex-start", marginBottom: "12px",
          }}>
            <div style={{ display: "flex", gap: "8px" }}>
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: "10px",
                letterSpacing: "0.15em", color: "var(--paper)",
                background: "var(--ink)", padding: "3px 10px",
                borderRadius: "1px",
              }}>
                No. {String(post.externalId).padStart(3, "0")}
              </span>
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: "10px",
                letterSpacing: "0.12em", color: "var(--gold)",
                background: "var(--ink)", padding: "3px 10px",
                borderRadius: "1px",
              }}>
                User {post.userId}
              </span>
            </div>
            <button
              onClick={onClose}
              style={{
                fontFamily: "'DM Mono', monospace", fontSize: "11px",
                letterSpacing: "0.1em", color: "var(--muted)",
                padding: "4px 10px",
                border: "1px solid var(--line)",
                background: "var(--cream)",
                borderRadius: "1px",
                transition: "all 0.15s",
              }}
            >
              CLOSE ✕
            </button>
          </div>

          {/* section tag */}
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: "9px",
            letterSpacing: "0.22em", color: "var(--gold)",
            textTransform: "uppercase", marginBottom: "8px",
          }}>
            Archive · Full Article
          </div>

          {/* title */}
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(20px, 3vw, 28px)",
            fontWeight: 700,
            lineHeight: 1.3,
            color: "var(--ink)",
            textTransform: "capitalize",
            marginBottom: "10px",
          }}>
            {post.title}
          </h2>

          {/* byline */}
          <div style={{
            fontFamily: "'DM Mono', monospace", fontSize: "10px",
            color: "var(--faint)", letterSpacing: "0.06em",
            borderTop: "2px solid var(--ink)",
            borderBottom: "1px solid var(--ink)",
            padding: "5px 0",
            display: "flex", justifyContent: "space-between",
          }}>
            <span>By Staff Writer · JSONPlaceholder</span>
            <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
          </div>
        </div>

        {/* body */}
        <div style={{ padding: "24px 28px 32px" }}>
          {/* drop cap simulation */}
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "15px",
            color: "var(--ink)",
            lineHeight: 1.8,
            letterSpacing: "0.01em",
          }}>
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "52px",
              fontWeight: 900,
              lineHeight: 0.8,
              float: "left",
              marginRight: "6px",
              marginTop: "6px",
              color: "var(--ink)",
            }}>
              {post.body.charAt(0).toUpperCase()}
            </span>
            {post.body.slice(1)}
          </p>
        </div>

        {/* footer */}
        <div style={{
          borderTop: "2px solid var(--ink)",
          padding: "12px 28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "var(--cream)",
        }}>
          <span style={{
            fontFamily: "'DM Mono', monospace", fontSize: "9px",
            letterSpacing: "0.12em", color: "var(--muted)",
          }}>
            POST #{post.externalId} · MONGODB ARCHIVE
          </span>
          <button
            onClick={onClose}
            style={{
              fontFamily: "'DM Mono', monospace", fontSize: "10px",
              letterSpacing: "0.1em",
              background: "var(--ink)", color: "var(--paper)",
              padding: "7px 18px", borderRadius: "1px",
            }}
          >
            BACK TO ARCHIVE
          </button>
        </div>
      </div>
    </div>
  );
}
