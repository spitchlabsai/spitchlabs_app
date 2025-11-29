// components/section-cards.tsx
"use client";

import {
  IconPhoneOutgoing,
  IconPhoneIncoming,
  IconClockHour4,
  IconArrowUpRight,
  IconArrowDownRight,
  IconMinus,
  IconTrendingUp,
} from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TrendDirection = "up" | "down" | "flat";
type MetricColor = "blue" | "violet" | "amber";

interface MetricCardProps {
  label: string;
  value: string;
  helperText: string;
  trendLabel: string;
  trendDirection: TrendDirection;
  icon: React.ReactNode;
  color: MetricColor;
}

const colorStyles = {
  blue: {
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
    borderHover: "group-hover:border-blue-500/50",
    badgeColor: "text-blue-600 dark:text-blue-400",
    gradientFrom: "from-blue-500/5",
  },
  violet: {
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-600 dark:text-violet-400",
    borderHover: "group-hover:border-violet-500/50",
    badgeColor: "text-violet-600 dark:text-violet-400",
    gradientFrom: "from-violet-500/5",
  },
  amber: {
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    borderHover: "group-hover:border-amber-500/50",
    badgeColor: "text-amber-600 dark:text-amber-400",
    gradientFrom: "from-amber-500/5",
  },
};

function TrendBadge({
  direction,
  label,
}: {
  direction: TrendDirection;
  label: string;
}) {
  if (direction === "flat") {
    return (
      <div className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
        <IconMinus className="h-3 w-3" />
        <span>{label}</span>
      </div>
    );
  }

  const isUp = direction === "up";
  const colorClass = isUp
    ? "text-emerald-600 dark:text-emerald-400"
    : "text-rose-600 dark:text-rose-400";

  const Icon = isUp ? IconArrowUpRight : IconArrowDownRight;

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-[11px] font-medium",
        colorClass
      )}
    >
      <div className="flex h-4 w-4 items-center justify-center rounded-full bg-current/10">
        <Icon className="h-3 w-3" />
      </div>
      <span>{label}</span>
    </div>
  );
}

function MetricCard({
  label,
  value,
  helperText,
  trendLabel,
  trendDirection,
  icon,
  color,
}: MetricCardProps) {
  const styles = colorStyles[color];

  return (
    <Card
      className={cn(
        "group relative h-full overflow-hidden border-border/50 bg-background/70 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md",
        "rounded-lg sm:rounded-xl text-sm",
        styles.borderHover
      )}
    >
      {/* Subtle Background Gradient & Pattern */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br to-transparent opacity-20 transition-opacity group-hover:opacity-70",
          styles.gradientFrom
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:14px_14px] opacity-[0.12] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)]" />

      <CardHeader className="relative space-y-1 px-3 py-3 sm:px-4 sm:py-3">
        <div className="flex items-start justify-between gap-2">
          <CardDescription className="text-xs font-medium text-muted-foreground/80">
            {label}
          </CardDescription>
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md transition-colors sm:h-8 sm:w-8",
              styles.iconBg,
              styles.iconColor
            )}
          >
            {/* icons will scale with container */}
            {icon}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight tabular-nums sm:text-3xl lg:text-[1.9rem]">
          {value}
        </CardTitle>
      </CardHeader>

      <CardContent className="relative px-3 pb-2 pt-0 sm:px-4 sm:pb-3">
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-snug">
          {helperText}
        </p>
      </CardContent>

      <CardFooter className="relative px-3 pb-3 pt-0 sm:px-4 sm:pb-4">
        <TrendBadge direction={trendDirection} label={trendLabel} />
      </CardFooter>
    </Card>
  );
}

export function SectionCards() {
  const callsMadeOutbound = "3,542";
  const callsReceivedInbound = "1,284";
  const avgCallDuration = "2m 36s";

  return (
    <section className="space-y-3 sm:space-y-4">
      <div className="flex flex-col items-start justify-between gap-2 px-1 sm:flex-row sm:items-center">
        <h2 className="text-base font-semibold tracking-tight sm:text-lg">
          Performance Overview
        </h2>
        <Badge
          variant="secondary"
          className="gap-1 text-[11px] font-normal text-muted-foreground"
        >
          <IconTrendingUp className="h-3 w-3" />
          Last 7 Days
        </Badge>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 md:gap-4 lg:grid-cols-3">
        <MetricCard
          label="Outbound Calls"
          value={callsMadeOutbound}
          helperText="Total outbound calls placed."
          trendLabel="+8.2% increase"
          trendDirection="up"
          icon={<IconPhoneOutgoing className="h-4 w-4" />}
          color="blue"
        />

        <MetricCard
          label="Inbound Volume"
          value={callsReceivedInbound}
          helperText="Total inbound calls received."
          trendLabel="-3.4% decrease"
          trendDirection="down"
          icon={<IconPhoneIncoming className="h-4 w-4" />}
          color="violet"
        />

        <MetricCard
          label="Avg Duration"
          value={avgCallDuration}
          helperText="Mean talk time per call."
          trendLabel="+6.9% increase"
          trendDirection="up"
          icon={<IconClockHour4 className="h-4 w-4" />}
          color="amber"
        />
      </div>
    </section>
  );
}
