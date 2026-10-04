import { notFound } from "next/navigation";
import { TaskDetailClient } from "@/features/tasks/components/task-detail-client";
import { marketplaceStore } from "@/lib/marketplace-store";
import { getCurrentUser } from "@/lib/session-helper";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const task = marketplaceStore.getTaskById(id);
  if (!task) {
    return { title: "Tugas Tidak Ditemukan | NEAR JOB" };
  }
  return {
    title: `${task.title} | NEAR JOB`,
    description: task.description.slice(0, 150),
  };
}

export default async function TaskDetailPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const currentUser = await getCurrentUser();
  const task = marketplaceStore.getTaskById(id, currentUser?.id);

  if (!task) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <TaskDetailClient task={task} currentUser={currentUser} />
    </div>
  );
}
