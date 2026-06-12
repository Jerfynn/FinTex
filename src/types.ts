// TS shared interfaces

export type Screen = "LOGIN" | "VERIFY_OTP" | "CREATE_PROFILE" | "CHATS" | "CHAT_WINDOW" | "FRIENDS" | "SETTINGS" | "CONTACT_INFO" | "PRIVACY" | "NOTIFICATIONS" | "HELP" | "SELECT_CONTACT";

export interface User {
  id: number;
  fullName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface OTPToken {
  id: number;
  email: string;
  tokenHash: string;
  expiresAt: string;
  verified: boolean;
  createdAt: string;
}

export interface Friendship {
  id: number;
  senderId: number;
  receiverId: number;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "BLOCKED";
  createdAt?: string;
  updatedAt?: string;
  // Dynamic joins filled mock or backend
  fullName?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  contentType: "TEXT" | "IMAGE" | "VOICE";
  messageBody: string;
  mediaUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  type: "MESSAGE" | "FRIEND_REQUEST";
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
}
