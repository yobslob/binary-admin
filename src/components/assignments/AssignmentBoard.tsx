'use client';

import { useState } from 'react';
import type { IAssignment, IEditor, ILead } from '@/lib/types';
import { ASSIGNMENT_STATUSES } from '@/lib/constants';
import AssignmentModal from './AssignmentModal';
import StatusBadge from '../shared/StatusBadge';

interface AssignmentBoardProps {
  assignments: IAssignment[];
  editors: IEditor[];
  leads: ILead[];
  onSave: (data: Record<string, unknown>, id?: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function AssignmentBoard({
  assignments,
  editors,
  leads,
  onSave,
  onDelete,
  onRefresh,
}: AssignmentBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [draggingAssignment, setDraggingAssignment] = useState<IAssignment | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<IAssignment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAssignments = assignments.filter((a) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        a.editor?.name.toLowerCase().includes(q) ||
        a.lead?.name.toLowerCase().includes(q) ||
        (a.lead?.company && a.lead.company.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getAssignmentsByStatus = (statusId: string) =>
    filteredAssignments.filter((a) => a.status === statusId);

  const handleDragStart = (assignment: IAssignment) => {
    setDraggingAssignment(assignment);
  };

  const handleDragOver = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    if (draggingAssignment && draggingAssignment.status !== statusId) {
      setDragOverColumn(statusId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggingAssignment && draggingAssignment.status !== statusId) {
      onSave({ status: statusId }, draggingAssignment._id);
    }
    setDraggingAssignment(null);
  };

  const handleDragEnd = () => {
    setDraggingAssignment(null);
    setDragOverColumn(null);
  };

  const handleAdd = () => {
    setEditingAssignment(null);
    setModalOpen(true);
  };

  const handleEdit = (assignment: IAssignment) => {
    setEditingAssignment(assignment);
    setModalOpen(true);
  };

  const handleSave = (data: Record<string, unknown>, id?: string) => {
    onSave(data, id);
    setModalOpen(false);
    setEditingAssignment(null);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  // Helper to render assignment card
  const renderCard = (a: IAssignment) => (
    <div
      key={a._id}
      className="editor-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        handleDragStart(a);
      }}
      onDragEnd={handleDragEnd}
      onClick={() => handleEdit(a)}
      style={{ cursor: 'grab' }}
    >
      <div className="editor-card-name">{a.editor?.name || '—'}</div>
      <div className="editor-card-meta" style={{ marginTop: 4 }}>
        <span className="text-secondary text-sm">Lead: {a.lead?.name || '—'}</span>
      </div>
      
      <div className="editor-card-meta" style={{ marginTop: 8 }}>
        <span className="badge badge-neutral">Assigned {formatDate(a.assignedAt)}</span>
        {a.deadline && (
          <span className="badge badge-warning" style={{ backgroundColor: 'var(--warning-subtle)', color: 'var(--warning)' }}>
            Due {formatDate(a.deadline)}
          </span>
        )}
      </div>

      <div className="editor-card-actions">
        {a.commissionEarned ? (
          <span style={{ color: 'var(--success)', fontWeight: 500, fontSize: '0.8rem' }}>
            ₹{a.commissionEarned.toLocaleString('en-IN')}
          </span>
        ) : <span />}
        <button
          className="btn btn-xs btn-danger"
          onClick={(e) => { e.stopPropagation(); onDelete(a._id); }}
        >
          🗑
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="assignment-tracker-header" style={{ marginBottom: 16 }}>
        <h3>Assignments <span className="text-secondary text-sm">({assignments.length})</span></h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleAdd}>
            + New Assignment
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {ASSIGNMENT_STATUSES.map((status) => {
          const columnAssignments = getAssignmentsByStatus(status.id);
          const isDragOver = dragOverColumn === status.id;

          return (
            <div
              key={status.id}
              className={`kanban-column${isDragOver ? ' drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, status.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status.id)}
            >
              <div className="column-header">
                <div className="column-title">
                  <span className="column-dot" style={{ backgroundColor: status.color }} />
                  {status.label}
                </div>
                <span className="column-count">{columnAssignments.length}</span>
              </div>

              <div className="column-cards">
                {columnAssignments.length === 0 ? (
                  <div className="column-empty">No assignments</div>
                ) : (
                  columnAssignments.map(renderCard)
                )}

                {status.id === 'in_progress' && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleAdd}
                    style={{ width: '100%', marginTop: 4 }}
                  >
                    + Add Assignment
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
    </>
  );
}
