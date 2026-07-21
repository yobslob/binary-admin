'use client';

import { useState } from 'react';
import type { IAssignment, IEditor, ILead } from '@/lib/types';
import { ASSIGNMENT_STATUSES } from '@/lib/constants';
import StatusBadge from '../shared/StatusBadge';
import AssignmentModal from './AssignmentModal';

interface AssignmentTrackerProps {
  assignments: IAssignment[];
  editors: IEditor[];
  leads: ILead[];
  onSave: (data: Record<string, unknown>, id?: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function AssignmentTracker({
  assignments,
  editors,
  leads,
  onSave,
  onDelete,
  onRefresh,
}: AssignmentTrackerProps) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<IAssignment | null>(null);

  const filtered = statusFilter
    ? assignments.filter((a) => a.status === statusFilter)
    : assignments;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleRowClick = (assignment: IAssignment) => {
    setEditingAssignment(assignment);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingAssignment(null);
    setModalOpen(true);
  };

  const handleSave = (data: Record<string, unknown>, id?: string) => {
    onSave(data, id);
    setModalOpen(false);
    setEditingAssignment(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  return (
    <div className="assignment-tracker">
      <div className="assignment-tracker-header">
        <h3>Assignments <span className="text-secondary text-sm">({assignments.length})</span></h3>
        <button className="btn btn-primary btn-sm" onClick={handleAdd} id="add-assignment-btn">
          + New Assignment
        </button>
      </div>

      <div className="lead-pool-filters" style={{ marginBottom: 16 }}>
        <button
          className={`filter-chip${statusFilter === null ? ' active' : ''}`}
          onClick={() => setStatusFilter(null)}
        >
          All
        </button>
        {ASSIGNMENT_STATUSES.map((s) => (
          <button
            key={s.id}
            className={`filter-chip${statusFilter === s.id ? ' active' : ''}`}
            onClick={() => setStatusFilter(statusFilter === s.id ? null : s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔗</div>
          <div className="empty-state-text">No assignments found</div>
          <div className="empty-state-subtext">
            {statusFilter ? 'Try adjusting your filters' : 'Create an assignment to link an editor with a lead'}
          </div>
        </div>
      ) : (
        <table className="assignment-table">
          <thead>
            <tr>
              <th>Editor</th>
              <th>Lead</th>
              <th>Company</th>
              <th>Status</th>
              <th>Assigned</th>
              <th>Commission</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a._id} onClick={() => handleRowClick(a)}>
                <td style={{ fontWeight: 500 }}>{a.editor?.name || '—'}</td>
                <td>{a.lead?.name || '—'}</td>
                <td className="text-secondary">{a.lead?.company || '—'}</td>
                <td><StatusBadge status={a.status} type="assignment" /></td>
                <td className="text-secondary text-sm">{formatDate(a.assignedAt)}</td>
                <td>
                  {a.commissionEarned ? (
                    <span style={{ color: 'var(--success)', fontWeight: 500 }}>
                      ₹{a.commissionEarned.toLocaleString('en-IN')}
                    </span>
                  ) : (
                    <span className="text-tertiary">—</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-xs btn-danger"
                    onClick={(e) => handleDelete(e, a._id)}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <AssignmentModal
          isOpen={modalOpen}
          assignment={editingAssignment}
          editors={editors}
          leads={leads}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditingAssignment(null);
          }}
        />
      )}
    </div>
  );
}
