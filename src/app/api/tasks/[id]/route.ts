import { NextResponse } from "next/server";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";
import { calculateCommission } from "@/features/payments/services/calculateCommission";

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await props.params;
    const currentUser = await getCurrentUser();
    const task = marketplaceStore.getTaskById(id, currentUser?.id);

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Tugas tidak ditemukan" },
        { status: 404 },
      );
    }

    const commission = calculateCommission(task.budget);

    return NextResponse.json({
      success: true,
      data: {
        ...task,
        commission,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
