import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const demo = await prisma.user.upsert({
    where: { email: "demo@kanbanflow.app" },
    update: {},
    create: { name: "Cuenta Demo", email: "demo@kanbanflow.app", passwordHash, avatarColor: "#4F46E5" },
  });

  const teammate = await prisma.user.upsert({
    where: { email: "ana@kanbanflow.app" },
    update: {},
    create: { name: "Ana Torres", email: "ana@kanbanflow.app", passwordHash, avatarColor: "#10B981" },
  });

  const existingBoard = await prisma.board.findFirst({ where: { ownerId: demo.id, title: "Lanzamiento de producto" } });
  if (existingBoard) {
    console.log("Ya existen datos demo, no se vuelve a sembrar.");
    return;
  }

  const board = await prisma.board.create({
    data: {
      title: "Lanzamiento de producto",
      description: "Roadmap del lanzamiento del MVP",
      color: "#4F46E5",
      ownerId: demo.id,
      members: { create: [{ userId: teammate.id, role: "MEMBER" }] },
      lists: {
        create: [
          {
            title: "Por hacer",
            position: 0,
            cards: {
              create: [
                { title: "Definir alcance del MVP", position: 0, creatorId: demo.id },
                { title: "Diseñar wireframes", position: 1, creatorId: teammate.id },
                { title: "Configurar analítica", position: 2, creatorId: demo.id },
              ],
            },
          },
          {
            title: "En progreso",
            position: 1,
            cards: {
              create: [
                { title: "Maquetar landing page", position: 0, creatorId: teammate.id, description: "Usar la nueva paleta de marca" },
                { title: "Integrar autenticación", position: 1, creatorId: demo.id },
              ],
            },
          },
          {
            title: "Hecho",
            position: 2,
            cards: {
              create: [{ title: "Investigación de mercado", position: 0, creatorId: demo.id }],
            },
          },
        ],
      },
    },
  });

  console.log(`Datos demo creados: usuario ${demo.email}, tablero "${board.title}"`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
