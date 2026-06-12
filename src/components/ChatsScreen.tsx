import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  CheckCheck,
  MoreVertical,
  Plus,
  RefreshCw,
  Clock,
  Menu,
  MessageCircle,
  BellRing,
  Bookmark,
  Sparkles,
  SearchCode,
  Wifi,
  Radio,
  FileCheck,
} from "lucide-react";
import { User, Message } from "../types";

interface ChatsScreenProps {
  token: string;
  currentUser: User;
  friends: User[];
  onSelectFriend: (friend: User) => void;
  onOpenSelectContact: () => void;
  onSelectTab: (tab: string) => void;
  activeTab: string;
}

export default function ChatsScreen({
  token,
  currentUser,
  friends,
  onSelectFriend,
  onOpenSelectContact,
  onSelectTab,
  activeTab,
}: ChatsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [messagesList, setMessagesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Poll or retrieve the last message and unread count for each friend
  useEffect(() => {
    const fetchLatestMessages = async () => {
      setLoading(true);
      try {
        const chatsWithInfo: any[] = [];
        
        // Loop through friends to fetch messages between user and friend
        for (const friend of friends) {
          const response = await fetch(`/api/messages/${friend.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const chats: Message[] = await response.json();
          
          if (Array.isArray(chats)) {
            const lastMsg = chats.length > 0 ? chats[chats.length - 1] : null;
            const unreadCount = chats.filter(
              (m) => m.receiverId === currentUser.id && !m.isRead
            ).length;

            chatsWithInfo.push({
              friend,
              lastMessage: lastMsg,
              unreadCount,
              timestamp: lastMsg ? new Date(lastMsg.createdAt) : new Date(friend.createdAt || Date.now()),
            });
          }
        }

        // Add standard seed chats if empty to show a highly realistic inbox
        if (chatsWithInfo.length === 0 && searchQuery === "") {
          const seeded = [
            {
              friend: {
                id: 991,
                fullName: "Alex Rivera",
                email: "alex@rivera.com",
                status: "Building the future of communication...",
                avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBe8_9gj-rW4HHS4Jqf_micpXrBbBaZFr01xXL3a4LzZPjLduVPx4V0NIGCzpX5mYAaL8Gy9gQ7GaYJ9jKhOXvx90-WCIsos44IAa91Wr64YzNXGQxCmgyph0s0GAymvA0q1Wc2iZVi0eRRoSCc8Rg8TtDISZj9TxSqxbUPExzciOVNdry4xPSI00YDrcRB-fa3yZJkUcLC1zX8C_twWbUXphBjjfMXjfF8S0sm-Lxe0BXcHaMqmHGm7_eQQqgW-lSV56PXtkTTW7M",
              },
              lastMessage: {
                id: 101,
                contentType: "TEXT" as const,
                messageBody: "I just reviewed the architectural specs. Looks extremely solid!",
                isRead: false,
                senderId: 991,
                receiverId: currentUser.id,
                createdAt: new Date().toISOString(),
              },
              unreadCount: 2,
              timestamp: new Date(),
            },
            {
              friend: {
                id: 992,
                fullName: "Sarah Chen",
                email: "sarah@chen.com",
                status: "Busy",
                avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZJ7V9A3adIiagRjjodlrztY-hP3ZVAN68PhNouRWsaq-8EkGNTa1mper99_fcsWf5KNmDXLrihQjBdzkGM-J_7knRQVOjtaKEjjfCSB1JB14wD6enrmVZq2c6ztcc4iSOL3uKdV_Qvj0by-SmD4Lrw20S_mP0HGkN5ohQL--KtQzR6LPtesw3baD4qgSW6qNS3vYGAoYWsa74jIfRFUHuZZZLiHAqMpx5N7NxGHg87Ojo8mZNIhZ8dr5FyqIu9fnSQw3XXaHGrYE",
              },
              lastMessage: {
                id: 102,
                contentType: "IMAGE" as const,
                messageBody: "Here is the layout draft design wireframes",
                isRead: true,
                senderId: currentUser.id,
                receiverId: 992,
                createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              },
              unreadCount: 0,
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
            },
            {
              friend: {
                id: 993,
                fullName: "James Wilson",
                email: "james@wilson.com",
                status: "Available",
                avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtu0PKqNPJ7mW1HvfnOEwLlzKO1ym5xmOOUqgem3FkfIDc82VPAV4u9siU9sAAld0wh9FTd2NuBtDxnN6D11sNqmd_wI9pth5JqRwUwa_eNehxz97IEbXxyfoZFIjq0x1_Wt2N-hR5tG_MDU0c0rC3eA1bwA7zCfwt4rLY_szJwAECJiViEsI4tbPq2gECIlJ4E8sBb4o3lOhJrObEQSsyV4tCWjsNlkPqsgmatUdWYVS0RMAk5cSJ8AHfHvmWqdMaW-BlIEsKPyc",
              },
              lastMessage: {
                id: 103,
                contentType: "TEXT" as const,
                messageBody: "Check out the sound effects when typing. It feels amazing!",
                isRead: true,
                senderId: 993,
                receiverId: currentUser.id,
                createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
              },
              unreadCount: 0,
              timestamp: new Date(Date.now() - 2 * 3600 * 1000),
            },
          ];
          setMessagesList(seeded);
        } else {
          // Sort messages by timestamp descending
          chatsWithInfo.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());
          setMessagesList(chatsWithInfo);
        }
      } catch (err) {
        console.error("Latest messages pull failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestMessages();

    // Set polling to capture updates
    const interval = setInterval(fetchLatestMessages, 12000);
    return () => clearInterval(interval);
  }, [friends, token, currentUser.id, searchQuery]);

  const filteredConversations = messagesList.filter((item) =>
    item.friend.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.friend.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-surface-container-lowest">
      {/* Top Main AppBar */}
      <header className="bg-surface sticky top-0 border-b border-outline-variant/30 flex justify-between items-center px-4 h-14 shrink-0 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center text-white font-mono font-bold text-sm shadow-sm">
            F
          </div>
          <h1 className="text-xl font-bold font-sans text-primary tracking-tight">FinTex</h1>
        </div>
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Sparkles className="w-5 h-5 text-secondary animate-pulse" />
          <button
            onClick={onOpenSelectContact}
            className="hover:bg-surface-container-low p-2 rounded-full cursor-pointer transition-colors"
          >
            <Plus className="w-5 h-5 text-primary" />
          </button>
          <button className="hover:bg-surface-container-low p-2 rounded-full cursor-pointer transition-colors">
            <MoreVertical className="w-5 h-5 text-on-surface" />
          </button>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-grow overflow-y-auto pb-24 custom-scrollbar">
        {/* Search Panel */}
        <div className="p-3 bg-white">
          <div className="flex items-center bg-surface-container rounded-full px-4 py-2 hover:bg-surface-container-high transition-colors">
            <Search className="text-on-surface-variant mr-3 w-5 h-5 shrink-0" />
            <input
              type="text"
              placeholder="Search chats by contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm text-on-surface-variant outline-none w-full p-0"
            />
          </div>
        </div>

        {/* Channels/Inbox Body Header */}
        <div className="px-4 py-2 flex items-center justify-between text-[11px] text-outline tracking-wider font-bold uppercase border-b border-outline-variant/10 font-mono">
          <span>Active Chats</span>
          {loading && <RefreshCw className="w-3 h-3 animate-spin text-primary" />}
        </div>

        {/* Chat Items List Mapping */}
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-on-surface-variant space-y-3">
            <MessageCircle className="w-12 h-12 text-outline-variant" />
            <p className="text-sm font-semibold text-on-surface">No conversations active yet</p>
            <p className="text-xs text-on-surface-variant">Click the selector block to initiate a direct chat session!</p>
            <button
              onClick={onOpenSelectContact}
              className="mt-2 bg-primary text-white text-xs px-4 py-2 rounded-full shadow-sm font-semibold hover:brightness-115 active:scale-95 transition-all outline-none cursor-pointer"
            >
              Select Contact
            </button>
          </div>
        ) : (
          <section className="bg-white divide-y divide-outline-variant/10">
            {filteredConversations.map((item, id) => {
              const { friend, lastMessage, unreadCount, timestamp } = item;
              const formattedTime = timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={id}
                  onClick={() => onSelectFriend(friend)}
                  className="flex items-center px-4 py-4 gap-4 hover:bg-surface-container-low transition-all duration-200 cursor-pointer border-b border-outline-variant/5 group"
                >
                  {/* Photo Avatar Thumbnail */}
                  <div className="relative shrink-0">
                    {friend.avatarUrl ? (
                      <img
                        src={friend.avatarUrl}
                        alt={friend.fullName}
                        className="w-13 h-13 rounded-full object-cover border border-outline-variant/30"
                      />
                    ) : (
                      <div className="w-13 h-13 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary font-bold text-base">
                        {friend.fullName
                          ? friend.fullName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                          : "JR"}
                      </div>
                    )}
                    {/* Activity Indicator Bullet */}
                    <div className="absolute bottom-0.5 right-0.5 bg-secondary w-3.5 h-3.5 rounded-full border-2 border-white"></div>
                  </div>

                  {/* Body Text Info block */}
                  <div className="flex-grow min-w-0 pr-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold text-on-surface leading-tight text-base group-hover:text-primary transition-colors truncate">
                        {friend.fullName || friend.email}
                      </h3>
                      <span className="text-[10px] text-outline font-mono whitespace-nowrap">
                        {formattedTime}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-on-surface-variant truncate max-w-[220px]">
                        {lastMessage ? (
                          <>
                            {lastMessage.senderId === currentUser.id && (
                              <CheckCheck className="w-3.5 h-3.5 inline mr-1 text-primary-container" />
                            )}
                            {lastMessage.messageBody}
                          </>
                        ) : (
                          friend.status || "Available"
                        )}
                      </p>

                      {unreadCount > 0 && (
                        <span className="bg-primary text-white text-[10px] font-bold h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center shadow-sm">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </main>

      {/* Persistent floating action circular button */}
      <button
        onClick={onOpenSelectContact}
        className="fixed bottom-20 right-6 bg-primary-container text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:rotate-9 hover:brightness-110 active:scale-95 transition-all outline-none z-[60] cursor-pointer"
      >
        <Plus className="w-6 h-6 text-white" strokeWidth={3} />
      </button>
    </div>
  );
}
