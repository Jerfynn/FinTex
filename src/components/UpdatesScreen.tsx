import React, { useState } from "react";
import { Camera, Plus, Check, Compass, Rss, Newspaper, Heart, Radio, PlusCircle, Activity } from "lucide-react";

interface StatusItem {
  name: string;
  time: string;
  avatar: string;
  color: string;
}

export default function UpdatesScreen() {
  const [followingTech, setFollowingTech] = useState(false);
  const [followingSports, setFollowingSports] = useState(false);
  const [myStatusText, setMyStatusText] = useState("");
  const [statusList, setStatusList] = useState<StatusItem[]>([
    {
      name: "Marcus Chen",
      time: "24 minutes ago",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBe8_9gj-rW4HHS4Jqf_micpXrBbBaZFr01xXL3a4LzZPjLduVPx4V0NIGCzpX5mYAaL8Gy9gQ7GaYJ9jKhOXvx90-WCIsos44IAa91Wr64YzNXGQxCmgyph0s0GAymvA0q1Wc2iZVi0eRRoSCc8Rg8TtDISZj9TxSqxbUPExzciOVNdry4xPSI00YDrcRB-fa3yZJkUcLC1zX8C_twWbUXphBjjfMXjfF8S0sm-Lxe0BXcHaMqmHGm7_eQQqgW-lSV56PXtkTTW7M",
      color: "border-primary",
    },
    {
      name: "Sarah Jenkins",
      time: "2 hours ago",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZJ7V9A3adIiagRjjodlrztY-hP3ZVAN68PhNouRWsaq-8EkGNTa1mper99_fcsWf5KNmDXLrihQjBdzkGM-J_7knRQVOjtaKEjjfCSB1JB14wD6enrmVZq2c6ztcc4iSOL3uKdV_Qvj0by-SmD4Lrw20S_mP0HGkN5ohQL--KtQzR6LPtesw3baD4qgSW6qNS3vYGAoYWsa74jIfRFUHuZZZLiHAqMpx5N7NxGHg87Ojo8mZNIhZ8dr5FyqIu9fnSQw3XXaHGrYE",
      color: "border-primary",
    },
    {
      name: "Aaron Smith",
      time: "4 hours ago",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtu0PKqNPJ7mW1HvfnOEwLlzKO1ym5xmOOUqgem3FkfIDc82VPAV4u9siU9sAAld0wh9FTd2NuBtDxnN6D11sNqmd_wI9pth5JqRwUwa_eNehxz97IEbXxyfoZFIjq0x1_Wt2N-hR5tG_MDU0c0rC3eA1bwA7zCfwt4rLY_szJwAECJiViEsI4tbPq2gECIlJ4E8sBb4o3lOhJrObEQSsyV4tCWjsNlkPqsgmatUdWYVS0RMAk5cSJ8AHfHvmWqdMaW-BlIEsKPyc",
      color: "border-primary",
    },
  ]);

  const handleCreateStatus = () => {
    if (!myStatusText.trim()) return;
    const newStatus: StatusItem = {
      name: "Me (Just Now)",
      time: "Just now",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCDFBpUsHwr5K2J8DSMkxqaAXCKN2P6rzFrXW2x2NSJ6VKQFok6m46N5eOJk4_rrSSa1DNT4ALxkky6fNxEaIMeDHnkuBQ42JnfI8wCqt2r9meEFtclynsIwwRw30x4HAeBOZGGffl9pd8eOzQeU50DY-ftOjb7kHQY1JWbLjHc2zdF-WdG-A_Mn90c4kUw89MlYWhrnziMI03irtW6KFXvLiwM7LoNSDKn-rfAYA0rE6ywfVh9iPzbX5aV-sEnH-Wr3xzbY6GbwWw",
      color: "border-secondary",
    };
    setStatusList([newStatus, ...statusList]);
    setMyStatusText("");
  };

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in pb-safe">
      {/* AppBar Header */}
      <header className="bg-surface sticky top-0 border-b border-outline-variant/30 flex justify-between items-center px-4 h-14 shrink-0 shadow-sm z-50">
        <h1 className="text-xl font-bold font-sans text-primary">Updates</h1>
        <button className="hover:bg-surface-container-low p-2 rounded-full cursor-pointer transition-colors text-primary">
          <Camera className="w-5 h-5" />
        </button>
      </header>

      {/* Scrollable Container */}
      <main className="flex-grow overflow-y-auto pb-24 custom-scrollbar">
        {/* Statuses Header label */}
        <section className="bg-white p-4 border-b border-outline-variant/20 mb-2">
          <h2 className="text-base font-bold text-on-surface mb-3 uppercase tracking-wider font-sans">
            Status Section
          </h2>
          
          {/* Status Row listing horizontal scrollable */}
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {/* Create My Status Card */}
            <div className="flex flex-col items-center flex-shrink-0 text-center space-y-1.5 cursor-pointer max-w-[80px]">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border border-dashed border-outline-variant flex items-center justify-center bg-surface-container-low overflow-hidden">
                  <Activity className="w-6 h-6 text-outline" />
                </div>
                <div className="absolute bottom-0 right-0 bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center border border-white">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="text-xs font-semibold text-on-surface truncate w-full">My Status</span>
            </div>

            {/* Existing story items list */}
            {statusList.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center flex-shrink-0 text-center space-y-1.5 cursor-pointer max-w-[82px] group"
              >
                <div className={`w-14 h-14 rounded-full border-2 ${item.color} p-0.5 box-content overflow-hidden`}>
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-full h-full rounded-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="w-full">
                  <span className="text-xs font-semibold text-on-surface truncate block w-full">
                    {item.name.split(" ")[0]}
                  </span>
                  <span className="text-[9px] text-outline block whitespace-nowrap">{item.time}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Micro Status Quick composer */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-outline-variant/10">
            <input
              type="text"
              placeholder="Composer: What's on your mind today?"
              value={myStatusText}
              onChange={(e) => setMyStatusText(e.target.value)}
              className="flex-grow bg-surface-container border-none focus:ring-1 focus:ring-primary rounded-xl text-xs px-3 py-2 outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleCreateStatus()}
            />
            <button
              onClick={handleCreateStatus}
              className="bg-primary text-white p-2 rounded-xl text-xs font-bold hover:brightness-110 shrink-0 cursor-pointer"
            >
              Post Status
            </button>
          </div>
        </section>

        {/* FinTex Channels discovery section */}
        <section className="bg-white p-4 border-b border-outline-variant/20 mb-2">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-base font-bold text-on-surface uppercase tracking-wider font-sans">
              Discover Channels
            </h2>
            <span className="text-[10px] text-primary font-bold cursor-pointer flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> See All
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
            Stay updated on topics that interest you. Follow official channels for verified news and tech drops.
          </p>

          <div className="space-y-4">
            {/* Channel 1 */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-container flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Rss className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-on-surface flex items-center gap-1.5">
                    Tech Pulse Feed <Check className="w-4 h-4 bg-secondary text-white rounded-full p-0.5 text-[8px]" />
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    {followingTech ? "245K Followers • Active" : "244K Followers • Daily logs"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFollowingTech(!followingTech)}
                className={`text-xs px-4 py-1.5 rounded-full font-bold shadow-sm transition-all cursor-pointer ${
                  followingTech
                    ? "bg-surface-container-high text-on-surface-variant hover:bg-error/10 hover:text-error"
                    : "bg-primary-container text-white hover:brightness-110"
                }`}
              >
                {followingTech ? "Following" : "Follow"}
              </button>
            </div>

            {/* Channel 2 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-secondary-container flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-on-surface flex items-center gap-1.5">
                    Sports Daily Spot <Check className="w-4 h-4 bg-secondary text-white rounded-full p-0.5 text-[8px]" />
                  </h3>
                  <p className="text-[11px] text-on-surface-variant">
                    {followingSports ? "109K Followers • Live" : "108K Followers • Live match stats"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFollowingSports(!followingSports)}
                className={`text-xs px-4 py-1.5 rounded-full font-bold shadow-sm transition-all cursor-pointer ${
                  followingSports
                    ? "bg-surface-container-high text-on-surface-variant hover:bg-error/10 hover:text-error"
                    : "bg-primary-container text-white hover:brightness-110"
                }`}
              >
                {followingSports ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        </section>

        {/* Channels Information Alert Card */}
        <section className="p-4 mx-4 my-2 bg-surface-container-low border border-outline-variant/35 rounded-2xl flex gap-3">
          <Radio className="text-secondary w-6 h-6 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-on-surface">End-to-End Privacy</h4>
            <p className="text-[11px] text-on-surface-variant leading-relaxed">
              Channels are separate from your private chats. Followers cannot see your phone number, avatar, or name.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
