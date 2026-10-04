import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu" },
        { status: 401 },
      );
    }

    const tasks = marketplaceStore.getTasks({
      posterId: currentUser.id,
    });

    const activeTasks = tasks.filter(
      (t) => t.status === "OPEN" || t.status === "IN_PROGRESS",
    );
    const completedTasks = tasks.filter((t) => t.status === "COMPLETED");
    const totalApplicants = tasks.reduce((sum, t) => sum + (t.applicationsCount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        user: currentUser,
        stats: {
          totalTasks: tasks.length,
          activeTasks: activeTasks.length,
          completedTasks: completedTasks.length,
          totalApplicants,
        },
        tasks,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
