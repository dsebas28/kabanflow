"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="btn-ghost !p-2" aria-label="Cerrar sesión">
      <LogOut className="h-4 w-4" />
    </button>
  );
}
