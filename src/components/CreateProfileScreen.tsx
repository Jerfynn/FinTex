import React, { useState } from "react";
import { User as UserIcon, FileText, Smartphone, ArrowRight, Camera, HelpCircle, Activity } from "lucide-react";
import { User } from "../types";

interface CreateProfileProps {
  token: string;
  currentUser: User;
  onProfileUpdated: (updatedUser: any) => void;
}

export default function CreateProfileScreen({
  token,
  currentUser,
  onProfileUpdated,
}: CreateProfileProps) {
  const [fullName, setFullName] = useState(currentUser.fullName || "");
  const [bio, setBio] = useState(currentUser.bio || "");
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || "");
  const [status, setStatus] = useState(currentUser.status || "Available");
  const [avatar, setAvatar] = useState(
    currentUser.avatarUrl ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCDFBpUsHwr5K2J8DSMkxqaAXCKN2P6rzFrXW2x2NSJ6VKQFok6m46N5eOJk4_rrSSa1DNT4ALxkky6fNxEaIMeDHnkuBQ42JnfI8wCqt2r9meEFtclynsIwwRw30x4HAeBOZGGffl9pd8eOzQeU50DY-ftOjb7kHQY1JWbLjHc2zdF-WdG-A_Mn90c4kUw89MlYWhrnziMI03irtW6KFXvLiwM7LoNSDKn-rfAYA0rE6ywfVh9iPzbX5aV-sEnH-Wr3xzbY6GbwWw"
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg("Picture must be less than 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setErrorMsg("");
    if (!fullName || fullName.trim() === "") {
      setErrorMsg("Please enter your full name to start messaging.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/profile/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          bio: bio.trim(),
          avatarUrl: avatar,
          phoneNumber: phoneNumber.trim(),
          status: status.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to finalize profile onboarding");
      }

      onProfileUpdated(data.user);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Profile configuration write failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex flex-col items-center justify-center px-4 py-8 animate-fade-in relative z-10">
      <div className="w-full max-w-[480px] space-y-6">
        {/* Header Section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary mb-2">Create Profile</h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Set up your identity to start messaging friends and family.
          </p>
        </div>

        {/* Profile Onboarding Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-outline-variant/30 space-y-6">
          {/* Avatar Picture Picker */}
          <div className="flex flex-col items-center">
            <div className="relative group cursor-pointer">
              <div className="w-28 h-28 rounded-full bg-surface-container-high border-2 border-outline-variant flex items-center justify-center overflow-hidden transition-all group-hover:border-primary">
                {avatar ? (
                  <img src={avatar} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="text-outline w-12 h-12" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary text-white w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-105 transition-transform cursor-pointer">
                <Camera className="w-5.5 h-5.5" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <span className="mt-3 text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">
              ADD PHOTO
            </span>
          </div>

          {errorMsg && (
            <div className="p-3 bg-error-container/40 border border-error/20 rounded-xl text-error text-xs">
              {errorMsg}
            </div>
          )}

          {/* Form input elements */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="fullName" className="text-xs font-bold text-primary uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative flex items-center border border-outline-variant/60 rounded-xl px-3 bg-surface-container-low focus-within:border-primary-container focus-within:bg-white transition-all">
                <UserIcon className="text-on-surface-variant w-5 h-5 mr-3 shrink-0" />
                <input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full h-12 bg-transparent border-none focus:ring-0 text-on-surface text-base outline-none p-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="status" className="text-xs font-bold text-primary uppercase tracking-wider">
                Current Status Update
              </label>
              <div className="relative flex items-center border border-outline-variant/60 rounded-xl px-3 bg-surface-container-low focus-within:border-primary-container focus-within:bg-white transition-all">
                <Activity className="text-on-surface-variant w-5 h-5 mr-3 shrink-0" />
                <input
                  id="status"
                  type="text"
                  placeholder="Hey there! I am using FinTex."
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full h-12 bg-transparent border-none focus:ring-0 text-on-surface text-base outline-none p-0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="bio" className="text-xs font-bold text-primary uppercase tracking-wider">
                About / Bio
              </label>
              <div className="relative flex items-start border border-outline-variant/60 rounded-xl p-3 bg-surface-container-low focus-within:border-primary-container focus-within:bg-white transition-all">
                <FileText className="text-on-surface-variant w-5 h-5 mr-3 mt-1 shrink-0" />
                <textarea
                  id="bio"
                  placeholder="Tell people about yourself..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface text-sm outline-none p-0 resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="phone" className="text-xs font-bold text-primary uppercase tracking-wider">
                Phone Number (Optional)
              </label>
              <div className="relative flex items-center border border-outline-variant/60 rounded-xl px-3 bg-surface-container-low focus-within:border-primary-container focus-within:bg-white transition-all">
                <Smartphone className="text-on-surface-variant w-5 h-5 mr-3 shrink-0" />
                <input
                  id="phone"
                  type="text"
                  placeholder="+1 (555) 012-3456"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full h-12 bg-transparent border-none focus:ring-0 text-on-surface text-base outline-none p-0"
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full bg-primary-container text-white h-14 rounded-full font-bold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{loading ? "Saving Details..." : "Get Started"}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center">
          <p className="text-xs text-on-surface-variant">
            You can change these details anytime in your profile settings dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
