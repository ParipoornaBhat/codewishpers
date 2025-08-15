// server/socket-server.js  (ESM - works with "type": "module" in package.json)
import { Server } from "socket.io";
import { createServer } from "http";
import dotenv from "dotenv";

dotenv.config();

const socketUrl = process.env.SOCKET_URL || "http://localhost:3003";
const port = Number(new URL(socketUrl).port) || 3003;

// keep single instance across reloads
const globalAny = globalThis;

// @ts-ignore
if (!globalAny.io) {
  const httpServer = createServer((req, res) => {
    if (req.method === "POST" && req.url === "/emit-leaderboard-update") {
      let body = "";
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        try {
          const parsed = JSON.parse(body || "{}");
          const { questionId } = parsed;

          if (!questionId) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ status: "error", error: "questionId required" }));
            return;
          }

          console.log(`📣 Called by backend: emit-leaderboard-update for room ${questionId}`);

          try {
            // @ts-ignore
            const rooms = globalAny.io && globalAny.io.sockets && globalAny.io.sockets.adapter
              // @ts-ignore
              ? globalAny.io.sockets.adapter.rooms
              : null;
            console.log("Rooms available:", rooms);
          } catch (e) {
            // @ts-ignore
            console.log("Rooms unavailable to print:", e?.message);
          }

          // @ts-ignore
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

      req.on("error", (err) => {
        console.error("Request error:", err);
        res.writeHead(500);
        res.end();
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/socket.io",
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id);

    socket.on("joinRoom", (roomId) => {
      try {
        socket.join(roomId);
        console.log(`🔵 Socket ${socket.id} joined room ${roomId}`);
      } catch (e) {
        // @ts-ignore
        console.warn("Failed joinRoom:", e?.message);
      }
    });

    socket.on("leaveRoom", (roomId) => {
      try {
        socket.leave(roomId);
        console.log(`🔴 Socket ${socket.id} left room ${roomId}`);
      } catch (e) {
        // @ts-ignore
        console.warn("Failed leaveRoom:", e?.message);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", socket.id, reason ?? "");
    });
  });

  httpServer.listen(port, () => {
    console.log(`🚀 Socket.IO server running at ${socketUrl}`);
  });

  // @ts-ignore
  globalAny.io = io;
}

// ESM export
// @ts-ignore
export const io = globalAny.io;
