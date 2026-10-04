import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";
import { curateApplicationSchema } from "@/lib/validations";

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id: taskId } = await props.params;
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = curateApplicationSchema.safeParse({
      taskId,
      applicationId: body.applicationId,
      status: body.status,
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

    const { application, transaction } = marketplaceStore.curateApplication(
      currentUser.id,
      taskId,
      parsed.data.applicationId,
      parsed.data.status,
    );

    return NextResponse.json({
      success: true,
      data: {
        application,
        transaction,
      },
      message:
        parsed.data.status === "ACCEPTED"
          ? "Pelamar berhasil diterima! Status tugas telah diperbarui menjadi 'Berjalan'."
          : "Lamaran telah ditolak.",
    });
  } catch (error) {
    const msg = (error as Error).message;
    const status = msg.includes("Akses ditolak") ? 403 : 400;
    return NextResponse.json({ success: false, error: msg }, { status });
  }
}
