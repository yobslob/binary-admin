'use client';

import { useState, useEffect } from 'react';
import type { IEditor, ILead, IAssignment } from '@/lib/types';
import { ASSIGNMENT_STATUSES, ASSIGNMENT_TRANSITIONS } from '@/lib/constants';

interface AssignmentModalProps {
  isOpen: boolean;
  assignment?: IAssignment | null;
  editors: IEditor[];
  leads: ILead[];
  onSave: (data: Record<string, unknown>, id?: string) => void;
  onClose: () => void;
}

export default function AssignmentModal({
  isOpen,
  assignment,
  editors,
  leads,
  onSave,
  onClose,
}: AssignmentModalProps) {
  const [editorId, setEditorId] = useState('');
  const [leadId, setLeadId] = useState('');
  const [status, setStatus] = useState('in_progress');
  const [ticketSize, setTicketSize] = useState(0);
  const [notes, setNotes] = useState('');

  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (assignment) {
      setEditorId(typeof assignment.editorId === 'string' ? assignment.editorId : assignment.editor?._id || '');
      setLeadId(typeof assignment.leadId === 'string' ? assignment.leadId : assignment.lead?._id || '');
      setStatus(assignment.status);
      setTicketSize(assignment.lead?.ticketSize || 0);
      setNotes(assignment.notes || '');
      setDeadline(assignment.deadline ? new Date(assignment.deadline).toISOString().split('T')[0] : '');
    } else {
      setEditorId('');
      setLeadId('');
      setStatus('in_progress');
      setTicketSize(0);
      setNotes('');
      setDeadline('');
    }
  }, [assignment]);

  const isEditing = !!assignment;

  // For new assignments: only editors with contract_signed, active, or completed stages
  const eligibleEditors = editors.filter((e) =>
    ['contract_signed', 'active', 'completed'].includes(e.stage)
  );

  // For new assignments: only unassigned leads
  const availableLeads = leads.filter((l) => l.status === 'unassigned');

  // For editing: allowed status transitions
  const allowedStatuses = isEditing
    ? [
        assignment!.status,
        ...(ASSIGNMENT_TRANSITIONS[assignment!.status] || []),
      ]
    : ['in_progress'];

  const selectedEditor = editors.find((e) => e._id === editorId) || assignment?.editor;
  const commissionRate = selectedEditor?.commissionRate || 5;
  const estimatedCommission = (ticketSize * commissionRate) / 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data: Record<string, unknown> = { notes };
    if (deadline) data.deadline = new Date(deadline).toISOString();

    if (isEditing) {
      data.status = status;
      if (ticketSize > 0) {
        data.ticketSize = ticketSize;
      }
      onSave(data, assignment!._id);
    } else {
      if (!editorId || !leadId) return;
      data.editorId = editorId;
      data.leadId = leadId;
      onSave(data);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEditing ? 'Edit Assignment' : 'New Assignment'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {isEditing ? (
              <>
                <div className="input-row">
                  <div className="input-group">
                    <label className="input-label">Editor</label>
                    <div className="input" style={{ background: 'var(--surface-elevated)', cursor: 'default' }}>
                      {assignment?.editor?.name || 'Unknown'}
                    </div>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Lead</label>
                    <div className="input" style={{ background: 'var(--surface-elevated)', cursor: 'default' }}>
                      {assignment?.lead?.name || 'Unknown'}
                      {assignment?.lead?.company && ` (${assignment.lead.company})`}
                    </div>
                  </div>
                </div>

                <div className="input-row">
                  <div className="input-group">
                    <label className="input-label">Status</label>
                    <select
                      className="select"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      id="assignment-status"
                    >
                      {allowedStatuses.map((s) => {
                        const cfg = ASSIGNMENT_STATUSES.find((a) => a.id === s);
                        return (
                          <option key={s} value={s}>
                            {cfg?.label || s}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="input-group">
                    <label className="input-label">Ticket Size (₹)</label>
                    <input
                      className="input"
                      type="number"
                      min={0}
                      value={ticketSize}
                      onChange={(e) => setTicketSize(Number(e.target.value))}
                      id="assignment-ticket"
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label className="input-label">Deadline</label>
                  <input
                    className="input"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>

                {(status === 'closed' || ticketSize > 0) && (
                  <div
                    style={{
                      padding: '12px 16px',
                      background: 'var(--success-subtle)',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                    }}
                  >
                    <span className="text-secondary">Commission ({commissionRate}%): </span>
                    <strong style={{ color: 'var(--success)' }}>₹{estimatedCommission.toLocaleString('en-IN')}</strong>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="input-group">
                  <label className="input-label">Select Editor <span className="input-required">*</span></label>
                  <select
                    className="select"
                    value={editorId}
                    onChange={(e) => setEditorId(e.target.value)}
                    required
                    id="assignment-editor"
                  >
                    <option value="">Choose an editor...</option>
                    {eligibleEditors.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.name} ({e.email}) — {e.stage}
                      </option>
                    ))}
                  </select>
                  {eligibleEditors.length === 0 && (
                    <span className="text-secondary text-xs">
                      No eligible editors. Editors must be at contract_signed, active, or completed stage.
                    </span>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Select Lead <span className="input-required">*</span></label>
                  <select
                    className="select"
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    required
                    id="assignment-lead"
                  >
                    <option value="">Choose a lead...</option>
                    {availableLeads.map((l) => (
                      <option key={l._id} value={l._id}>
                        {l.name} {l.company && `(${l.company})`}
                      </option>
                    ))}
                  </select>
                  {availableLeads.length === 0 && (
                    <span className="text-secondary text-xs">No unassigned leads available.</span>
                  )}
                </div>

                <div className="input-group">
                  <label className="input-label">Deadline</label>
                  <input
                    className="input"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="input-group">
              <label className="input-label">Notes</label>
              <textarea
                className="textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Assignment notes..."
                rows={3}
                id="assignment-notes"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isEditing && (!editorId || !leadId)}
              id="assignment-save"
            >
              {isEditing ? 'Update' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
