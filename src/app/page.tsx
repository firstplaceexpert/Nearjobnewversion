import { Navbar, Footer, MobileBottomNav } from "@/components/ui";
import { CustomerFocusHome } from "@/components/home/customer-focus-home";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const currentUser = await getCurrentUser();
  const tasks = marketplaceStore.getTasks({
    status: "OPEN",
    currentUserId: currentUser?.id,
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 bg-gradient-to-b from-light/40 to-white">
        <CustomerFocusHome initialTasks={tasks} currentUserId={currentUser?.id} />
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
