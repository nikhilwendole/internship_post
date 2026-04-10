import React, { useState } from "react";

function highlight(text, query) {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi"));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} style={{ background: "var(--gold)", color: "var(--ink)", padding: "0 1px", borderRadius: "1px" }}>{part}</mark>
      : part
  );
}

export default function PostCard({ post, query, onClick, index = 0 }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      style={{
        background: hovered ? "var(--cream)" : "var(--paper)",
        padding: "24px",
        cursor: "pointer",
        transition: "background 0.15s",
        borderRight: "1px solid var(--line)",
        position: "relative",
        userSelect: "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick && onClick(post)}
    >
      {/* accent bar on hover */}
      {hovered && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          height: "2px", background: "var(--gold)",
        }} />
      )}

      {/* post number + user */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: "10px",
      }}>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "9px", letterSpacing: "0.2em",
          color: hovered ? "var(--gold)" : "var(--faint)",
          textTransform: "uppercase",
          transition: "color 0.15s",
        }}>
          No. {String(post.externalId).padStart(3, "0")}
        </span>
        <span style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: "9px", color: "var(--faint)",
          letterSpacing: "0.08em",
        }}>
          User {post.userId}
        </span>
      </div>

      {/* title */}
      <h2 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: "15px", fontWeight: 700,
        lineHeight: 1.35,
        color: "var(--ink)",
        marginBottom: "10px",
        textTransform: "capitalize",
        letterSpacing: "-0.01em",
      }}>
        {highlight(post.title, query)}
      </h2>

      {/* rule */}
      <div style={{ height: "1px", background: "var(--line)", marginBottom: "10px" }} />

      {/* body */}
      <p style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: "12.5px", color: "var(--muted)",
        lineHeight: 1.65,
        display: "-webkit-box",
        WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
      }}>
        {highlight(post.body, query)}
      </p>

      {/* read more */}
      <div style={{
        marginTop: "14px",
        fontFamily: "'DM Mono', monospace",
        fontSize: "9.5px",
        letterSpacing: "0.1em",
        color: hovered ? "var(--ink)" : "var(--faint)",
        display: "flex", alignItems: "center", gap: "4px",
        transition: "color 0.15s",
      }}>
        READ MORE
        <span style={{ fontSize: "11px", transform: hovered ? "translateX(3px)" : "translateX(0)", transition: "transform 0.15s", display: "inline-block" }}>→</span>
      </div>
    </article>
  );
}
