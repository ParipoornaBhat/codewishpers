// src/lib/hooks/useSocket.ts
"use client";

import { env } from "@/env";
import { useEffect, useRef, useState } from "react";
import { io as ClientIO, Socket } from "socket.io-client";

export const useSocket = () => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return; // Ensure client-side

    // Prevent duplicate socket connections
    if (!socketRef.current) {
      try {
        const socketURL = env.NEXT_PUBLIC_SOCKET_URL;

        const socket = ClientIO(socketURL, {
          path: "/socket.io",
          transports: ["websocket"],
          reconnectionAttempts: 3,
          timeout: 3000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("✅ Connected to Socket.IO:", socket.id);
          setConnected(true);
        });

        socket.on("disconnect", () => {
          console.log("❌ Disconnected from Socket.IO");
          setConnected(false);
        });

        socket.on("connect_error", (err) => {
          console.warn("⚠️ Socket.IO connection error:", err.message);
        });

        // Clean up on unmount
        return () => {
          socket.disconnect();
          console.log("🔌 Socket.IO disconnected");
        };
      } catch (err) {
        console.warn("🚫 Socket connection failed:", err);
      }
    }
  }, []);

  return { socket: socketRef.current, connected };
};
