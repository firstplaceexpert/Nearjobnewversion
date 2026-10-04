import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await props.params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu" },
        { status: 401 },
      );
    }

    const task = marketplaceStore.getTaskById(taskId);
    if (!task) {
      return NextResponse.json(
        { success: false, error: "Tugas tidak ditemukan" },
        { status: 404 },
      );
    }

    // Server-side ownership authorization: Only the poster of this task can view applicants!
    if (task.posterId !== currentUser.id) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Akses ditolak: Anda hanya dapat melihat pelamar pada tugas milik Anda sendiri.",
        },
        { status: 403 },
      );
    }

    const applicants = marketplaceStore.getApplicationsByTaskId(taskId, currentUser.id);

    return NextResponse.json({
      success: true,
      data: {
        task,
        applicants,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
