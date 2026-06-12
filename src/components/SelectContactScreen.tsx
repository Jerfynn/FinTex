import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Check, Users, UserPlus, Milestone, MessageSquare } from "lucide-react";
import { User } from "../types";

interface SelectContactProps {
  token: string;
  onBack: () => void;
  onSelectFriend: (friend: User) => void;
}

export default function SelectContactScreen({
  token,
  onBack,
  onSelectFriend,
}: SelectContactProps) {
  const [contacts, setContacts] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Pre-seed contacts if database is empty for gorgeous layout
  useEffect(() => {
    const fetchContacts = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/users/search?q=${searchQuery}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          if (data.length === 0 && searchQuery === "") {
            // Seed static demo contacts for unmatched beauty
            setContacts([
              {
                id: 991,
                fullName: "Alexander Wright",
                email: "alexander@wright.com",
                status: "Available",
                avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBe8_9gj-rW4HHS4Jqf_micpXrBbBaZFr01xXL3a4LzZPjLduVPx4V0NIGCzpX5mYAaL8Gy9gQ7GaYJ9jKhOXvx90-WCIsos44IAa91Wr64YzNXGQxCmgyph0s0GAymvA0q1Wc2iZVi0eRRoSCc8Rg8TtDISZj9TxSqxbUPExzciOVNdry4xPSI00YDrcRB-fa3yZJkUcLC1zX8C_twWbUXphBjjfMXjfF8S0sm-Lxe0BXcHaMqmHGm7_eQQqgW-lSV56PXtkTTW7M",
              },
              {
                id: 992,
                fullName: "Amara Okafor",
                email: "amara@okafor.com",
                status: "Busy",
                avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZJ7V9A3adIiagRjjodlrztY-hP3ZVAN68PhNouRWsaq-8EkGNTa1mper99_fcsWf5KNmDXLrihQjBdzkGM-J_7knRQVOjtaKEjjfCSB1JB14wD6enrmVZq2c6ztcc4iSOL3uKdV_Qvj0by-SmD4Lrw20S_mP0HGkN5ohQL--KtQzR6LPtesw3baD4qgSW6qNS3vYGAoYWsa74jIfRFUHuZZZLiHAqMpx5N7NxGHg87Ojo8mZNIhZ8dr5FyqIu9fnSQw3XXaHGrYE",
              },
              {
                id: 993,
                fullName: "Benjamin Thorne",
                email: "benjamin@thorne.com",
                status: "At the gym",
                avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtu0PKqNPJ7mW1HvfnOEwLlzKO1ym5xmOOUqgem3FkfIDc82VPAV4u9siU9sAAld0wh9FTd2NuBtDxnN6D11sNqmd_wI9pth5JqRwUwa_eNehxz97IEbXxyfoZFIjq0x1_Wt2N-hR5tG_MDU0c0rC3eA1bwA7zCfwt4rLY_szJwAECJiViEsI4tbPq2gECIlJ4E8sBb4o3lOhJrObEQSsyV4tCWjsNlkPqsgmatUdWYVS0RMAk5cSJ8AHfHvmWqdMaW-BlIEsKPyc",
              },
              {
                id: 994,
                fullName: "Daniela Rossi",
                email: "daniela@rossi.com",
                status: "Working remotely",
                avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHWQ9Tgkp5Sanz5D9wGFEaZoxmTAj1ZiFvopppqbuGnnpsbscjMOa7gUpv_SBTTkrOHbglMbuivnbvm0UWVqk4rxICgtPx1nLqzYGlzusbgBiPZi-ORiPI7nrgVjBTVNqxW2WVzdUH4Qd_CYU2r1mj9t5ViFYrWaV-L-VeEPvMjHHw38yqwYAcyRiBtpxv76yK1_tfzNWXnh2iVNCsimRx3i84gkoPW_bPo196QQi2XUd9PpHf_9rjfUijAHzuEeqs8rrPL68SfxM",
              },
              {
                id: 995,
                fullName: "Jordan Reed",
                email: "jordan@reed.com",
                status: "Hey there! I am using FinTex.",
              },
            ]);
          } else {
            setContacts(data);
          }
        }
      } catch (err) {
        console.error("Contacts search load failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
  }, [searchQuery, token]);

  const handleSelectCheckbox = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleStartChat = () => {
    if (selectedIds.length === 0) return;
    const selectedFriend = contacts.find((c) => c.id === selectedIds[0]);
    if (selectedFriend) {
      onSelectFriend(selectedFriend);
    }
  };

  // Group contacts alphabetically
  const groupedContacts: { [key: string]: User[] } = {};
  contacts.forEach((contact) => {
    const letter = contact.fullName ? contact.fullName[0].toUpperCase() : "J";
    if (!groupedContacts[letter]) {
      groupedContacts[letter] = [];
    }
    groupedContacts[letter].push(contact);
  });

  return (
    <div className="flex flex-col h-full bg-background animate-fade-in pb-safe">
      {/* TopAppBar */}
      <header className="bg-surface border-b border-outline-variant shadow-sm w-full shrink-0 flex justify-between items-center px-4 h-14 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="hover:bg-surface-container-high p-2 rounded-full transition-colors text-on-surface-variant cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <div className="flex flex-col">
            <h1 className="font-semibold text-lg text-primary">Select Contact</h1>
            <span className="text-[11px] text-on-surface-variant font-mono">
              {contacts.length} contacts available
            </span>
          </div>
        </div>
      </header>

      {/* Main Search Input & Actions */}
      <main className="flex-grow overflow-y-auto custom-scrollbar pb-24">
        {/* Search Bar Input Panel */}
        <div className="p-4 bg-white border-b border-outline-variant/30">
          <div className="relative flex items-center bg-surface-container-low rounded-xl px-4 py-2 opacity-95 focus-within:ring-2 focus-within:ring-primary transition-all">
            <Search className="text-on-surface-variant mr-3 w-5 h-5 shrink-0" />
            <input
              type="text"
              placeholder="Search contacts by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:ring-0 w-full text-sm text-on-surface outline-none p-0"
            />
          </div>
        </div>

        {/* Global actions */}
        <section className="bg-white border-b border-outline-variant/20 pt-2 mb-2">
          <button className="w-full flex items-center px-4 py-3 gap-4 hover:bg-surface-container transition-colors group">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-white shrink-0 shadow-sm">
              <Users className="w-6 h-6" />
            </div>
            <span className="font-semibold text-on-surface text-base">New Group</span>
          </button>
          <button className="w-full flex items-center px-4 py-3 gap-4 hover:bg-surface-container transition-colors group">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-white shrink-0 shadow-sm">
              <UserPlus className="w-6 h-6" />
            </div>
            <div className="flex-grow flex justify-between items-center text-left">
              <span className="font-semibold text-on-surface text-base">New Contact</span>
              <span className="text-xs text-outline font-mono mr-2">QR Scan</span>
            </div>
          </button>
          <button className="w-full flex items-center px-4 py-3 gap-4 hover:bg-surface-container transition-colors group">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-white shrink-0 shadow-sm">
              <Milestone className="w-6 h-6" />
            </div>
            <span className="font-semibold text-on-surface text-base">New Community</span>
          </button>
        </section>

        {/* Categories Header Label */}
        <div className="px-4 py-2 bg-surface-container-low text-[10px] font-bold tracking-widest text-on-surface-variant uppercase font-mono">
          Contacts on FinTex
        </div>

        {/* Group lists mapping */}
        <section className="bg-white divide-y divide-outline-variant/10">
          {Object.keys(groupedContacts)
            .sort()
            .map((letter) => (
              <div key={letter}>
                {/* Letter Index Head */}
                <div className="px-4 py-2 text-primary font-bold text-sm bg-surface-container-lowest">
                  {letter}
                </div>
                <div>
                  {groupedContacts[letter].map((contact) => {
                    const isChecked = selectedIds.includes(contact.id);
                    return (
                      <div key={contact.id}>
                        <input
                          id={`contact-${contact.id}`}
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectCheckbox(contact.id)}
                          className="hidden"
                        />
                        <label
                          htmlFor={`contact-${contact.id}`}
                          className={`flex items-center px-4 py-3 gap-4 cursor-pointer hover:bg-surface-container transition-colors duration-150 ${
                            isChecked ? "bg-surface-container" : ""
                          }`}
                        >
                          <div className="relative shrink-0">
                            {contact.avatarUrl ? (
                              <img
                                src={contact.avatarUrl}
                                alt={contact.fullName}
                                className="w-12 h-12 rounded-full object-cover border border-outline-variant/30"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-base">
                                {contact.fullName
                                  ? contact.fullName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .toUpperCase()
                                  : "JR"}
                              </div>
                            )}
                            {/* Checkmark overlay */}
                            <div
                              className={`absolute -bottom-1 -right-1 bg-secondary text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm transition-all duration-200 ${
                                isChecked ? "scale-100 opacity-100" : "scale-50 opacity-0"
                              }`}
                            >
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            </div>
                          </div>
                          <div className="flex-grow pb-1">
                            <h3 className="text-on-surface font-semibold text-base">{contact.fullName || contact.email}</h3>
                            <p className="text-on-surface-variant text-xs truncate max-w-[240px]">
                              {contact.status || "Available"}
                            </p>
                          </div>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
        </section>
      </main>

      {/* Floating sliding Selection Footer */}
      <div
        className={`fixed bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 ease-out z-[60] pointer-events-none ${
          selectedIds.length > 0 ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="max-w-[400px] mx-auto pointer-events-auto">
          <button
            onClick={handleStartChat}
            className="w-full bg-primary-container text-white py-3.5 rounded-xl shadow-lg flex items-center justify-center gap-3 active:scale-95 transition-all text-base font-semibold cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 text-white" fill="currentColor" />
            <span>Start Chat ({selectedIds.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
