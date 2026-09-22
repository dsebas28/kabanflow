export type BoardSummary = {
  id: string;
  title: string;
  description: string | null;
  color: string;
  updatedAt: string;
  owner: { id: string; name: string; avatarColor: string };
  members: { id: string; user: { id: string; name: string; avatarColor: string } }[];
  cardCount: number;
  doneCount: number;
  _count: { lists: number; members: number };
};

export type MemberUser = { id: string; name: string; email: string; avatarColor: string };

export type CardModel = {
  id: string;
  title: string;
  description: string | null;
  position: number;
  dueDate: string | null;
  listId: string;
  createdAt: string;
  updatedAt: string;
  creator: { id: string; name: string; avatarColor: string };
  _count?: { attachments: number; comments: number };
};

export type ListModel = {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: CardModel[];
};

export type BoardMemberModel = {
  id: string;
  role: "OWNER" | "MEMBER";
  user: MemberUser;
};

export type BoardDetail = {
  id: string;
  title: string;
  description: string | null;
  color: string;
  ownerId: string;
  owner: { id: string; name: string; avatarColor: string };
  members: BoardMemberModel[];
  lists: ListModel[];
};

export type CommentModel = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; avatarColor: string };
};

export type PersonRef = { id: string; name: string; avatarColor: string };

export type AttachmentModel = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  createdAt: string;
  cardId: string;
  uploader: PersonRef;
  card?: { title: string };
};

export type ChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  author: PersonRef;
};

export type ActivityItem = {
  id: string;
  text: string;
  createdAt: string;
  actor: PersonRef;
};
