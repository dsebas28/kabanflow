import type { Server as IOServer } from "socket.io";

// The custom server (server.ts) and the Next.js route handlers run in the
// same Node process, so a module-level singleton is enough to share the
// Socket.io instance without reaching into `res.socket` (which the App
// Router's fetch-based Route Handlers don't expose).
let io: IOServer | null = null;

export function setIO(instance: IOServer) {
  io = instance;
}

export function getIO(): IOServer | null {
  return io;
}

export function emitToBoard(boardId: string, event: string, payload: unknown) {
  io?.to(`board:${boardId}`).emit(event, payload);
}
