"use client";

import { useState, useEffect } from "react";
import type { UserSummary } from "@/features/tasks/types";

export function UserRoleSwitcher() {
  const [currentUser, setCurrentUser] = useState<UserSummary | null>(null);
  const [allUsers, setAllUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/active-user")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setCurrentUser(json.currentUser);
          setAllUsers(json.allUsers);
        }
      })
      .catch(() => {});
  }, []);

  const handleSwitchUser = async (userId: string) => {
    if (userId === currentUser?.id) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/active-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (json.success) {
        window.location.reload();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="flex items-center gap-2 bg-light/70 border border-gray-border rounded-full px-2.5 py-1 text-xs">
      <span className="text-[11px] font-medium text-gray hidden sm:inline">
        Peran Aktif:
      </span>
      <select
        aria-label="Pilih Peran Akun"
        value={currentUser.id}
        onChange={(e) => handleSwitchUser(e.target.value)}
        disabled={loading}
        className="bg-transparent font-semibold text-dark text-xs cursor-pointer focus:outline-none pr-1"
      >
        {allUsers.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.role === "POSTER" ? "Pemberi Tugas" : "Pekerja"})
          </option>
        ))}
      </select>
      <span
        className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          currentUser.role === "POSTER"
            ? "bg-primary-light text-primary"
            : "bg-success-light text-success"
        }`}
      >
        {currentUser.role}
      </span>
    </div>
  );
}
