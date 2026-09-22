import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { setIO } from "./src/lib/socket";

const dev = process.env.NODE_ENV !== "production";
const port = Number(process.env.PORT) || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    path: "/api/socket",
  });

  io.on("connection", (socket) => {
    socket.on("board:join", (boardId: string) => {
      socket.join(`board:${boardId}`);
    });

    socket.on("board:leave", (boardId: string) => {
      socket.leave(`board:${boardId}`);
    });

    socket.on("chat:typing", ({ boardId, user }: { boardId: string; user: { id: string; name: string } }) => {
      socket.to(`board:${boardId}`).emit("chat:typing", user);
    });

    socket.on("presence:update", ({ boardId, user }: { boardId: string; user: { id: string; name: string; color: string } }) => {
      socket.to(`board:${boardId}`).emit("presence:update", user);
    });
  });

  setIO(io);

  httpServer.listen(port, () => {
    console.log(`🚀 kanban-flow listo en http://localhost:${port}`);
  });
});
