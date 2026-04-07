/**
 * @file entities/step/ui/step-badge.tsx
 * @description Step 타입 배지 컴포넌트
 */

import type { StepType } from "../model/step.types";
import {
  STEP_TYPE_LABELS,
  STEP_TYPE_COLORS,
  STEP_TYPE_ICONS,
} from "../model/step.constants";

interface StepBadgeProps {
  type: StepType;
  showIcon?: boolean;
  className?: string;
}

export function StepBadge({
  type,
  showIcon = true,
  className = "",
}: StepBadgeProps) {
  const colorClass = STEP_TYPE_COLORS[type];
  const label = STEP_TYPE_LABELS[type];
  const icon = showIcon ? STEP_TYPE_ICONS[type] : null;

  return (
    <span
      role="badge"
      aria-label={`풀이 단계 타입: ${label}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${colorClass} ${className}`}
    >
      {icon && <span className="text-sm">{icon}</span>}
      <span>{label}</span>
    </span>
  );
}
