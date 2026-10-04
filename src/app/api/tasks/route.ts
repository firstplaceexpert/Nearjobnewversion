import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";
import { postTaskSchema } from "@/lib/validations";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const type = searchParams.get("type") || undefined;
    const location = searchParams.get("location") || undefined;
    const currentUser = await getCurrentUser();

    const tasks = marketplaceStore.getTasks({
      search,
      category,
      type,
      location,
      status: "OPEN",
      currentUserId: currentUser?.id,
    });

    return NextResponse.json({
      success: true,
      data: tasks,
      total: tasks.length,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Silakan login terlebih dahulu" },
        { status: 401 },
      );
    }

    if (currentUser.role !== "POSTER") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Akses ditolak: Hanya akun Pemberi Tugas (Poster) yang dapat memposting pekerjaan",
        },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = postTaskSchema.safeParse(body);

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

    const newTask = marketplaceStore.createTask(currentUser.id, parsed.data);

    return NextResponse.json(
      {
        success: true,
        data: newTask,
        message: "Tugas berhasil diposting!",
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
