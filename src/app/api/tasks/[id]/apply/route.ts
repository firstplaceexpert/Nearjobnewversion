import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";
import { applyTaskSchema } from "@/lib/validations";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await props.params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu untuk melamar tugas" },
        { status: 401 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const parsed = applyTaskSchema.safeParse({
      taskId,
      note: body.note,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validasi gagal",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const application = marketplaceStore.applyForTask(
      currentUser.id,
      taskId,
      parsed.data.note,
    );

    return NextResponse.json(
      {
        success: true,
        data: application,
        message: "Lamaran berhasil dikirim! Menunggu kurasi dari pemberi tugas.",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 },
    );
  }
}
