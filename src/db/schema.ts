import { relations } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, boolean, unique } from "drizzle-orm/pg-core";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  status: text("status").default("Available"), // Status update for customization
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// OtpToken Table
export const otpTokens = pgTable("otp_tokens", {
  id: serial("id").primaryKey(),
  email: text("email").notNull(),
  tokenHash: text("token_hash").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Friendship Table (with Composite Unique Constraint to prevent duplicates)
export const friendships = pgTable(
  "friendships",
  {
    id: serial("id").primaryKey(),
    senderId: integer("sender_id")
      .references(() => users.id)
      .notNull(),
    receiverId: integer("receiver_id")
      .references(() => users.id)
      .notNull(),
    status: text("status").notNull(), // PENDING, ACCEPTED, DECLINED, BLOCKED
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    unique("unique_friend_request").on(table.senderId, table.receiverId),
  ]
);

// Messages Table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id")
    .references(() => users.id)
    .notNull(),
  receiverId: integer("receiver_id")
    .references(() => users.id)
    .notNull(),
  contentType: text("content_type").notNull(), // TEXT, IMAGE, VOICE
  messageBody: text("message_body").notNull(),
  mediaUrl: text("media_url"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define Relations to ease querying
export const usersRelations = relations(users, ({ many }) => ({
  sentFriendships: many(friendships, { relationName: "sentFriendships" }),
  receivedFriendships: many(friendships, { relationName: "receivedFriendships" }),
  sentMessages: many(messages, { relationName: "sentMessages" }),
  receivedMessages: many(messages, { relationName: "receivedMessages" }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  sender: one(users, {
    fields: [friendships.senderId],
    references: [users.id],
    relationName: "sentFriendships",
  }),
  receiver: one(users, {
    fields: [friendships.receiverId],
    references: [users.id],
    relationName: "receivedFriendships",
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sentMessages",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receivedMessages",
  }),
}));
