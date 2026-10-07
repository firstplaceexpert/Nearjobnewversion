"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ProfileSheet } from "./profile-sheet";

interface ActiveUserResponse {
  success: boolean;
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: "POSTER" | "WORKER";
  } | null;
}

export function ProfileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch current user from active-user API
  const { data } = useQuery<ActiveUserResponse>({
    queryKey: ["activeUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/active-user");
      return res.json();
    },
  });

  const currentUser = data?.currentUser;
  const userName = currentUser?.name || "Dimas Pratama";

  // Get Initials (e.g. Dimas Pratama -> DP)
  const getInitials = (nameStr: string) => {
    const parts = nameStr.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return nameStr.slice(0, 2).toUpperCase() || "DP";
  };

  return (
    <>
      {/* Profile Trigger Button: ONLY circular avatar icon, NO name text */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary hover:bg-primary-hover text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-xs hover:scale-105 transition-all cursor-pointer ring-2 ring-white border border-secondary-hover/30 shrink-0"
        aria-label="Buka Profil Akun"
        title="Profil Akun"
      >
        <span className="text-xs sm:text-sm font-black text-white tracking-wider">
          {getInitials(userName)}
        </span>
      </button>

      {/* Slide-over NearJob Profile Sheet */}
      <ProfileSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
