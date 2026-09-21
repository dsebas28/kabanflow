"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "@/context/SocketContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SocketProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--color-surface)",
              color: "var(--color-ink)",
              border: "1px solid var(--color-border)",
              borderRadius: "0.75rem",
              fontSize: "0.875rem",
            },
          }}
        />
      </SocketProvider>
    </SessionProvider>
  );
}
