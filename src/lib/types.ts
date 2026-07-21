/* ================================================================
   SHARED TYPE DEFINITIONS
   Used by both API routes and frontend components
   ================================================================ */

export type EditorStage =
  | 'qualified'
  | 'call_scheduled'
  | 'denied'
  | 'onboarded'
  | 'contract_signed'
  | 'active'
  | 'completed';

export type LeadStatus =
  | 'unassigned'
  | 'assigned'
  | 'trailer_delivered'
  | 'warm_approached'
  | 'replied'
  | 'on_call'
  | 'closed'
  | 'declined';

export type AssignmentStatus =
  | 'in_progress'
  | 'trailer_delivered'
  | 'warm_approached'
  | 'replied'
  | 'on_call'
  | 'closed'
  | 'declined'
  | 'no_reply';

export interface FileReference {
  name: string;
  url: string;
  type?: 'video' | 'document' | 'image' | 'other';
}

export interface IEditor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  discordUsername?: string;
  stage: EditorStage;
  meetLink?: string;
  commissionRate: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ILead {
  _id: string;
  name: string;
  email?: string;
  company?: string;
  files: FileReference[];
  status: LeadStatus;
  ticketSize?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IAssignment {
  _id: string;
  editorId: string;
  leadId: string;
  editor?: IEditor;
  lead?: ILead;
  status: AssignmentStatus;
  trailerDeliveredAt?: string;
  warmApproachedAt?: string;
  repliedAt?: string;
  closedAt?: string;
  commissionEarned?: number;
  notes?: string;
  deadline?: string;
  assignedAt: string;
  updatedAt: string;
}

export interface IEmailTemplate {
  _id?: string;
  name: string;
  subject: string;
  body: string;
}

export interface ISettings {
  _id?: string;
  key: string;
  value: IEmailTemplate[] | unknown;
}
