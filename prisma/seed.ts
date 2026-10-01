import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
/** A moment relative to now: ago(2) is two days ago, ago(0, 3) three hours ago. */
const ago = (days: number, hours = 0) => new Date(Date.now() - days * DAY - hours * HOUR);
/** A due date relative to today at 18:00 (negative = overdue). */
const due = (days: number) => {
  const d = new Date(Date.now() + days * DAY);
  d.setHours(18, 0, 0, 0);
  return d;
};

// [author, text, days ago] for comments; [author, text, days ago, hours ago] for chat and history.
type SeedCard = { title: string; by: string; description?: string; due?: number; comments?: [string, string, number][] };
type SeedList = { title: string; cards: SeedCard[] };
type SeedBoard = {
  title: string;
  description: string;
  color: string;
  owner: string;
  members: string[];
  createdDaysAgo: number;
  lists: SeedList[];
  messages: [string, string, number, number][];
  activity: [string, string, number, number][];
};

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);

  const people = [
    { key: "demo", name: "Cuenta Demo", email: "demo@kanbanflow.app", avatarColor: "#4F46E5" },
    { key: "ana", name: "Ana Torres", email: "ana@kanbanflow.app", avatarColor: "#10B981" },
    { key: "carlos", name: "Carlos Ruiz", email: "carlos@kanbanflow.app", avatarColor: "#F59E0B" },
    { key: "lucia", name: "Lucía Gómez", email: "lucia@kanbanflow.app", avatarColor: "#EC4899" },
  ];
  const users: Record<string, string> = {};
  for (const p of people) {
    const user = await prisma.user.upsert({
      where: { email: p.email },
      update: {},
      create: { name: p.name, email: p.email, passwordHash, avatarColor: p.avatarColor },
    });
    users[p.key] = user.id;
  }

  const existingBoard = await prisma.board.findFirst({ where: { ownerId: users.demo, title: "Lanzamiento de producto" } });
  if (existingBoard) {
    console.log("Ya existen datos demo, no se vuelve a sembrar.");
    return;
  }

  // The owner is not a BoardMember row: ownerId alone grants access (see src/lib/boardAccess.ts).
  async function createBoard(input: SeedBoard) {
    const board = await prisma.board.create({
      data: {
        title: input.title,
        description: input.description,
        color: input.color,
        ownerId: users[input.owner],
        createdAt: ago(input.createdDaysAgo),
        members: { create: input.members.map((m) => ({ userId: users[m], role: "MEMBER" as const })) },
      },
    });

    for (const [listIndex, list] of input.lists.entries()) {
      const created = await prisma.list.create({ data: { title: list.title, position: listIndex, boardId: board.id } });
      for (const [cardIndex, card] of list.cards.entries()) {
        await prisma.card.create({
          data: {
            title: card.title,
            description: card.description,
            position: cardIndex,
            dueDate: card.due === undefined ? undefined : due(card.due),
            listId: created.id,
            creatorId: users[card.by],
            createdAt: ago(input.createdDaysAgo - 1, cardIndex),
            comments: {
              create: (card.comments ?? []).map(([author, body, daysAgo]) => ({
                authorId: users[author],
                body,
                createdAt: ago(daysAgo, 2),
              })),
            },
          },
        });
      }
    }

    await prisma.message.createMany({
      data: input.messages.map(([author, body, days, hours]) => ({
        boardId: board.id,
        authorId: users[author],
        body,
        createdAt: ago(days, hours),
      })),
    });
    await prisma.activity.createMany({
      data: input.activity.map(([actor, text, days, hours]) => ({
        boardId: board.id,
        actorId: users[actor],
        text,
        createdAt: ago(days, hours),
      })),
    });
    return board;
  }

  const board = await createBoard({
    title: "Lanzamiento de producto",
    description: "Roadmap del lanzamiento del MVP",
    color: "#4F46E5",
    owner: "demo",
    members: ["ana", "carlos", "lucia"],
    createdDaysAgo: 21,
    lists: [
      {
        title: "Por hacer",
        cards: [
          { title: "Definir precios del plan Pro", by: "demo", due: 6, description: "Comparar con tres competidores y proponer dos opciones." },
          { title: "Configurar analítica", by: "demo", due: 9 },
          { title: "Preparar correo de lanzamiento", by: "lucia", due: 12, description: "Segmentar entre usuarios de la beta y lista de espera." },
          { title: "Traducir la landing al inglés", by: "ana" },
        ],
      },
      {
        title: "En progreso",
        cards: [
          {
            title: "Maquetar landing page",
            by: "ana",
            due: 2,
            description: "Usar la nueva paleta de marca y las capturas del producto.",
            comments: [
              ["demo", "La sección de precios puede esperar a que cerremos el plan Pro.", 3],
              ["ana", "Perfecto, dejo un bloque provisional y la conecto después.", 2],
            ],
          },
          {
            title: "Integrar autenticación",
            by: "carlos",
            due: 1,
            description: "Registro con correo y contraseña; recuperar contraseña en la siguiente iteración.",
            comments: [["carlos", "Login y registro listos, falta validar los errores en el formulario.", 1]],
          },
          { title: "Onboarding en tres pasos", by: "lucia", due: 5 },
        ],
      },
      {
        title: "En revisión",
        cards: [
          {
            title: "Diseñar wireframes",
            by: "ana",
            due: -1,
            comments: [
              ["lucia", "El flujo de invitación quedó muy claro.", 4],
              ["demo", "Aprobado por mi parte. Carlos, ¿lo revisas hoy?", 1],
            ],
          },
          { title: "Política de privacidad", by: "demo", due: 3 },
        ],
      },
      {
        title: "Hecho",
        cards: [
          { title: "Investigación de mercado", by: "demo", description: "Entrevistas con 12 equipos pequeños." },
          { title: "Definir alcance del MVP", by: "demo" },
          { title: "Elegir el stack técnico", by: "carlos" },
        ],
      },
    ],
    messages: [
      ["demo", "¡Buenos días! Hoy cerramos la revisión de wireframes.", 1, 5],
      ["ana", "La landing ya tiene la paleta nueva, os paso el enlace en un rato.", 1, 4],
      ["carlos", "Autenticación casi lista, mañana la subo a staging.", 1, 3],
      ["lucia", "Yo empiezo con el correo de lanzamiento.", 0, 6],
      ["demo", "Genial. Recordad mover las tarjetas al terminar para que el tablero esté al día.", 0, 5],
      ["ana", "👍", 0, 4],
    ],
    activity: [
      ["demo", "creó la lista «En revisión»", 20, 0],
      ["demo", "invitó a Ana Torres al tablero", 20, 1],
      ["demo", "invitó a Carlos Ruiz al tablero", 19, 0],
      ["demo", "invitó a Lucía Gómez al tablero", 19, 1],
      ["carlos", "movió «Elegir el stack técnico» a Hecho", 10, 0],
      ["demo", "movió «Definir alcance del MVP» a Hecho", 8, 0],
      ["ana", "movió «Diseñar wireframes» a En revisión", 4, 3],
      ["lucia", "comentó en «Diseñar wireframes»", 4, 2],
      ["ana", "comentó en «Maquetar landing page»", 2, 2],
      ["carlos", "comentó en «Integrar autenticación»", 1, 2],
      ["lucia", "creó la tarjeta «Preparar correo de lanzamiento»", 0, 6],
      ["demo", "comentó en «Diseñar wireframes»", 0, 3],
    ],
  });

  await createBoard({
    title: "Sitio web corporativo",
    description: "Rediseño del sitio y del blog",
    color: "#0EA5E9",
    owner: "ana",
    members: ["demo", "lucia"],
    createdDaysAgo: 12,
    lists: [
      { title: "Ideas", cards: [{ title: "Página de casos de éxito", by: "lucia" }, { title: "Calculadora de ahorro", by: "ana" }] },
      {
        title: "Diseño",
        cards: [
          { title: "Nueva página de inicio", by: "ana", due: 4 },
          { title: "Plantilla de artículo del blog", by: "lucia", due: 7 },
        ],
      },
      { title: "Publicado", cards: [{ title: "Página de contacto", by: "ana" }] },
    ],
    messages: [
      ["ana", "Subí los primeros bocetos de la página de inicio.", 2, 3],
      ["lucia", "Me encantan, el blog puede seguir el mismo estilo.", 2, 1],
    ],
    activity: [
      ["ana", "invitó a Cuenta Demo al tablero", 11, 0],
      ["ana", "movió «Página de contacto» a Publicado", 3, 0],
    ],
  });

  await createBoard({
    title: "Sprint 14: aplicación móvil",
    description: "Objetivo: notificaciones y modo sin conexión",
    color: "#F97316",
    owner: "demo",
    members: ["carlos"],
    createdDaysAgo: 6,
    lists: [
      {
        title: "Backlog",
        cards: [
          { title: "Notificaciones push", by: "carlos", due: 8 },
          { title: "Modo sin conexión", by: "demo", due: 10 },
        ],
      },
      { title: "En curso", cards: [{ title: "Pantalla de ajustes", by: "carlos", due: 2 }] },
      { title: "Terminado", cards: [{ title: "Corregir cierre al girar la pantalla", by: "carlos" }] },
    ],
    messages: [["carlos", "El fallo al girar la pantalla ya está corregido.", 1, 2]],
    activity: [["carlos", "movió «Corregir cierre al girar la pantalla» a Terminado", 1, 2]],
  });

  console.log(`Datos demo creados: usuario demo@kanbanflow.app, tablero "${board.title}" y 2 tableros más`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
