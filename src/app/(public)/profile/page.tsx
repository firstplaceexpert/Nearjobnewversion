"use client";

import { ProfileSheet } from "@/components/ui/profile-sheet";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();

  return <ProfileSheet isOpen={true} onClose={() => router.push("/")} />;
}
