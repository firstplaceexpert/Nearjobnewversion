"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MitraNavbar } from "@/components/mitra/mitra-navbar";
import { MitraBottomNav } from "@/components/mitra/mitra-bottom-nav";
import type { MitraProfile } from "@/features/tasks/types";

const defaultProfile: MitraProfile = {
  id: "usr-worker-siti",
  name: "Siti Rahma",
  email: "siti@nearjob.id",
  phone: "0812-9988-7722",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
  vehicle: "Honda Beat eSP 110cc",
  plateNumber: "B 3819 TZG",
  rating: 4.98,
  totalTrips: 184,
  acceptanceRate: 98,
  completionRate: 100,
  isOnline: true,
  todayEarnings: 245000,
  todayTrips: 4,
  dailyGoalTrips: 6,
  points: 80,
};

export function MitraLayoutClient({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["mitraDashboard"],
    queryFn: async () => {
      const res = await fetch("/api/mitra/dashboard");
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 5000, // Keep polling for live radar
  });

  const profile = data?.profile || defaultProfile;
  const isOnline = profile.isOnline ?? true;

  const toggleOnlineMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/mitra/toggle-online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOnline: !isOnline }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mitraDashboard"] });
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-dark font-sans pb-20 md:pb-10">
      <MitraNavbar
        profile={profile}
        isOnline={isOnline}
        onToggleOnline={() => toggleOnlineMutation.mutate()}
        isToggling={toggleOnlineMutation.isPending}
      />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <MitraBottomNav />
    </div>
  );
}
