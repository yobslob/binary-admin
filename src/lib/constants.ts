import type { EditorStage, LeadStatus, AssignmentStatus, IEmailTemplate } from './types';

/* ================================================================
   PIPELINE STAGE DEFINITIONS
   ================================================================ */

export interface StageConfig {
  id: EditorStage;
  label: string;
  color: string;
  badgeClass: string;
}

export const PIPELINE_STAGES: StageConfig[] = [
  { id: 'qualified', label: 'Qualified', color: '#3b82f6', badgeClass: 'badge-info' },
  { id: 'call_scheduled', label: 'Call Scheduled', color: '#f59e0b', badgeClass: 'badge-warning' },
  { id: 'denied', label: 'Denied', color: '#ef4444', badgeClass: 'badge-danger' },
  { id: 'onboarded', label: 'Onboarded', color: '#8b5cf6', badgeClass: 'badge-purple' },
  { id: 'contract_signed', label: 'Contract Signed', color: '#c9a84c', badgeClass: 'badge-accent' },
  { id: 'active', label: 'Active', color: '#22c55e', badgeClass: 'badge-success' },
  { id: 'completed', label: 'Completed', color: '#06b6d4', badgeClass: 'badge-cyan' },
];

export const STAGE_MAP = Object.fromEntries(
  PIPELINE_STAGES.map((s) => [s.id, s])
) as Record<EditorStage, StageConfig>;

/* Allowed stage transitions for drag-and-drop validation */
export const STAGE_TRANSITIONS: Record<EditorStage, EditorStage[]> = {
  qualified: ['call_scheduled', 'denied'],
  call_scheduled: ['denied', 'onboarded', 'qualified'],
  denied: ['qualified'],
  onboarded: ['contract_signed', 'denied'],
  contract_signed: ['active', 'denied'],
  active: ['completed'],
  completed: ['active'],
};

/* ================================================================
   LEAD STATUS DEFINITIONS
   ================================================================ */

export interface LeadStatusConfig {
  id: LeadStatus;
  label: string;
  color: string;
  badgeClass: string;
}

export const LEAD_STATUSES: LeadStatusConfig[] = [
  { id: 'unassigned', label: 'Unassigned', color: '#6b7280', badgeClass: 'badge-neutral' },
  { id: 'assigned', label: 'Assigned', color: '#3b82f6', badgeClass: 'badge-info' },
  { id: 'trailer_delivered', label: 'Trailer Delivered', color: '#8b5cf6', badgeClass: 'badge-purple' },
  { id: 'warm_approached', label: 'Warm Approached', color: '#f59e0b', badgeClass: 'badge-warning' },
  { id: 'replied', label: 'Replied', color: '#c9a84c', badgeClass: 'badge-accent' },
  { id: 'on_call', label: 'On Call', color: '#06b6d4', badgeClass: 'badge-cyan' },
  { id: 'closed', label: 'Closed', color: '#22c55e', badgeClass: 'badge-success' },
  { id: 'declined', label: 'Declined', color: '#ef4444', badgeClass: 'badge-danger' },
];

export const LEAD_STATUS_MAP = Object.fromEntries(
  LEAD_STATUSES.map((s) => [s.id, s])
) as Record<LeadStatus, LeadStatusConfig>;

/* ================================================================
   ASSIGNMENT STATUS DEFINITIONS
   ================================================================ */

export interface AssignmentStatusConfig {
  id: AssignmentStatus;
  label: string;
  color: string;
  badgeClass: string;
  order: number;
}

export const ASSIGNMENT_STATUSES: AssignmentStatusConfig[] = [
  { id: 'in_progress', label: 'In Progress', color: '#3b82f6', badgeClass: 'badge-info', order: 1 },
  { id: 'trailer_delivered', label: 'Trailer Delivered', color: '#8b5cf6', badgeClass: 'badge-purple', order: 2 },
  { id: 'warm_approached', label: 'Warm Approached', color: '#f59e0b', badgeClass: 'badge-warning', order: 3 },
  { id: 'replied', label: 'Replied', color: '#c9a84c', badgeClass: 'badge-accent', order: 4 },
  { id: 'on_call', label: 'On Call', color: '#06b6d4', badgeClass: 'badge-cyan', order: 5 },
  { id: 'closed', label: 'Closed', color: '#22c55e', badgeClass: 'badge-success', order: 6 },
  { id: 'declined', label: 'Declined', color: '#ef4444', badgeClass: 'badge-danger', order: 6 },
  { id: 'no_reply', label: 'No Reply', color: '#6b7280', badgeClass: 'badge-neutral', order: 6 },
];

export const ASSIGNMENT_STATUS_MAP = Object.fromEntries(
  ASSIGNMENT_STATUSES.map((s) => [s.id, s])
) as Record<AssignmentStatus, AssignmentStatusConfig>;

/* Allowed assignment status transitions */
export const ASSIGNMENT_TRANSITIONS: Record<AssignmentStatus, AssignmentStatus[]> = {
  in_progress: ['trailer_delivered'],
  trailer_delivered: ['warm_approached'],
  warm_approached: ['replied', 'no_reply'],
  replied: ['on_call'],
  on_call: ['closed', 'declined'],
  closed: [],
  declined: [],
  no_reply: [],
};

/* ================================================================
   FILE TYPE ICONS
   ================================================================ */

export const FILE_TYPE_ICONS: Record<string, string> = {
  video: '🎬',
  document: '📄',
  image: '🖼️',
  other: '📎',
};

/* ================================================================
   DEFAULT SETTINGS
   ================================================================ */

export const DEFAULT_COMMISSION_RATE = 5;

export const TEMPLATE_VARIABLES = [
  '{{editor_name}}',
  '{{editor_email}}',
  '{{meet_link}}',
  '{{discord_link}}',
  '{{lead_name}}',
  '{{company}}',
  '{{date}}',
  '{{time}}',
];

export const DEFAULT_EMAIL_TEMPLATES: IEmailTemplate[] = [
  {
    name: 'Meet Invite',
    subject: 'Binary Growth — Editor Call Invitation',
    body: `Hi {{editor_name}},

Thank you for your interest in joining Binary Growth as an editor.

We'd love to get on a call with you to discuss how we work and the commission-based model. Here's the meeting link:

{{meet_link}}

Looking forward to speaking with you!

Best,
Binary Growth Team`,
  },
  {
    name: 'Onboarding Welcome',
    subject: 'Welcome to Binary Growth — Next Steps',
    body: `Hi {{editor_name}},

Welcome aboard! We're excited to have you join the Binary Growth team.

Please join our Discord channel using the link below to get started:

{{discord_link}}

We'll brief you on your first trailer assignment soon.

Best,
Binary Growth Team`,
  },
  {
    name: 'Assignment Brief',
    subject: 'New Assignment — {{lead_name}} ({{company}})',
    body: `Hi {{editor_name}},

You've been assigned a new trailer project.

Client: {{lead_name}}
Company: {{company}}

Please review the files shared with you and begin working on the trailer. Reach out if you have any questions.

Best,
Binary Growth Team`,
  },
];
