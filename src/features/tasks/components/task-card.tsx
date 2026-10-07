import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { calculateCommission } from "@/features/payments/services/calculateCommission";
import { JOB_TYPE_BADGE, TASK_STATUS_CONFIG } from "@/lib/constants";
import type { TaskItem } from "@/features/tasks/types";

interface TaskCardProps {
  task: TaskItem;
}

export function TaskCard({ task }: TaskCardProps) {
  const typeConfig = JOB_TYPE_BADGE[task.type] || JOB_TYPE_BADGE.DAILY;
  const statusConfig = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.OPEN;
  const commission = calculateCommission(task.budget);

  return (
    <Card
      hover
      className="flex flex-col justify-between h-full group transition-all duration-200"
    >
      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Badges */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="primary" size="sm">
                {task.category}
              </Badge>
              <Badge variant={typeConfig.variant} size="sm">
                {typeConfig.label}
              </Badge>
              {task.voucherCode && (
                <Badge variant="success" size="sm">
                  Diskon Promo
                </Badge>
              )}
            </div>
            {task.status !== "OPEN" ? (
              <Badge variant={statusConfig.variant} size="sm">
                {statusConfig.label}
              </Badge>
            ) : task.hasApplied ? (
              <Badge variant="warning" size="sm">
                Sudah Dilamar
              </Badge>
            ) : null}
          </div>

          {/* Title */}
          <Link
            href={`/tasks/${task.id}`}
            className="group-hover:text-primary transition-colors"
          >
            <h3 className="font-bold text-dark text-base sm:text-lg line-clamp-2 leading-snug mb-2">
              {task.title}
            </h3>
          </Link>

          {/* Description snippet */}
          <p className="text-gray text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed">
            {task.description}
          </p>

          {/* Metadata: Location & Schedule */}
          <div className="space-y-1.5 text-xs text-gray mb-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-primary shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="truncate">{task.location}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                className="w-4 h-4 text-warning shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {task.scheduleDate} • {task.scheduleTime}
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Budget & Action */}
        <div className="pt-3 border-t border-light mt-auto">
          <div className="flex items-end justify-between gap-2 mb-3">
            <div>
              <span className="text-[11px] text-gray block">Imbalan / Upah</span>
              <span className="font-bold text-dark text-base sm:text-lg">
                {formatRupiah(task.budget)}
              </span>
              <span className="text-[11px] text-success block font-medium">
                Bersih: {formatRupiah(commission.netAmount)}
              </span>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-gray block">
                {task.applicationsCount || 0} Pelamar
              </span>
              <span className="text-[10px] text-gray-light">
                Oleh {task.poster?.name?.split(" ")[0] || "Poster"}
              </span>
            </div>
          </div>

          <Link href={`/tasks/${task.id}`} className="w-full block">
            <Button variant="outline" size="sm" className="w-full font-semibold">
              Lihat Detail
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
