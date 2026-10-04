import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";

export async function GET() {
  const currentUser = await getCurrentUser();
  const allUsers = marketplaceStore.getAllUsers();
  return NextResponse.json({
    success: true,
    currentUser,
    allUsers,
  });
}

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    const user = marketplaceStore.getUser(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User tidak ditemukan" },
        { status: 404 },
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("nearjob_active_user", user.id, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: false,
    });

    return NextResponse.json({
      success: true,
      user,
      message: `Beralih ke akun ${user.name} (${user.role})`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 },
    );
  }
}
