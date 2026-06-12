import React, { useState, useEffect } from "react";
import { UserPlus, Check, X, Search, RefreshCw, UserCheck, AlertCircle, Sparkles, LayoutGrid } from "lucide-react";
import { User, Friendship } from "../types";

interface FriendsScreenProps {
  token: string;
  currentUser: User;
  onRefreshFriendsList: () => void;
}

export default function FriendsScreen({
  token,
  currentUser,
  onRefreshFriendsList,
}: FriendsScreenProps) {
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [friendsList, setFriendsList] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  // Invite by email state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteStatus, setInviteStatus] = useState({ success: false, message: "" });
  const [inviteLoading, setInviteLoading] = useState(false);

  // Fetch pending list and accepted list
  const syncSocialStates = async () => {
    setLoading(true);
    try {
      // 1. Get pending requests
      const responsePending = await fetch("/api/friends/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const pending = await responsePending.json();
      if (Array.isArray(pending)) {
        setPendingRequests(pending);
      }

      // 2. Get accepted friends lists
      const responseAccepted = await fetch("/api/friends/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const accepted = await responseAccepted.json();
      if (Array.isArray(accepted)) {
        setFriendsList(accepted);
      }
    } catch (err) {
      console.error("Failed to sync social relationships:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    syncSocialStates();
  }, [token]);

  const handleRespondRequest = async (id: number, action: "ACCEPTED" | "DECLINED") => {
    try {
      const response = await fetch("/api/friends/respond", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ friendshipId: id, action }),
      });

      if (response.ok) {
        // Success: sync social structures and notify parent list
        syncSocialStates();
        onRefreshFriendsList();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to respond to request");
      }
    } catch (err) {
      console.error("Social respond error:", err);
    }
  };

  const handleSendInvite = async () => {
    setInviteStatus({ success: false, message: "" });
    if (!inviteEmail.trim()) {
      setInviteStatus({ success: false, message: "Email is required" });
      return;
    }

    setInviteLoading(true);
    try {
      const response = await fetch("/api/friends/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverEmail: inviteEmail.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send invite");
      }

      setInviteStatus({
        success: true,
        message: "Invitation request sent successfully!",
      });
      setInviteEmail("");
      syncSocialStates();
    } catch (err: any) {
      setInviteStatus({
        success: false,
        message: err.message || "Invite failed or user not found.",
      });
    } finally {
      setInviteLoading(false);
    }
  };

  // Group verified friends alphabetically
  const filteredFriends = friendsList.filter((f) =>
    (f.fullName && f.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    f.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedFriends: { [key: string]: User[] } = {};
  filteredFriends.forEach((friend) => {
    const letter = friend.fullName ? friend.fullName[0].toUpperCase() : "A";
    if (!groupedFriends[letter]) {
      groupedFriends[letter] = [];
    }
    groupedFriends[letter].push(friend);
  });

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in pb-safe">
      {/* App Bar Heading */}
      <header className="bg-surface sticky top-0 border-b border-outline-variant/30 flex justify-between items-center px-4 h-14 shrink-0 shadow-sm z-50">
        <h1 className="text-xl font-bold font-sans text-primary">Friends</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={syncSocialStates}
            className="hover:bg-surface-container-low p-2 rounded-full cursor-pointer transition-colors text-primary"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-primary text-white text-xs px-3 py-1.5 rounded-full font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all outline-none cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Friend</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-grow overflow-y-auto pb-24 custom-scrollbar">
        {/* Pending Requests Section (if any exists) */}
        {pendingRequests.length > 0 && (
          <section className="bg-white p-4 mb-2 border-b border-outline-variant/15">
            <h2 className="text-xs font-bold text-outline tracking-wider uppercase mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-secondary animate-bounce" />
              Pending Requests ({pendingRequests.length})
            </h2>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3.5 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-sm transition-all"
                >
                  <div className="flex items-center gap-3">
                    {req.avatarUrl ? (
                      <img
                        src={req.avatarUrl}
                        alt={req.fullName}
                        className="w-11 h-11 rounded-full object-cover border border-outline-variant/30"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-secondary/15 text-secondary flex items-center justify-center font-bold text-sm">
                        {req.fullName
                          ? req.fullName
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                          : "U"}
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-sm text-on-surface leading-snug">
                        {req.fullName || req.email}
                      </h4>
                      <p className="text-[10px] text-outline truncate max-w-[140px]">
                        {req.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRespondRequest(req.id, "ACCEPTED")}
                      className="bg-secondary text-white p-2 rounded-full shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </button>
                    <button
                      onClick={() => handleRespondRequest(req.id, "DECLINED")}
                      className="bg-surface-container-high text-on-surface-variant p-2 rounded-full hover:bg-error/10 hover:text-error active:scale-95 transition-all cursor-pointer"
                    >
                      <X className="w-4 h-4" strokeWidth={3} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Search contacts inside list */}
        <section className="bg-white p-3">
          <div className="flex items-center bg-surface-container rounded-full px-4 py-2">
            <Search className="text-on-surface-variant mr-3 w-5 h-5 shrink-0" />
            <input
              type="text"
              placeholder="Search current friends listing..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm outline-none w-full p-0 text-on-surface"
            />
          </div>
        </section>

        {/* Group Listing index titles */}
        <div className="px-4 py-2 bg-surface-container-low text-[10px] font-bold tracking-widest text-on-surface-variant uppercase font-mono border-y border-outline-variant/10">
          All Friends (Alphabetical)
        </div>

        {filteredFriends.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 text-on-surface-variant space-y-3">
            <UserCheck className="w-12 h-12 text-outline-variant" />
            <p className="text-sm font-semibold text-on-surface">No current friends directory</p>
            <p className="text-xs text-on-surface-variant leading-relaxed max-w-[220px]">
              Tap "Add Friend" on the top bar and enter an email to connect!
            </p>
          </div>
        ) : (
          <div className="flex">
            {/* Scrollable contact items list */}
            <div className="flex-grow bg-white divide-y divide-outline-variant/10">
              {Object.keys(groupedFriends)
                .sort()
                .map((letter) => (
                  <div key={letter} id={`letter-anchor-${letter}`}>
                    <div className="px-4 py-1.5 text-primary font-bold text-xs bg-surface-container-lowest border-b border-outline-variant/5">
                      {letter}
                    </div>
                    <div>
                      {groupedFriends[letter].map((friend) => (
                        <div
                          key={friend.id}
                          className="flex items-center px-4 py-3 gap-3.5 hover:bg-surface-container-low transition-colors duration-150 border-b border-outline-variant/5"
                        >
                          {friend.avatarUrl ? (
                            <img
                              src={friend.avatarUrl}
                              alt={friend.fullName}
                              className="w-12 h-12 rounded-full object-cover border border-outline-variant/30"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-primary-container/15 text-primary flex items-center justify-center font-bold text-base">
                              {friend.fullName
                                ? friend.fullName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()
                                : "FR"}
                            </div>
                          )}
                          <div>
                            <h4 className="font-semibold text-on-surface text-base">
                              {friend.fullName}
                            </h4>
                            <p className="text-xs text-on-surface-variant truncate max-w-[200px]">
                              {friend.status || "Available"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            {/* Quick alpha-rail locator track */}
            <div className="w-8 shrink-0 flex flex-col justify-center items-center gap-1.5 bg-surface-container-lowest/40 py-4 py-safe select-none border-l border-outline-variant/5">
              {alphabet.map((letter) => {
                const hasFriends = groupedFriends[letter] !== undefined;
                return (
                  <button
                    key={letter}
                    onClick={() => {
                      if (hasFriends) {
                        const el = document.getElementById(`letter-anchor-${letter}`);
                        el?.scrollIntoView({ behavior: "smooth" });
                      }
                    }}
                    className={`text-[9px] font-bold font-mono outline-none cursor-pointer ${
                      hasFriends ? "text-primary scale-110" : "text-outline/40"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Invite Social Modal popup */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl border border-outline-variant/40 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                <Sparkles className="text-secondary w-5 h-5" /> Add New Friend
              </h3>
              <button
                onClick={() => {
                  setShowInviteModal(false);
                  setInviteStatus({ success: false, message: "" });
                }}
                className="hover:bg-surface-container p-1 rounded-full text-on-surface-variant cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteStatus.message && (
              <div
                className={`p-3 rounded-xl text-xs ${
                  inviteStatus.success
                    ? "bg-secondary-container/40 text-on-secondary-container"
                    : "bg-error-container/40 text-error"
                }`}
              >
                {inviteStatus.message}
              </div>
            )}

            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-outline-variant uppercase">
                  Friend's Email Address
                </label>
                <input
                  type="email"
                  placeholder="friend@domain.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full bg-surface-container focus:bg-white border border-outline-variant/40 rounded-xl px-4 py-3 outline-none text-sm text-on-surface"
                  onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteStatus({ success: false, message: "" });
                  }}
                  className="flex-1 border border-outline-variant py-2.5 rounded-xl text-xs font-bold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendInvite}
                  disabled={inviteLoading}
                  className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-bold hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {inviteLoading ? "Sending invite..." : "Invite"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
