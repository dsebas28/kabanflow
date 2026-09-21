import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";
import Avatar from "@/components/Avatar";

export default async function BoardsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <Link href="/boards">
            <Logo size={28} />
          </Link>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <Avatar name={session.user.name ?? session.user.email ?? "?"} color={session.user.image ?? "#7c3aed"} size={30} />
              <span className="hidden text-sm font-semibold sm:inline">{session.user.name}</span>
            </div>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
