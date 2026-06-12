import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  CheckCheck,
  File,
  Camera,
  Image,
  Headphones,
  MapPin,
  User as UserIcon,
  Sparkles,
  Volume2,
} from "lucide-react";
import { User, Message } from "../types";
import { getSocket } from "../socket.ts";

interface ChatWindowProps {
  token: string;
  currentUser: User;
  selectedFriend: User;
  onBack: () => void;
  onOpenContactInfo: () => void;
  wallpaperColor: string;
}

export default function ChatWindowScreen({
  token,
  currentUser,
  selectedFriend,
  onBack,
  onOpenContactInfo,
  wallpaperColor,
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Play a beautiful synthesized keyboard tap sound for a glorious micro-interaction
  const playTypeSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.setValueAtTime(800 + Math.random() * 400, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.012, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.06);
    } catch (e) {
      // Browser audio context permission safety fallback
    }
  };

  // Socket instance client
  const socket = getSocket(token);

  // 1. Fetch historic conversation messages and mark as read
  const fetchMessagesOfChannel = async () => {
    try {
      const response = await fetch(`/api/messages/${selectedFriend.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setMessages(data);
      }
    } catch (err) {
      console.error("Historical messages load error:", err);
    }
  };

  useEffect(() => {
    fetchMessagesOfChannel();

    // Listen to real-time inbound logs
    if (socket) {
      socket.on("incomingMessage", (msg: Message) => {
        // Only append if belongs to this specific friend's thread
        if (
          (msg.senderId === currentUser.id && msg.receiverId === selectedFriend.id) ||
          (msg.senderId === selectedFriend.id && msg.receiverId === currentUser.id)
        ) {
          setMessages((prev) => {
            if (prev.find((e) => e.id === msg.id)) return prev;
            return [...prev, msg];
          });
          scrollBottom();
        }
      });

      socket.on("messageReadStatusUpdate", (data: { readerId: number; senderId: number }) => {
        if (data.readerId === selectedFriend.id && data.senderId === currentUser.id) {
          setMessages((prev) =>
            prev.map((m) => (m.senderId === currentUser.id ? { ...m, isRead: true } : m))
          );
        }
      });
    }

    return () => {
      if (socket) {
        socket.off("incomingMessage");
        socket.off("messageReadStatusUpdate");
      }
    };
  }, [selectedFriend.id, token, socket]);

  // Handle scrollbottom
  const scrollBottom = () => {
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 180);
  };

  useEffect(() => {
    scrollBottom();
  }, [messages]);

  // Send textual message
  const handleSendMessage = () => {
    if (!typedMessage.trim() || !socket) return;
    
    // Play lovely typewriter ticks
    playTypeSound();

    socket.emit("sendMessage", {
      receiverId: selectedFriend.id,
      contentType: "TEXT",
      messageBody: typedMessage.trim(),
    });

    setTypedMessage("");
    setIsTyping(false);
  };

  // Simulate dictating VOICE messages
  const handleSimulateVoiceMessage = () => {
    if (!socket) return;
    socket.emit("sendMessage", {
      receiverId: selectedFriend.id,
      contentType: "VOICE",
      messageBody: "Voice Message (0:05)",
      mediaUrl: "voice_005_mock_clip.ogg",
    });
  };

  // Simulate uploading an Image
  const handleSimulateImageAttachment = () => {
    if (!socket) return;
    setShowAttachmentMenu(false);
    socket.emit("sendMessage", {
      receiverId: selectedFriend.id,
      contentType: "IMAGE",
      messageBody: "Photo Attachment",
      mediaUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=200&auto=format&fit=crop",
    });
  };

  // Simulate uploading a Document
  const handleSimulateDocAttachment = () => {
    if (!socket) return;
    setShowAttachmentMenu(false);
    socket.emit("sendMessage", {
      receiverId: selectedFriend.id,
      contentType: "TEXT",
      messageBody: "📄 Product_Specs_v2.pdf (1.2 MB)",
    });
  };

  const handleInputChange = (val: string) => {
    setTypedMessage(val);
    if (val.length > 0) {
      setIsTyping(true);
      playTypeSound();
    } else {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative animate-fade-in pb-safe">
      {/* TopAppBar Navigation Info */}
      <header className="bg-surface sticky top-0 border-b border-outline-variant/35 flex justify-between items-center px-4 h-14 shrink-0 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="hover:bg-surface-container-high p-1.5 rounded-full transition-colors text-primary cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          {/* Avatar Click maps to ContactInfo screen */}
          <div
            onClick={onOpenContactInfo}
            className="flex items-center gap-2.5 cursor-pointer hover:opacity-85"
          >
            {selectedFriend.avatarUrl ? (
              <img
                src={selectedFriend.avatarUrl}
                alt={selectedFriend.fullName}
                className="w-10 h-10 rounded-full object-cover border border-outline-variant/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary-container/25 text-primary flex items-center justify-center font-bold text-sm">
                F
              </div>
            )}
            <div className="flex flex-col text-left">
              <h1 className="font-bold text-sm text-on-surface truncate leading-tight">
                {selectedFriend.fullName || selectedFriend.email}
              </h1>
              <span className="text-[10px] text-secondary font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full inline-block animate-pulse"></span>
                <span>Online</span>
              </span>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-3.5 text-on-surface-variant">
          <button className="hover:bg-surface-container-low p-2 rounded-full cursor-pointer transition-colors text-primary">
            <Video className="w-5 h-5" />
          </button>
          <button className="hover:bg-surface-container-low p-2 rounded-full cursor-pointer transition-colors text-primary">
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="hover:bg-surface-container-low p-2 rounded-full cursor-pointer transition-colors"
            title="Sound Indicator"
          >
            <Volume2 className={`w-5 h-5 ${soundEnabled ? "text-secondary" : "text-outline/40"}`} />
          </button>
        </div>
      </header>

      {/* Message Chat Room thread (wallpaper layout) */}
      <main
        className="flex-grow overflow-y-auto px-4 py-6 custom-scrollbar relative"
        style={{ backgroundColor: wallpaperColor }}
      >
        <div className="space-y-4 max-w-[500px] mx-auto">
          {messages.length === 0 && (
            <div className="flex justify-center p-8 text-center text-xs text-on-surface-variant font-mono bg-white/70 border border-outline-variant/20 rounded-2xl max-w-[280px] mx-auto">
              This channel is secured with end-to-end encryption. Start sharing chats below!
            </div>
          )}

          {messages.map((m) => {
            const isMe = m.senderId === currentUser.id;
            const time = new Date(m.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <div
                key={m.id}
                className={`flex w-full ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}
              >
                <div
                  className={`relative max-w-[260px] p-3 rounded-2xl shadow-sm border ${
                    isMe
                      ? "bg-secondary-container text-on-secondary-container rounded-tr-none border-secondary/10"
                      : "bg-white text-on-surface rounded-tl-none border-outline-variant/25"
                  }`}
                >
                  {/* Image attachment rendering */}
                  {m.contentType === "IMAGE" && m.mediaUrl && (
                    <div className="rounded-xl overflow-hidden mb-2 border border-outline-variant/10 shadow-sm max-w-[220px]">
                      <img src={m.mediaUrl} alt="Payload graphic" className="w-full h-auto" />
                    </div>
                  )}

                  {/* Voice message rendering */}
                  {m.contentType === "VOICE" ? (
                    <div className="flex items-center gap-3 py-1 bg-surface-container-lowest/40 rounded-xl px-2">
                      <Mic className="text-secondary w-5 h-5 animate-pulse shrink-0" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-secondary">
                          VOICE MEMO
                        </span>
                        <span className="text-xs text-on-surface">Recorded note (0:05)</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed pr-6 word-break-all whitespace-pre-wrap">{m.messageBody}</p>
                  )}

                  {/* Micro footer: time stamp, double check indicators */}
                  <div className="absolute bottom-1.5 right-2 flex items-center gap-1 text-[9px] text-outline font-mono">
                    <span>{time}</span>
                    {isMe && (
                      <CheckCheck
                        className={`w-3.5 h-3.5 ${m.isRead ? "text-primary" : "text-outline/40"}`}
                      />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef}></div>
        </div>
      </main>

      {/* Collage attachment popup menu drawer */}
      {showAttachmentMenu && (
        <div className="fixed bottom-20 left-4 right-4 max-w-[400px] mx-auto bg-white rounded-3xl p-5 shadow-2xl border border-outline-variant/45 z-[100] animate-fade-in divide-y divide-outline-variant/10">
          <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-center pb-2.5">
            <button
              onClick={handleSimulateDocAttachment}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
                <File className="w-5.5 h-5.5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Document</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#f44336] flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
                <Camera className="w-5.5 h-5.5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Camera</span>
            </button>
            <button
              onClick={handleSimulateImageAttachment}
              className="flex flex-col items-center gap-1.5 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-[#e040fb] flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
                <Image className="w-5.5 h-5.5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Gallery</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#ff9800] flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
                <Headphones className="w-5.5 h-5.5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Audio</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#00e676] flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
                <MapPin className="w-5.5 h-5.5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Location</span>
            </button>
            <button className="flex flex-col items-center gap-1.5 group cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#00b0ff] flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform">
                <UserIcon className="w-5.5 h-5.5 text-white" />
              </div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Contact</span>
            </button>
          </div>
        </div>
      )}

      {/* Typing & Bottom Input Controls bar */}
      <footer className="p-3 bg-surface-container-lowest shrink-0 flex items-center gap-2 border-t border-outline-variant/15 z-50">
        <div className="flex-grow bg-surface rounded-full py-1.5 px-3.5 flex items-center gap-2 border border-outline-variant/20 shadow-inner">
          <Smile className="text-secondary w-5.5 h-5.5 shrink-0 hover:scale-105 cursor-pointer" />
          
          <input
            type="text"
            placeholder="Type message..."
            value={typedMessage}
            onChange={(e) => handleInputChange(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-sm outline-none p-0 text-on-surface"
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          />

          <button
            onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
            className="hover:bg-surface-container p-1 rounded-full text-on-surface-variant cursor-pointer shrink-0"
          >
            <Paperclip className={`w-5.5 h-5.5 ${showAttachmentMenu ? "text-primary rotate-45" : "text-outline"} transition-transform`} />
          </button>
        </div>

        {isTyping ? (
          <button
            onClick={handleSendMessage}
            className="bg-primary-container text-white w-11 h-11 rounded-full flex items-center justify-center shadow-md hover:brightness-110 active:scale-90 transition-transform cursor-pointer shrink-0"
          >
            <Send className="w-5.5 h-5.5 text-white" />
          </button>
        ) : (
          <button
            onClick={handleSimulateVoiceMessage}
            className="bg-secondary text-white w-11 h-11 rounded-full flex items-center justify-center shadow-md hover:brightness-110 active:scale-90 transition-transform cursor-pointer shrink-0"
            title="Simulate Voice Message"
          >
            <Mic className="w-5.5 h-5.5 text-white" />
          </button>
        )}
      </footer>
    </div>
  );
}
