/**
 * تایم‌لاین روند سفارش — Server Component
 * ─────────────────────────────────────────────────
 * مراحل رخ‌داده + مراحل آیندهٔ خاموش (تا پایان جریان)؛
 * سفارش لغوشده/مرجوعی کل تایم‌لاین را destructive می‌کند.
 */

import { cn } from "@/lib/utils";
import { faDateTime } from "@/lib/jalali";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  type OrderStatusDTO,
  type OrderTimelineItem,
} from "@/types/shop";

interface OrderTimelineProps {
  items: OrderTimelineItem[];
  current: OrderStatusDTO;
}

type StepState = "past" | "current" | "future";

interface RenderedStep {
  status: OrderStatusDTO;
  state: StepState;
  /** ISO — فقط برای مراحل رخ‌داده */
  at: string | null;
  note: string | null;
}

export function OrderTimeline({ items, current }: OrderTimelineProps) {
  const canceled = current === "CANCELED" || current === "RETURNED";

  /* مراحل آیندهٔ جریان که هنوز رخ نداده‌اند */
  const happened = new Set(items.map((item) => item.status));
  const currentFlowIndex = ORDER_STATUS_FLOW.indexOf(current);
  const futureStatuses: OrderStatusDTO[] =
    canceled || currentFlowIndex === -1
      ? []
      : ORDER_STATUS_FLOW.slice(currentFlowIndex + 1).filter(
          (status) => !happened.has(status),
        );

  const steps: RenderedStep[] = [
    ...items.map((item) => ({
      status: item.status,
      state: (item.status === current ? "current" : "past") as StepState,
      at: item.createdAt,
      note: item.note,
    })),
    ...futureStatuses.map((status) => ({
      status,
      state: "future" as const,
      at: null,
      note: null,
    })),
  ];

  return (
    <ol className="space-y-0" aria-label="روند سفارش">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        /* خط اتصال هر مرحله به مرحلهٔ بعد — رنگش از گامِ بعدی تبعیت می‌کند */
        const nextStep = steps[index + 1];
        const nextIsFuture = nextStep != null && nextStep.state === "future";
        const lineClass = canceled
          ? "bg-destructive/40"
          : nextIsFuture
            ? "bg-border"
            : "bg-gold/40";

        const circleClass = canceled
          ? "bg-destructive"
          : step.state === "future"
            ? "bg-muted-foreground/25"
            : "bg-gold";

        const labelClass = canceled
          ? step.state === "current"
            ? "font-semibold text-destructive"
            : "font-semibold text-foreground"
          : step.state === "current"
            ? "font-semibold text-primary"
            : step.state === "future"
              ? "font-semibold text-muted-foreground"
              : "font-semibold text-foreground";

        return (
          <li
            key={`${step.status}-${index}`}
            className="flex gap-4"
            aria-current={step.state === "current" ? "step" : undefined}
          >
            {/* ستون نشانگر — دایره + خط اتصال کشیده */}
            <div className="flex flex-col items-center" aria-hidden="true">
              <span
                className={cn(
                  "mt-1.5 size-3.5 shrink-0 rounded-full",
                  circleClass,
                  step.state === "current" &&
                    (canceled
                      ? "ring-4 ring-destructive/20"
                      : "ring-4 ring-gold/20"),
                )}
              />
              {isLast ? null : <span className={cn("w-px flex-1", lineClass)} />}
            </div>

            {/* متن مرحله */}
            <div className={cn("min-w-0 flex-1", !isLast && "pb-8")}>
              <p className={labelClass}>{ORDER_STATUS_LABELS[step.status]}</p>
              {step.at !== null ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {faDateTime(step.at)}
                </p>
              ) : null}
              {step.note !== null ? (
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {step.note}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
