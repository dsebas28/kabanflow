"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { ActivityItem, AttachmentModel, ChatMessage } from "@/types/models";

export type PanelTab = "chat" | "activity" | "files";

type Options = {
  boardId: string;
  currentUser: { id: string; name: string };
  socket: Socket | null;
  panelOpen: boolean;
  tab: PanelTab;
};

const TYPING_TTL = 3500;

const byId = <T extends { id: string }>(list: T[], item: T) => (list.some((x) => x.id === item.id) ? list : [...list, item]);

/**
 * Everything the board's side panel shows: chat, activity log and shared
 * files. History loads the first time the panel opens; live socket events
 * keep it current afterwards, and chat messages that arrive while the panel
 * is closed count as unread.
 */
export function useBoardPanel({ boardId, currentUser, socket, panelOpen, tab }: Options) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [files, setFiles] = useState<AttachmentModel[]>([]);
  const [typing, setTyping] = useState<Record<string, { name: string; at: number }>>({});
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadedRef = useRef(false);
  const viewingChatRef = useRef(false);
  const lastTypingEmit = useRef(0);

  useEffect(() => {
    viewingChatRef.current = panelOpen && tab === "chat";
  }, [panelOpen, tab]);

  // First open: fetch history for all three tabs at once.
  useEffect(() => {
    if (!panelOpen || loadedRef.current) return;
    loadedRef.current = true;
    let cancelled = false;
     
    setLoading(true);
    Promise.all([
      fetch(`/api/boards/${boardId}/messages`).then((r) => (r.ok ? r.json() : { messages: [] })),
      fetch(`/api/boards/${boardId}/activity`).then((r) => (r.ok ? r.json() : { activities: [] })),
      fetch(`/api/boards/${boardId}/files`).then((r) => (r.ok ? r.json() : { files: [] })),
    ]).then(([m, a, f]) => {
      if (cancelled) return;
      setMessages((prev) => {
        const merged = [...m.messages];
        prev.forEach((p) => {
          if (!merged.some((x: ChatMessage) => x.id === p.id)) merged.push(p);
        });
        return merged;
      });
      setActivities((prev) => {
        const merged = [...a.activities];
        prev.forEach((p) => {
          if (!merged.some((x: ActivityItem) => x.id === p.id)) merged.unshift(p);
        });
        return merged;
      });
      setFiles(f.files);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [panelOpen, boardId]);

  useEffect(() => {
    if (!socket) return;

    const onMessage = ({ message }: { message: ChatMessage }) => {
      setMessages((prev) => byId(prev, message));
      setTyping((prev) => {
        if (!prev[message.author.id]) return prev;
        const next = { ...prev };
        delete next[message.author.id];
        return next;
      });
      if (message.author.id !== currentUser.id && !viewingChatRef.current) setUnread((n) => n + 1);
    };
    const onTyping = (user: { id: string; name: string }) => {
      setTyping((prev) => ({ ...prev, [user.id]: { name: user.name, at: Date.now() } }));
    };
    const onActivity = ({ activity }: { activity: ActivityItem }) => {
      setActivities((prev) => (prev.some((x) => x.id === activity.id) ? prev : [activity, ...prev]));
    };
    const onFileAdded = ({ attachment }: { attachment: AttachmentModel }) => {
      setFiles((prev) => (prev.some((x) => x.id === attachment.id) ? prev : [attachment, ...prev]));
    };
    const onFileDeleted = ({ attachmentId }: { attachmentId: string }) => {
      setFiles((prev) => prev.filter((f) => f.id !== attachmentId));
    };

    socket.on("chat:message", onMessage);
    socket.on("chat:typing", onTyping);
    socket.on("activity:new", onActivity);
    socket.on("attachment:added", onFileAdded);
    socket.on("attachment:deleted", onFileDeleted);
    return () => {
      socket.off("chat:message", onMessage);
      socket.off("chat:typing", onTyping);
      socket.off("activity:new", onActivity);
      socket.off("attachment:added", onFileAdded);
      socket.off("attachment:deleted", onFileDeleted);
    };
  }, [socket, currentUser.id]);

  // Drop stale "is typing" entries.
  useEffect(() => {
    const id = setInterval(() => {
      setTyping((prev) => {
        const now = Date.now();
        const keys = Object.keys(prev);
        if (keys.every((k) => now - prev[k].at < TYPING_TTL)) return prev;
        const next: typeof prev = {};
        keys.forEach((k) => {
          if (now - prev[k].at < TYPING_TTL) next[k] = prev[k];
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const sendMessage = useCallback(
    async (body: string) => {
      const text = body.trim();
      if (!text) return false;
      setSending(true);
      const res = await fetch(`/api/boards/${boardId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      setSending(false);
      if (!res.ok) return false;
      const data = await res.json();
      setMessages((prev) => byId(prev, data.message));
      return true;
    },
    [boardId],
  );

  const notifyTyping = useCallback(() => {
    if (!socket) return;
    const now = Date.now();
    if (now - lastTypingEmit.current < 1500) return;
    lastTypingEmit.current = now;
    socket.emit("chat:typing", { boardId, user: { id: currentUser.id, name: currentUser.name } });
  }, [socket, boardId, currentUser.id, currentUser.name]);

  const removeFile = useCallback(async (id: string) => {
    const res = await fetch(`/api/attachments/${id}`, { method: "DELETE" });
    if (res.ok) setFiles((prev) => prev.filter((f) => f.id !== id));
    return res.ok;
  }, []);

  const markRead = useCallback(() => setUnread(0), []);

  const typingNames = Object.entries(typing)
    .filter(([id]) => id !== currentUser.id)
    .map(([, v]) => v.name);

  return { messages, activities, files, typingNames, unread, loading, sending, sendMessage, notifyTyping, removeFile, markRead };
}
