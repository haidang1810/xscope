import { join, extname } from "node:path";
import { existsSync } from "node:fs";
import { WsMessageType } from "@xscope/shared";
import type { DashboardState, WsMessage } from "@xscope/shared";
import type { DataAggregator } from "./data-aggregator";

/** MIME type mapping for static file serving */
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "application/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".map": "application/json",
};

interface WsServerOptions {
  port: number;
  aggregator: DataAggregator;
  dashboardDistPath: string;
}

/** Create Bun.serve() with WebSocket + static file serving */
export function createServer(options: WsServerOptions) {
  const { port, aggregator, dashboardDistPath } = options;
  const clients = new Set<{ send: (data: string) => void }>();

  const server = Bun.serve({
    port,

    // HTTP handler — static files + API fallback
    async fetch(req, server) {
      const url = new URL(req.url);

      // WebSocket upgrade
      if (url.pathname === "/ws") {
        const upgraded = server.upgrade(req);
        if (!upgraded) {
          return new Response("WebSocket upgrade failed", { status: 400 });
        }
        return undefined;
      }

      // API fallback — get full state as JSON
      if (url.pathname === "/api/state") {
        return Response.json(aggregator.getState());
      }

      // Static file serving from dashboard dist
      let filePath = join(dashboardDistPath, url.pathname);

      // SPA fallback: if path doesn't match a file, serve index.html
      if (!existsSync(filePath) || url.pathname === "/") {
        filePath = join(dashboardDistPath, "index.html");
      }

      if (!existsSync(filePath)) {
        return new Response("Not found", { status: 404 });
      }

      const ext = extname(filePath);
      const contentType = MIME_TYPES[ext] || "application/octet-stream";
      const file = Bun.file(filePath);

      return new Response(file, {
        headers: { "Content-Type": contentType },
      });
    },

    websocket: {
      open(ws) {
        clients.add(ws);
        // Send full state on connect
        const state = aggregator.getState();
        const msg: WsMessage<DashboardState> = {
          type: WsMessageType.SESSION_SNAPSHOT,
          payload: state,
          timestamp: new Date().toISOString(),
        };
        ws.send(JSON.stringify(msg));
      },
      message(_ws, _message) {
        // Client commands can be handled here in the future
      },
      close(ws) {
        clients.delete(ws);
      },
    },
  });

  // Throttled broadcast: push updates to all connected clients
  let broadcastTimer: ReturnType<typeof setTimeout> | null = null;
  const THROTTLE_MS = 200;

  function scheduleBroadcast(): void {
    if (broadcastTimer) return;
    broadcastTimer = setTimeout(() => {
      broadcastTimer = null;
      if (!aggregator.isDirty()) return;

      const state = aggregator.getState();
      const envelope: WsMessage<DashboardState> = {
        type: WsMessageType.SESSION_SNAPSHOT,
        payload: state,
        timestamp: new Date().toISOString(),
      };
      const msg = JSON.stringify(envelope);
      for (const client of clients) {
        try {
          client.send(msg);
        } catch {
          clients.delete(client);
        }
      }
    }, THROTTLE_MS);
  }

  return { server, clients, scheduleBroadcast };
}
