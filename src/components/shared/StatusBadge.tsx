'use client';

import { STAGE_MAP, LEAD_STATUS_MAP, ASSIGNMENT_STATUS_MAP } from '@/lib/constants';
import type { EditorStage, LeadStatus, AssignmentStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: string;
  type: 'editor' | 'lead' | 'assignment';
}

export default function StatusBadge({ status, type }: StatusBadgeProps) {
  let config: { label: string; badgeClass: string } | undefined;

  if (type === 'editor') {
    config = STAGE_MAP[status as EditorStage];
  } else if (type === 'lead') {
    config = LEAD_STATUS_MAP[status as LeadStatus];
  } else {
    config = ASSIGNMENT_STATUS_MAP[status as AssignmentStatus];
  }

  if (!config) {
    return <span className="badge badge-neutral">{status}</span>;
  }

  return <span className={`badge ${config.badgeClass}`}>{config.label}</span>;
}
