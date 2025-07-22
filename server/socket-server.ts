import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";
import { IncomingMessage, ServerResponse } from "http";

// Load env vars from .env
dotenv.config();

const socketUrl = process.env.SOCKET_URL || "http://localhost:3003";
const port = Number(new URL(socketUrl).port) || 3003;

// Ensure we only start the server once
const globalAny = globalThis as any;

if (!globalAny.io) {
  const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method === "POST" && req.url === "/emit-leaderboard-update") {
      let body = "";

      req.on("data", (chunk) => {
        body += chunk;
      });

      req.on("end", () => {
        try {
          const { questionId } = JSON.parse(body);

          console.log(`📣 Called by backend: emit-leaderboard-update for room ${questionId}`);
          console.log("Rooms available:", globalAny.io.sockets.adapter.rooms);
          
          globalAny.io.to(questionId).emit("leaderboard-update", questionId);
          console.log(`🚀 Emitted to frontend (room: ${questionId}) -> leaderboard-update`);

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "ok" }));
        } catch (err) {
          console.error("❌ Failed to parse emit-leaderboard-update:", err);
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ status: "error", error: "Invalid JSON" }));
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  // 👇 Move this ABOVE the createServer usage
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("joinRoom", (roomId: string) => {
      socket.join(roomId);
      console.log(`🔵 Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("leaveRoom", (roomId: string) => {
      socket.leave(roomId);
      console.log(`🔴 Socket ${socket.id} left room ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Socket.IO server running at ${socketUrl}`);
  });

  globalAny.io = io;
}


export const io: Server = globalAny.io;
