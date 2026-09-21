"use client";

import { createContext, useContext, type ReactNode } from "react";

export type AppUser = { id: string; name: string; email: string; color: string };

const UserContext = createContext<AppUser | null>(null);

export function UserProvider({ user, children }: { user: AppUser; children: ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser(): AppUser {
  const user = useContext(UserContext);
  if (!user) throw new Error("useUser must be used inside <UserProvider>");
  return user;
}
