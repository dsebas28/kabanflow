# Guía del código

Recorrido por el código de KanbanFlow para entender cómo está construido. Los fragmentos son copias literales del repositorio; los comentarios del código están en inglés y la explicación en español.

## Contenido

1. [Cómo está organizado](#1-cómo-está-organizado)
2. [Un servidor para Next.js y Socket.io](#2-un-servidor-para-nextjs-y-socketio)
3. [Autenticación](#3-autenticación)
4. [Quién puede entrar a un tablero](#4-quién-puede-entrar-a-un-tablero)
5. [El recorrido de una petición](#5-el-recorrido-de-una-petición)
6. [Arrastrar y soltar en tiempo real](#6-arrastrar-y-soltar-en-tiempo-real)
7. [Historial, chat y presencia](#7-historial-chat-y-presencia)
8. [Archivos adjuntos seguros](#8-archivos-adjuntos-seguros)
9. [Frontend](#9-frontend)
10. [Tests](#10-tests)

## 1. Cómo está organizado

```
server.ts               Servidor HTTP propio: Next.js y Socket.io en el mismo proceso
prisma/
  schema.prisma         Modelo de datos (9 tablas en PostgreSQL)
  seed.ts               Datos de la demo: 4 personas, 3 tableros, comentarios, chat e historial
src/
  app/                  Páginas (App Router): inicio, login, registro, tableros
    api/                Rutas de la API REST: boards, lists, cards, comments, attachments, register
  components/           Interfaz: board/ (columnas, tarjetas, panel), app/ (layout), home/ (portada)
  context/              SocketContext (una sola conexión por pestaña) y UserContext
  hooks/                useBoardPanel (chat, actividad, archivos), useTheme, useNow
  lib/                  prisma, auth, validación con zod, acceso a tableros, socket, actividad, subidas
  proxy.ts              Protege /boards: sin sesión, redirige al login
```

## 2. Un servidor para Next.js y Socket.io

Socket.io necesita un proceso que mantenga abiertas las conexiones WebSocket, algo que no encaja con funciones serverless de vida corta. Por eso `server.ts` crea un servidor HTTP propio, le pasa las peticiones normales a Next.js y le conecta Socket.io:

```ts
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
```

- Cada tablero es una **sala** (`board:{id}`). Quien abre un tablero se une a su sala y solo recibe los eventos de ese tablero.
- Como las rutas de la API corren en el mismo proceso, comparten la instancia de Socket.io a través de un módulo (`src/lib/socket.ts`):

```ts
export function emitToBoard(boardId: string, event: string, payload: unknown) {
  io?.to(`board:${boardId}`).emit(event, payload);
}
```

Cualquier ruta que cambie algo (crear una tarjeta, mover, comentar) llama a `emitToBoard` y todos los que tienen el tablero abierto lo ven al instante.

## 3. Autenticación

Auth.js (NextAuth v5) con usuario y contraseña (`src/lib/auth.ts`):

```ts
async authorize(credentials) {
  const email = credentials?.email;
  const password = credentials?.password;
  if (typeof email !== "string" || typeof password !== "string") return null;

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return { id: user.id, name: user.name, email: user.email, image: user.avatarColor };
},
```

- Las contraseñas se guardan cifradas con **bcrypt**, nunca en texto plano.
- La sesión es un **JWT** firmado con `AUTH_SECRET`; el id del usuario viaja dentro del token.
- `src/proxy.ts` protege todas las rutas `/boards`: sin sesión, redirige a `/login?from=...` para volver después a donde estabas.

## 4. Quién puede entrar a un tablero

Una sola función decide el acceso, y la usan todas las rutas de la API (`src/lib/boardAccess.ts`):

```ts
export async function getBoardAccess(boardId: string, userId: string): Promise<BoardAccess> {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    select: {
      ownerId: true,
      members: { where: { userId }, select: { role: true } },
    },
  });

  if (!board) return { allowed: false, role: null };
  if (board.ownerId === userId) return { allowed: true, role: "OWNER" };
  if (board.members.length > 0) return { allowed: true, role: board.members[0].role };
  return { allowed: false, role: null };
}
```

Una sola consulta trae el propietario y, si existe, la fila de `BoardMember` de esa persona. Tener la regla en un único lugar evita que una ruta nueva se olvide de comprobar el acceso.

## 5. El recorrido de una petición

Todas las rutas de la API siguen los mismos pasos, en el mismo orden:

```
1. auth()                 ¿Hay sesión?                    → si no, 401
2. getBoardAccess()       ¿Puede entrar a este tablero?   → si no, 403
3. schema.safeParse()     ¿Los datos son válidos? (zod)   → si no, 400 con el mensaje
4. prisma...              Guardar en PostgreSQL
5. emitToBoard()          Avisar a todos los conectados
6. logActivity()          Dejar constancia en el historial
```

La validación usa **zod** (`src/lib/validation.ts`), con los mensajes de error ya en español:

```ts
export const createCardSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(120),
  description: z.string().trim().max(2000).optional(),
});
```

## 6. Arrastrar y soltar en tiempo real

1. Quien arrastra una tarjeta ve el cambio **al instante**: el cliente actualiza su estado local sin esperar al servidor (actualización optimista).
2. Al soltar, envía `POST /api/boards/:id/reorder` con el orden final de las listas afectadas (una si se reordena dentro de la misma lista, dos si la tarjeta cambió de lista).
3. El servidor comprueba que esas listas y tarjetas **pertenecen a ese tablero** (nadie puede mover tarjetas de otro tablero cambiando ids) y guarda todo en una transacción:

```ts
await prisma.$transaction(
  parsed.data.lists.flatMap((list) =>
    list.cardIds.map((cardId, index) =>
      prisma.card.update({ where: { id: cardId }, data: { listId: list.id, position: index } }),
    ),
  ),
);

emitToBoard(boardId, "board:reordered", { lists: parsed.data.lists, movedBy: session.user.id });
```

4. Emite `board:reordered` a toda la sala, **incluido quien movió la tarjeta**, para que el estado termine siendo idéntico en todas las pantallas.

Reescribir las posiciones completas de las listas afectadas es más simple y menos propenso a errores que desplazar posiciones una a una.

## 7. Historial, chat y presencia

- **Historial**: `logActivity` (`src/lib/activity.ts`) guarda una línea en `Activity` y la envía por WebSocket en el mismo paso, así la pestaña Actividad se actualiza sola.
- **Chat**: los mensajes se guardan en `Message` y se emiten a la sala; el evento `chat:typing` muestra quién está escribiendo.
- **Presencia**: los avatares de la cabecera muestran quién tiene el tablero abierto en ese momento (`presence:update`).
- En el cliente, `BoardView.tsx` se suscribe a todos los eventos (`card:created`, `card:updated`, `board:reordered`, `comment:created`...) y actualiza su estado con cada uno.

## 8. Archivos adjuntos seguros

Subir archivos es una puerta de entrada clásica de ataques, así que `src/lib/uploads.ts` aplica varias capas:

- Lista blanca de tipos (imágenes, PDF, Office, texto, ZIP) y **máximo 5 MB**.
- El tipo que declara el navegador no se cree: las imágenes se comprueban por sus **bytes mágicos** (las primeras bytes del archivo):

```ts
export function looksLikeImage(mime: string, bytes: Uint8Array): boolean {
  const starts = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  switch (mime) {
    case "image/png":
      return starts(0x89, 0x50, 0x4e, 0x47);
    case "image/jpeg":
      return starts(0xff, 0xd8, 0xff);
```

- El archivo se guarda con un **nombre generado**, nunca con el que envió el usuario, y la extensión se limita a letras y números para que no pueda contener rutas (`../`).
- Todo lo que no es imagen se sirve como **descarga forzada**, nunca se abre en el navegador.

## 9. Frontend

- **Next.js 16 (App Router) + React 19 + TypeScript**, estilos con **Tailwind CSS v4**.
- Arrastrar y soltar con **@dnd-kit**; animaciones con **Framer Motion** (respetando `prefers-reduced-motion`).
- `SocketContext` abre **una sola conexión** de Socket.io por pestaña y la comparte con todos los componentes.
- Paleta de comandos con `Ctrl + K` para saltar entre tableros y acciones.
- Modo oscuro guardado en `localStorage` y aplicado con un script antes de pintar la página, para que no parpadee al cargar.

## 10. Tests

**Vitest + Testing Library** (`npm test`):

| Archivo | Qué prueba |
|---|---|
| `src/lib/boardAccess.test.ts` | Propietario, miembro y persona ajena: quién puede entrar a un tablero |
| `src/lib/validation.test.ts` | Los esquemas de zod aceptan lo válido y rechazan lo inválido con su mensaje |
| `src/components/Avatar.test.tsx` | El componente de avatar (iniciales y color) |
| `src/components/auth/PasswordStrength.test.tsx` | El medidor de fortaleza de la contraseña del registro |

```bash
npm test          # toda la suite
npm run lint      # ESLint
```
