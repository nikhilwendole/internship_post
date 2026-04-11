import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = (() => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const wsProtocol = apiUrl.startsWith("https") ? "wss://" : "ws://";
  const host = apiUrl.replace(/^https?:\/\//, "");
  return `${wsProtocol}${host}/ws`;
})();

export function useWebSocketSearch() {
  const ws = useRef(null);
  const [status, setStatus] = useState("disconnected"); // connecting | connected | disconnected | error
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const reconnectTimer = useRef(null);
  const queryRef = useRef("");

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) return;

    setStatus("connecting");
    const socket = new WebSocket(WS_URL);
    ws.current = socket;

    socket.onopen = () => {
      setStatus("connected");
      clearTimeout(reconnectTimer.current);
    };

    socket.onmessage = (evt) => {
      try {
        const msg = JSON.parse(evt.data);
        if (msg.type === "search_results") {
          setResults({ posts: msg.results, count: msg.count, query: msg.query });
          setSearching(false);
        } else if (msg.type === "error") {
          console.error("WS error:", msg.message);
          setSearching(false);
        }
      } catch (e) {
        console.error("WS parse error:", e);
      }
    };

    socket.onerror = () => setStatus("error");

    socket.onclose = () => {
      setStatus("disconnected");
      // Auto-reconnect after 3s
      reconnectTimer.current = setTimeout(connect, 3000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      ws.current?.close();
    };
  }, [connect]);

  const search = useCallback(
    (query) => {
      queryRef.current = query;
      if (ws.current?.readyState === WebSocket.OPEN) {
        setSearching(true);
        ws.current.send(JSON.stringify({ type: "search", query }));
      } else {
        // Fallback: reconnect then retry
        connect();
      }
    },
    [connect]
  );

  const clearResults = useCallback(() => {
    setResults(null);
    setSearching(false);
  }, []);

  return { status, results, searching, search, clearResults };
}
