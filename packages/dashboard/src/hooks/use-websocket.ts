import { useEffect, useRef } from "react";
import { useDashboardStore } from "../store/dashboard-store";
import type { DashboardState } from "@xscope/shared";
import { WsMessageType } from "@xscope/shared";

const MIN_RETRY_MS = 1000;
const MAX_RETRY_MS = 30000;

interface WsEnvelope {
  type: WsMessageType;
  payload: unknown;
  timestamp: string;
}

/**
 * Manages WebSocket connection to CLI backend.
 * Exponential backoff: 1s → 2s → 4s → … → 30s max.
 * Dispatches messages to Zustand store.
 */
export function useWebSocket(url: string): void {
  const { setFullState, applyDelta, setConnectionStatus } = useDashboardStore();
  const retryDelay = useRef(MIN_RETRY_MS);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const unmounted = useRef(false);

  useEffect(() => {
    unmounted.current = false;

    function connect() {
      if (unmounted.current) return;

      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (unmounted.current) return;
        retryDelay.current = MIN_RETRY_MS;
        setConnectionStatus(true, false);
      };

      ws.onmessage = (event: MessageEvent) => {
        if (unmounted.current) return;
        try {
          const msg: WsEnvelope = JSON.parse(event.data as string);
          handleMessage(msg);
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        if (unmounted.current) return;
        setConnectionStatus(false, true);
        scheduleReconnect();
      };

      ws.onerror = () => {
        // onclose fires after onerror — reconnect handled there
        ws.close();
      };
    }

    function handleMessage(msg: WsEnvelope) {
      switch (msg.type) {
        case WsMessageType.SESSION_SNAPSHOT:
          setFullState(msg.payload as DashboardState);
          break;
        case WsMessageType.TOKEN_UPDATE:
        case WsMessageType.COMMAND_UPDATE:
        case WsMessageType.FILE_CHANGE:
        case WsMessageType.ERROR_UPDATE:
        case WsMessageType.SYSTEM_VITALS:
        case WsMessageType.HEARTBEAT:
          applyDelta(msg.payload as Partial<DashboardState>);
          break;
        case WsMessageType.SESSION_END:
          setConnectionStatus(false, false);
          break;
        default:
          break;
      }
    }

    function scheduleReconnect() {
      retryTimer.current = setTimeout(() => {
        retryDelay.current = Math.min(retryDelay.current * 2, MAX_RETRY_MS);
        connect();
      }, retryDelay.current);
    }

    connect();

    return () => {
      unmounted.current = true;
      if (retryTimer.current) clearTimeout(retryTimer.current);
      wsRef.current?.close();
    };
  }, [url, setFullState, applyDelta, setConnectionStatus]);
}
