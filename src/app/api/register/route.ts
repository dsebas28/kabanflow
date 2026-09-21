import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validation";

const AVATAR_COLORS = ["#4F46E5", "#10B981", "#0EA5E9", "#F59E0B", "#EF4444", "#8B5CF6"];

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "Ya existe una cuenta con ese correo" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, passwordHash, avatarColor },
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ user }, { status: 201 });
}
