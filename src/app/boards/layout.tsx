import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import AppShell from "@/components/app/AppShell";

export default async function BoardsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <AppShell
      user={{
        id: session.user.id,
        name: session.user.name ?? "Sin nombre",
        email: session.user.email ?? "",
        color: session.user.image ?? "#7c3aed",
      }}
    >
      {children}
    </AppShell>
  );
}
