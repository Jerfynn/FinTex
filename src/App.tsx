import React, { useState, useEffect } from "react";
import { MessageSquare, Radio, Users, Settings, MessageSquarePlus, Activity } from "lucide-react";
import { Screen, User } from "./types.ts";
import { getSocket, disconnectSocket } from "./socket.ts";

// Screens submodules
import LoginScreen from "./components/LoginScreen.tsx";
import VerifyOtpScreen from "./components/VerifyOtpScreen.tsx";
import CreateProfileScreen from "./components/CreateProfileScreen.tsx";
import ChatsScreen from "./components/ChatsScreen.tsx";
import ChatWindowScreen from "./components/ChatWindowScreen.tsx";
import SelectContactScreen from "./components/SelectContactScreen.tsx";
import FriendsScreen from "./components/FriendsScreen.tsx";
import UpdatesScreen from "./components/UpdatesScreen.tsx";
import SettingsScreen from "./components/SettingsScreen.tsx";
import ContactInfoScreen from "./components/ContactInfoScreen.tsx";
import PrivacyScreen from "./components/PrivacyScreen.tsx";
import NotificationsScreen from "./components/NotificationsScreen.tsx";
import HelpScreen from "./components/HelpScreen.tsx";

export default function App() {
  const [screen, setScreen] = useState<Screen>("LOGIN");
  const [token, setToken] = useState<string>(localStorage.getItem("fintex_jwt") || "");
  const [email, setEmail] = useState("");
  const [debugOtp, setDebugOtp] = useState("");
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
  const [friends, setFriends] = useState<User[]>([]);
  const [bottomTab, setBottomTab] = useState("CHATS");

  // Custom visual theme styling variables
  const [themeColor, setThemeColor] = useState("#008069"); // Gorgeous FinTex Green
  const [wallpaperColor, setWallpaperColor] = useState("#e5ddd5"); // Cozy default wallpaper

  // 1. Restore auth session from localStorage on startup
  const restoreSession = async (jwtToken: string) => {
    try {
      const response = await fetch("/api/profile/me", {
        headers: { Authorization: `Bearer ${jwtToken}` },
      });
      const data = await response.json();
      if (response.ok) {
        setToken(jwtToken);
        setCurrentUser(data);
        
        // Auto Route depending on profile fullness
        if (!data.fullName || data.fullName.trim() === "") {
          setScreen("CREATE_PROFILE");
        } else {
          setScreen("CHATS");
        }
        
        // Initialize real-time WebSocket connection
        getSocket(jwtToken);
      } else {
        // Stale token fallback
        localStorage.removeItem("fintex_jwt");
        setToken("");
        setScreen("LOGIN");
      }
    } catch (err) {
      console.error("Session restore failed:", err);
      // Fail gracefully: offline session mock for developer preview if offline
      setScreen("LOGIN");
    }
  };

  useEffect(() => {
    if (token) {
      restoreSession(token);
    }
  }, []);

  // 2. Fetch/sync active friends list from database
  const refreshFriendsList = async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/friends/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setFriends(data);
      }
    } catch (err) {
      console.error("Failed to sync friends listing:", err);
    }
  };

  useEffect(() => {
    if (token && currentUser) {
      refreshFriendsList();
    }
  }, [token, currentUser, screen]);

  // Auth handler: OTP Sent successfully
  const handleOtpSent = (targetEmail: string, sentOtp?: string) => {
    setEmail(targetEmail);
    if (sentOtp) {
      setDebugOtp(sentOtp);
    }
    setScreen("VERIFY_OTP");
  };

  // Auth handler: OTP Verified successfully
  const handleVerifySuccess = (jwtToken: string, user: User, isNewUser: boolean) => {
    localStorage.setItem("fintex_jwt", jwtToken);
    setToken(jwtToken);
    setCurrentUser(user);
    getSocket(jwtToken);

    if (isNewUser) {
      setScreen("CREATE_PROFILE");
    } else {
      setScreen("CHATS");
    }
  };

  // Onboarding completed or Profile Updated
  const handleProfileUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setScreen("CHATS");
  };

  // Log Out clearance action
  const handleLogOut = () => {
    localStorage.removeItem("fintex_jwt");
    setToken("");
    setCurrentUser(null);
    setSelectedFriend(null);
    disconnectSocket();
    setScreen("LOGIN");
  };

  // Clear chat history dummy callback
  const handleClearHistory = () => {
    // History can be cleared or synced
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center font-sans overflow-hidden antialiased">
      {/* Mobile-Frame Canvas Preview bounds */}
      <div className="w-full max-w-[430px] h-[100vh] sm:h-[860px] sm:my-4 sm:rounded-[36px] bg-background shadow-2xl relative flex flex-col overflow-hidden border border-outline-variant/20">
        
        {/* Dynamic Inner views router depending on screen state */}
        <div className="flex-grow flex flex-col overflow-hidden h-full">
          {screen === "LOGIN" && (
            <LoginScreen onOtpSent={handleOtpSent} />
          )}

          {screen === "VERIFY_OTP" && (
            <VerifyOtpScreen
              email={email}
              defaultDebugOtp={debugOtp}
              onBack={() => setScreen("LOGIN")}
              onVerifySuccess={handleVerifySuccess}
            />
          )}

          {screen === "CREATE_PROFILE" && currentUser && (
            <CreateProfileScreen
              token={token}
              currentUser={currentUser}
              onProfileUpdated={handleProfileUpdated}
            />
          )}

          {screen === "CHATS" && currentUser && (
            <>
              {bottomTab === "CHATS" && (
                <ChatsScreen
                  token={token}
                  currentUser={currentUser}
                  friends={friends}
                  onSelectFriend={(friend) => {
                    setSelectedFriend(friend);
                    setScreen("CHAT_WINDOW");
                  }}
                  onOpenSelectContact={() => setScreen("SELECT_CONTACT")}
                  onSelectTab={setBottomTab}
                  activeTab={bottomTab}
                />
              )}

              {bottomTab === "UPDATES" && (
                <UpdatesScreen />
              )}

              {bottomTab === "FRIENDS" && (
                <FriendsScreen
                  token={token}
                  currentUser={currentUser}
                  onRefreshFriendsList={refreshFriendsList}
                />
              )}

              {bottomTab === "SETTINGS" && (
                <SettingsScreen
                  currentUser={currentUser}
                  onEditProfile={() => setScreen("CREATE_PROFILE")}
                  onLogOut={handleLogOut}
                  onSelectSubScreen={(sub) => setScreen(sub as Screen)}
                  themeColor={themeColor}
                  setThemeColor={setThemeColor}
                  wallpaperColor={wallpaperColor}
                  setWallpaperColor={setWallpaperColor}
                />
              )}
            </>
          )}

          {screen === "CHAT_WINDOW" && currentUser && selectedFriend && (
            <ChatWindowScreen
              token={token}
              currentUser={currentUser}
              selectedFriend={selectedFriend}
              onBack={() => setScreen("CHATS")}
              onOpenContactInfo={() => setScreen("CONTACT_INFO")}
              wallpaperColor={wallpaperColor}
            />
          )}

          {screen === "SELECT_CONTACT" && (
            <SelectContactScreen
              token={token}
              onBack={() => setScreen("CHATS")}
              onSelectFriend={(friend) => {
                setSelectedFriend(friend);
                setScreen("CHAT_WINDOW");
              }}
            />
          )}

          {screen === "CONTACT_INFO" && selectedFriend && (
            <ContactInfoScreen
              selectedFriend={selectedFriend}
              onBack={() => setScreen("CHAT_WINDOW")}
              onClearHistory={handleClearHistory}
            />
          )}

          {screen === "PRIVACY" && (
            <PrivacyScreen onBack={() => { setScreen("CHATS"); setBottomTab("SETTINGS"); }} />
          )}

          {screen === "NOTIFICATIONS" && (
            <NotificationsScreen onBack={() => { setScreen("CHATS"); setBottomTab("SETTINGS"); }} />
          )}

          {screen === "HELP" && (
            <HelpScreen onBack={() => { setScreen("CHATS"); setBottomTab("SETTINGS"); }} />
          )}
        </div>

        {/* Persistent custom styled Bottom Tab Bar only visible when in Core CHATS dashboards */}
        {screen === "CHATS" && (
          <nav className="absolute bottom-0 left-0 right-0 bg-surface border-t border-outline-variant/30 h-16 flex justify-around items-center px-2 z-40 select-none pb-safe">
            <button
              onClick={() => setBottomTab("CHATS")}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                bottomTab === "CHATS" ? "text-primary scale-110 font-bold" : "text-on-surface-variant hover:text-primary/70"
              }`}
            >
              <MessageSquare className="w-5.5 h-5.5" fill={bottomTab === "CHATS" ? "currentColor" : "none"} />
              <span className="text-[10px] mt-1 font-sans">Chats</span>
            </button>

            <button
              onClick={() => setBottomTab("UPDATES")}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                bottomTab === "UPDATES" ? "text-primary scale-110 font-bold" : "text-on-surface-variant hover:text-primary/70"
              }`}
            >
              <Activity className="w-5.5 h-5.5" />
              <span className="text-[10px] mt-1 font-sans">Updates</span>
            </button>

            <button
              onClick={() => setBottomTab("FRIENDS")}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                bottomTab === "FRIENDS" ? "text-primary scale-110 font-bold" : "text-on-surface-variant hover:text-primary/70"
              }`}
            >
              <Users className="w-5.5 h-5.5" fill={bottomTab === "FRIENDS" ? "currentColor" : "none"} />
              <span className="text-[10px] mt-1 font-sans">Friends</span>
            </button>

            <button
              onClick={() => setBottomTab("SETTINGS")}
              className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-all ${
                bottomTab === "SETTINGS" ? "text-primary scale-110 font-bold" : "text-on-surface-variant hover:text-primary/70"
              }`}
            >
              <Settings className="w-5.5 h-5.5" fill={bottomTab === "SETTINGS" ? "currentColor" : "none"} />
              <span className="text-[10px] mt-1 font-sans">Settings</span>
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}
