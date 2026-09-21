"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const instance = io({ path: "/api/socket" });
    // Opening the connection is an unavoidable side effect of mounting this
    // provider, and consumers need to know once it's ready — there's no
    // external store to subscribe to here, just this one connection.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSocket(instance);

    return () => {
      instance.disconnect();
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
