import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session-helper";
import { marketplaceStore } from "@/lib/marketplace-store";
import type { TaskItem } from "@/features/tasks/types";

export const dynamic = "force-dynamic";

export interface ChatConversationItem {
  id: string;
  taskId: string;
  taskTitle: string;
  taskCategory: string;
  taskStatus: string;
  taskBudget?: number;
  partner: {
    id: string;
    name: string;
    role: "POSTER" | "WORKER";
    roleLabel: string;
    isOnline: boolean;
  };
  lastMessage: {
    text: string;
    senderName: string;
    createdAt: string;
    isMe: boolean;
  } | null;
  unreadCount: number;
}

export async function GET() {
  try {
    const activeUser = await getCurrentUser();
    const userId = activeUser?.id || "usr-worker-siti";
    const userRole = activeUser?.role || "WORKER";

    // 1. Gather all tasks that have real conversation context for this user
    const allTasks = marketplaceStore.getTasks();
    const relevantTasksMap = new Map<string, TaskItem>();

    // A. Tasks posted by current user
    if (userRole === "POSTER") {
      allTasks
        .filter((t) => t.posterId === userId)
        .forEach((t) => relevantTasksMap.set(t.id, t));
    }

    // B. Tasks assigned to or applied by current worker
    const workerApps = marketplaceStore.getApplicationsByWorker(userId);
    for (const app of workerApps) {
      const t = allTasks.find((task) => task.id === app.taskId);
      if (t) relevantTasksMap.set(t.id, t);
    }

    // C. Mitra Active Order
    const activeOrder = marketplaceStore.getMitraActiveOrder(userId);
    if (activeOrder) {
      const t = allTasks.find((task) => task.id === activeOrder.taskId);
      if (t) relevantTasksMap.set(t.id, t);
    }

    // D. Only keep tasks that have in-progress status, accepted status, or active chat history
    // If no active tasks found for current user, fallback to 2 primary demo conversations
    // (Never dump the entire marketplace open task catalog!)
    if (relevantTasksMap.size === 0) {
      const demoTask1 = allTasks.find((t) => t.id === "tsk-booth-senayan");
      const demoTask2 = allTasks.find((t) => t.id === "tsk-clean-kost");
      if (demoTask1) relevantTasksMap.set(demoTask1.id, demoTask1);
      if (demoTask2) relevantTasksMap.set(demoTask2.id, demoTask2);
    }

    // Limit to max 3 most relevant active conversations so the chat inbox is clean, calm & never crowded
    const relevantTasks = Array.from(relevantTasksMap.values()).slice(0, 3);

    const conversations: ChatConversationItem[] = relevantTasks.map((task) => {
      const messages = marketplaceStore.getChatMessages(task.id);
      const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;

      // Determine the partner (the other person in the conversation)
      const isPoster = task.posterId === userId || userRole === "POSTER";
      const partnerName = isPoster ? "Siti Rahma" : task.poster?.name || "Budi Santoso";
      const partnerRole: "POSTER" | "WORKER" = isPoster ? "WORKER" : "POSTER";
      const partnerRoleLabel = isPoster ? "Mitra Pekerja" : "Pemberi Tugas";

      return {
        id: `conv-${task.id}`,
        taskId: task.id,
        taskTitle: task.title,
        taskCategory: task.category,
        taskStatus: task.status,
        taskBudget: task.budget,
        partner: {
          id: partnerRole === "POSTER" ? task.posterId : "usr-worker-siti",
          name: partnerName,
          role: partnerRole,
          roleLabel: partnerRoleLabel,
          isOnline: true,
        },
        lastMessage: lastMsg
          ? {
              text: lastMsg.text,
              senderName: lastMsg.senderName,
              createdAt: lastMsg.createdAt,
              isMe: lastMsg.senderId === userId,
            }
          : null,
        unreadCount: lastMsg && lastMsg.senderId !== userId ? 1 : 0,
      };
    });

    // Sort by last message time (most recent first)
    conversations.sort((a, b) => {
      const timeA = a.lastMessage?.createdAt
        ? new Date(a.lastMessage.createdAt).getTime()
        : 0;
      const timeB = b.lastMessage?.createdAt
        ? new Date(b.lastMessage.createdAt).getTime()
        : 0;
      return timeB - timeA;
    });

    return NextResponse.json({
      success: true,
      currentUser: activeUser,
      data: conversations,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
