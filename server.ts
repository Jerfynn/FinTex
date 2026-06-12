import express from "express";
import path from "path";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Main Database Client & Schema
import { db, ensureSchema } from "./src/db/index.ts";
import { users, otpTokens, friendships, messages } from "./src/db/schema.ts";
import { eq, or, and, ne, asc, desc } from "drizzle-orm";

dotenv.config({ path: ".env.local" });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Setup Socket.io Server globally so it's visible in endpoints
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Use helmet for security but disable contentSecurityPolicy in dev so Vite preview loads.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "chatapp_default_secret_key_123_456_789";

// JWT Authentication Types & Helper
export interface DecodedUser {
  userId: number;
  email: string;
}

// Extends Request context
export interface AuthRequest extends express.Request {
  user?: DecodedUser;
}

// Middleware to secure API routes
const authenticateToken = (
  req: AuthRequest,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// ==========================================
// MODULE 2: AUTHENTICATION API (Email & OTP Flow)
// ==========================================

// Helper to generate 6-digit numeric string
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Helper to hash standard values
function hashText(text: string): string {
  return crypto.createHash("sha256").update(text).digest("hex");
}

/**
 * POST /api/auth/send-otp
 * Accepts an `email`. Validate email syntax.
 */
app.post("/api/auth/send-otp", async (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Email address is required" });
  }

  // Basic email syntax validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email address format" });
  }

  try {
    const otp = generateOTP();
    const tokenHash = hashText(otp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    // Save hashed version of the OTP with status active
    await db.insert(otpTokens).values({
      email,
      tokenHash,
      expiresAt,
      verified: false,
    });

    // Mock/Setup Console Nodemailer Stub
    console.log(`\n========================================`);
    console.log(`✉️  [Nodemailer Setup Stub] SENDING OTP`);
    console.log(`To: ${email}`);
    console.log(`Subject: FinTex Verification Code`);
    console.log(`Code: ${otp}`);
    console.log(`Expires in: 5 minutes`);
    console.log(`========================================\n`);

    return res.json({
      success: true,
      message: "OTP sent successfully! Please check your server console log.",
      debugOtp: otp, // Return for ease of use in UI preview
    });
  } catch (error) {
    console.error("Error in /api/auth/send-otp:", error);
    return res.status(500).json({ error: "Failed to process OTP request" });
  }
});

/**
 * POST /api/auth/verify-otp
 * Accepts `email` and the 6-digit `otp`.
 * Compares securely, checks expiration, issues JWT, reports if isNewUser.
 */
app.post("/api/auth/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP code are required" });
  }

  try {
    const hashedOtp = hashText(otp.toString().trim());

    // Pull unverified OTPs matching email
    const tokens = await db
      .select()
      .from(otpTokens)
      .where(and(eq(otpTokens.email, email), eq(otpTokens.verified, false)))
      .orderBy(desc(otpTokens.createdAt));

    if (tokens.length === 0) {
      return res.status(400).json({ error: "No OTP requests found for this email" });
    }

    const latestToken = tokens[0];

    // Check expiration
    if (new Date() > latestToken.expiresAt) {
      return res.status(400).json({ error: "OTP code has expired (5-minute limit)" });
    }

    // Compare hashes securely
    if (latestToken.tokenHash !== hashedOtp) {
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Mark OTP token as used/verified
    await db
      .update(otpTokens)
      .set({ verified: true })
      .where(eq(otpTokens.id, latestToken.id));

    // Check if user already exists
    let userRecords = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    let user;
    let isNewUser = false;

    if (userRecords.length === 0) {
      // Create lazy profile stub for new user
      const inserted = await db
        .insert(users)
        .values({
          email,
          fullName: "",
          bio: "",
          avatarUrl: "",
          phoneNumber: "",
        })
        .returning();
      user = inserted[0];
      isNewUser = true;
    } else {
      user = userRecords[0];
      // A user is "unfulfilled" if they haven't filled in fullName
      if (!user.fullName || user.fullName.trim() === "") {
        isNewUser = true;
      }
    }

    // Sign JWT tracking session data
    const jwtPayload: DecodedUser = {
      userId: user.id,
      email: user.email,
    };
    const token = jwt.sign(jwtPayload, JWT_SECRET, { expiresIn: "7d" });

    return res.json({
      success: true,
      token,
      isNewUser,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        phoneNumber: user.phoneNumber,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Error in /api/auth/verify-otp:", error);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// ==========================================
// MODULE 3: ONBOARDING & PROFILE MANAGEMENT API
// ==========================================

/**
 * POST /api/profile/create
 * Writes or updates the logged-in user inside the database.
 */
app.post("/api/profile/create", authenticateToken, async (req: AuthRequest, res) => {
  const { fullName, bio, avatarUrl, phoneNumber, status } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const updated = await db
      .update(users)
      .set({
        fullName: fullName || "",
        bio: bio || "",
        avatarUrl: avatarUrl || "",
        phoneNumber: phoneNumber || null,
        status: status || "Available",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (updated.length === 0) {
      return res.status(404).json({ error: "User profile not found" });
    }

    return res.json({
      success: true,
      user: updated[0],
    });
  } catch (error) {
    console.error("Error in /api/profile/create:", error);
    return res.status(500).json({ error: "Failed to update profile details" });
  }
});

/**
 * GET /api/profile/me
 */
app.get("/api/profile/me", authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const records = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (records.length === 0) {
      return res.status(404).json({ error: "Profile not found" });
    }

    return res.json(records[0]);
  } catch (error) {
    console.error("Error in /api/profile/me:", error);
    return res.status(500).json({ error: "Database retrieval failed" });
  }
});

// ==========================================
// MODULE 4: FRIEND REQUESTS & SOCIAL SYSTEM API
// ==========================================

/**
 * POST /api/friends/request
 * Accepts `receiverId` or `receiverEmail`.
 */
app.post("/api/friends/request", authenticateToken, async (req: AuthRequest, res) => {
  const { receiverId, receiverEmail } = req.body;
  const senderId = req.user?.userId;

  if (!senderId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    let finalReceiverId: number;

    if (receiverId) {
      finalReceiverId = Number(receiverId);
    } else if (receiverEmail) {
      const records = await db
        .select()
        .from(users)
        .where(eq(users.email, receiverEmail.trim().toLowerCase()));

      if (records.length === 0) {
        return res.status(404).json({ error: "User with this email not found" });
      }
      finalReceiverId = records[0].id;
    } else {
      return res.status(400).json({ error: "receiverId or receiverEmail is required" });
    }

    // Automatically prevent sending requests to oneself
    if (senderId === finalReceiverId) {
      return res.status(400).json({ error: "You cannot send a friend request to yourself" });
    }

    // Check if relationships exist
    const existing = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.senderId, senderId), eq(friendships.receiverId, finalReceiverId)),
          and(eq(friendships.senderId, finalReceiverId), eq(friendships.receiverId, senderId))
        )
      );

    if (existing.length > 0) {
      const status = existing[0].status;
      if (status === "ACCEPTED") {
        return res.status(400).json({ error: "You are already friends with this user" });
      }
      return res.status(400).json({ error: `An active request status ${status} already exists` });
    }

    // Creates a PENDING relationship
    const result = await db
      .insert(friendships)
      .values({
        senderId,
        receiverId: finalReceiverId,
        status: "PENDING",
      })
      .returning();

    // Trigger Socket Notification if receiver is live
    const receiverSocketId = activeConnections.get(finalReceiverId);
    if (receiverSocketId) {
      const activeSender = await db.select().from(users).where(eq(users.id, senderId));
      io.to(receiverSocketId).emit("incomingFriendRequest", {
        friendship: result[0],
        sender: activeSender[0],
      });
    }

    return res.json({
      success: true,
      friendship: result[0],
    });
  } catch (error) {
    console.error("Error in /api/friends/request:", error);
    return res.status(500).json({ error: "Failed to process friend request" });
  }
});

/**
 * POST /api/friends/respond
 * Accepts `friendshipId` and `action` (ACCEPTED, DECLINED, BLOCKED).
 */
app.post("/api/friends/respond", authenticateToken, async (req: AuthRequest, res) => {
  const { friendshipId, action } = req.body;
  const currentUserId = req.user?.userId;

  if (!currentUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!friendshipId || !["ACCEPTED", "DECLINED", "BLOCKED"].includes(action)) {
    return res.status(400).json({ error: "Valid friendshipId and action is required" });
  }

  try {
    const relationship = await db
      .select()
      .from(friendships)
      .where(eq(friendships.id, Number(friendshipId)));

    if (relationship.length === 0) {
      return res.status(404).json({ error: "Friendship item not found" });
    }

    const item = relationship[0];

    // Validate that the active user is the *receiver* of that specific pending friendship item
    if (item.receiverId !== currentUserId) {
      return res.status(403).json({ error: "Only the recipient can respond to pending requests" });
    }

    // Update status accordingly
    const updated = await db
      .update(friendships)
      .set({
        status: action,
        updatedAt: new Date(),
      })
      .where(eq(friendships.id, item.id))
      .returning();

    // Trigger socket notifications to sender if live
    const senderSocketId = activeConnections.get(item.senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("friendRequestResponse", {
        friendship: updated[0],
        responderEmail: req.user?.email,
      });
    }

    return res.json({
      success: true,
      friendship: updated[0],
    });
  } catch (error) {
    console.error("Error in /api/friends/respond:", error);
    return res.status(500).json({ error: "Failed to respond to friend request" });
  }
});

/**
 * GET /api/friends/pending
 * Fetches incoming and outgoing pending request details.
 */
app.get("/api/friends/pending", authenticateToken, async (req: AuthRequest, res) => {
  const currentUserId = req.user?.userId;
  if (!currentUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Pull pending requests where recipient is the current logical user
    const pendingIncoming = await db
      .select({
        id: friendships.id,
        status: friendships.status,
        createdAt: friendships.createdAt,
        userId: users.id,
        fullName: users.fullName,
        email: users.email,
        bio: users.bio,
        avatarUrl: users.avatarUrl,
      })
      .from(friendships)
      .innerJoin(users, eq(friendships.senderId, users.id))
      .where(and(eq(friendships.receiverId, currentUserId), eq(friendships.status, "PENDING")));

    return res.json(pendingIncoming);
  } catch (error) {
    console.error("Error in /api/friends/pending:", error);
    return res.status(500).json({ error: "Database retrieval failed" });
  }
});

/**
 * GET /api/friends/list
 * Lists all users where a friendship status equals ACCEPTED (ordered alphabetically by name).
 */
app.get("/api/friends/list", authenticateToken, async (req: AuthRequest, res) => {
  const currentUserId = req.user?.userId;
  if (!currentUserId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Select all user rows linked as friends
    const acceptedRelations = await db
      .select({
        friendshipId: friendships.id,
        senderId: friendships.senderId,
        receiverId: friendships.receiverId,
      })
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "ACCEPTED"),
          or(eq(friendships.senderId, currentUserId), eq(friendships.receiverId, currentUserId))
        )
      );

    const friendIds = acceptedRelations.map((rel) =>
      rel.senderId === currentUserId ? rel.receiverId : rel.senderId
    );

    if (friendIds.length === 0) {
      return res.json([]);
    }

    // Select actual user details
    const list = await db
      .select()
      .from(users)
      .where(or(...friendIds.map((id) => eq(users.id, id))))
      .orderBy(asc(users.fullName));

    return res.json(list);
  } catch (error) {
    console.error("Error in /api/friends/list:", error);
    return res.status(500).json({ error: "Database retrieval failed" });
  }
});

// To easily facilitate demos, let's establish a search list of all users
app.get("/api/users/search", authenticateToken, async (req: AuthRequest, res) => {
  const query = req.query.q ? String(req.query.q).toLowerCase() : "";
  const currentUserId = req.user?.userId;

  try {
    const list = await db
      .select()
      .from(users)
      .where(ne(users.id, currentUserId || 0));

    const filtered = list.filter(
      (u) =>
        (u.fullName && u.fullName.toLowerCase().includes(query)) ||
        u.email.toLowerCase().includes(query)
    );

    return res.json(filtered);
  } catch (error) {
    return res.status(500).json({ error: "Search failed" });
  }
});

// ==========================================
// MODULE 5: REAL-TIME MESSAGING API & CHAT CORE
// ==========================================

/**
 * GET /api/messages/:friendId
 * Fetches historic conversations, updates unread statuses.
 */
app.get("/api/messages/:friendId", authenticateToken, async (req: AuthRequest, res) => {
  const currentUserId = req.user?.userId;
  const friendId = Number(req.params.friendId);

  if (!currentUserId || !friendId) {
    return res.status(401).json({ error: "Valid authentication/friend identifier is required" });
  }

  try {
    // 1. Mark incoming unread messages as read
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.senderId, friendId),
          eq(messages.receiverId, currentUserId),
          eq(messages.isRead, false)
        )
      );

    // 2. Fetch historic direct conversations
    const chats = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.senderId, currentUserId), eq(messages.receiverId, friendId)),
          and(eq(messages.senderId, friendId), eq(messages.receiverId, currentUserId))
        )
      )
      .orderBy(asc(messages.createdAt));

    // Also notify sender over socket that messages were read
    const senderSocketId = activeConnections.get(friendId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("messageReadStatusUpdate", {
        readerId: currentUserId,
        senderId: friendId,
      });
    }

    return res.json(chats);
  } catch (error) {
    console.error("Error in /api/messages/:friendId:", error);
    return res.status(500).json({ error: "Failed to grab historic messages" });
  }
});

// ==========================================
// Socket.io Connection & Authenticated Client Management
// ==========================================

// Maps `userId -> socketId`
const activeConnections = new Map<number, string>();

io.on("connection", (socket: Socket) => {
  console.log(`🔌 Local socket connection initialized: ${socket.id}`);

  // Authenticate socket connections using JWT values
  let token = socket.handshake.auth?.token || socket.handshake.query?.token;

  if (Array.isArray(token)) {
    token = token[0];
  }

  let loggedInUser: DecodedUser | null = null;
  if (token) {
    try {
      loggedInUser = jwt.verify(token, JWT_SECRET) as DecodedUser;
      activeConnections.set(loggedInUser.userId, socket.id);
      console.log(`👤 Verified user #${loggedInUser.userId} attached key to Socket: ${socket.id}`);
    } catch (err) {
      console.error("Socket authentication verified failure:", err);
      socket.disconnect(true);
      return;
    }
  }

  // Handle incoming message events
  socket.on("sendMessage", async (data: { receiverId: number; contentType: string; messageBody: string; mediaUrl?: string }) => {
    if (!loggedInUser) {
      socket.emit("error", { message: "Unauthenticated" });
      return;
    }

    const { receiverId, contentType, messageBody, mediaUrl } = data;
    if (!receiverId || !contentType || !messageBody) {
      socket.emit("error", { message: "Invalid payload params" });
      return;
    }

    try {
      // Save direct message in postgres
      const result = await db
        .insert(messages)
        .values({
          senderId: loggedInUser.userId,
          receiverId: Number(receiverId),
          contentType,
          messageBody,
          mediaUrl: mediaUrl || null,
          isRead: false,
        })
        .returning();

      const savedMsg = result[0];

      // Dispatch to source sender tab
      socket.emit("incomingMessage", savedMsg);

      // Verify and dispatch real-time events to live destination tag
      const recipientSocketId = activeConnections.get(Number(receiverId));
      if (recipientSocketId) {
        io.to(recipientSocketId).emit("incomingMessage", savedMsg);
        console.log(`🚀 Route real-time message to live recipient Socket: ${recipientSocketId}`);
      } else {
        console.log(`📥 Recipient for message is offline. Cached safely inside Postgres database.`);
      }
    } catch (error) {
      console.error("Database query sendMessage failure:", error);
      socket.emit("error", { message: "Direct message database push failed" });
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    if (loggedInUser) {
      activeConnections.delete(loggedInUser.userId);
      console.log(`❌ Secured socket detached for user #${loggedInUser.userId}`);
    } else {
      console.log(`❌ Detached anonymous connection Socket: ${socket.id}`);
    }
  });
});

// Configure Vite integration or static file rendering
const startServer = async () => {
  await ensureSchema();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite middlewares after custom API routes
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 FinTex Fullstack Backend Live on http://0.0.0.0:${PORT}`);
  });
};

// Handle body parser size errors gracefully
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof Error && err.name === "PayloadTooLargeError") {
    return res.status(413).json({ error: "Payload too large. Please send a smaller request." });
  }
  next(err);
});

startServer().catch((error) => {
  console.error("Local fullstack server failed to boot:", error);
});
