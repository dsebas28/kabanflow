import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Mínimo 2 caracteres").max(60),
  email: z.string().trim().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

export const createBoardSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(80),
  description: z.string().trim().max(280).optional(),
  color: z.string().trim().optional(),
});

export const updateBoardSchema = createBoardSchema.partial();

export const createListSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(60),
});

export const updateListSchema = z.object({
  title: z.string().trim().min(1).max(60).optional(),
  position: z.number().int().min(0).optional(),
});

export const createCardSchema = z.object({
  title: z.string().trim().min(1, "El título es obligatorio").max(120),
  description: z.string().trim().max(2000).optional(),
});

export const updateCardSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  dueDate: z.string().datetime().nullable().optional(),
  listId: z.string().cuid().optional(),
  position: z.number().int().min(0).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().trim().email("Correo inválido"),
});

export const createCommentSchema = z.object({
  body: z.string().trim().min(1, "Escribe algo").max(1000),
});

export const reorderSchema = z.object({
  lists: z
    .array(
      z.object({
        id: z.string().cuid(),
        cardIds: z.array(z.string().cuid()),
      }),
    )
    .min(1)
    .max(2),
});
