'use client';

import { useState } from 'react';
import type { IEditor, ILead, IAssignment } from '@/lib/types';
import { PIPELINE_STAGES, STAGE_TRANSITIONS } from '@/lib/constants';
import EditorCard from './EditorCard';
import EditorModal from './EditorModal';
import LeadModal from '../leads/LeadModal';

interface PipelineBoardProps {
  editors: IEditor[];
  leads: ILead[];
  assignments: IAssignment[];
  onSave: (data: Partial<IEditor>, id?: string) => void;
  onDelete: (id: string) => void;
  onStageChange: (id: string, newStage: string) => void;
  onSaveAssignment: (data: Record<string, unknown>, id?: string) => void;
  onRefresh: () => void;
}

export default function PipelineBoard({
  editors,
  leads,
  assignments,
  onSave,
  onDelete,
  onStageChange,
  onSaveAssignment,
  onRefresh,
}: PipelineBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [draggingEditor, setDraggingEditor] = useState<IEditor | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEditor, setEditingEditor] = useState<IEditor | null>(null);

  // Smart integration: Assign lead modal when moving to Active
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [pendingActiveEditor, setPendingActiveEditor] = useState<IEditor | null>(null);
  const [assignLeadId, setAssignLeadId] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');

  // View Lead Modal state
  const [viewLeadModalOpen, setViewLeadModalOpen] = useState(false);
  const [viewLeadData, setViewLeadData] = useState<ILead | null>(null);

  const getEditorsByStage = (stageId: string) =>
    editors.filter((e) => e.stage === stageId);

  const handleDragStart = (editor: IEditor) => {
    setDraggingEditor(editor);
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggingEditor && draggingEditor.stage !== stageId) {
      const allowed = STAGE_TRANSITIONS[draggingEditor.stage] || [];
      if (allowed.includes(stageId as IEditor['stage'])) {
        setDragOverColumn(stageId);
      }
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggingEditor && draggingEditor.stage !== stageId) {
      const allowed = STAGE_TRANSITIONS[draggingEditor.stage] || [];
      if (allowed.includes(stageId as IEditor['stage'])) {
        processStageChange(draggingEditor, stageId);
      }
    }
    setDraggingEditor(null);
  };

  const handleDragEnd = () => {
    setDraggingEditor(null);
    setDragOverColumn(null);
  };

  const processStageChange = (editor: IEditor, stageId: string) => {
    if (stageId === 'active') {
      // Check if editor already has an active assignment
      const hasActiveAssignment = assignments.some(
        (a) => a.editorId === editor._id && !['closed', 'declined', 'no_reply'].includes(a.status)
      );

      if (!hasActiveAssignment) {
        // Need to assign a lead first
        setPendingActiveEditor(editor);
        setAssignLeadId('');
        setAssignDeadline('');
        setAssignModalOpen(true);
        return;
      }
    }
    onStageChange(editor._id, stageId);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingActiveEditor || !assignLeadId) return;

    const data: Record<string, unknown> = {
      editorId: pendingActiveEditor._id,
      leadId: assignLeadId,
      status: 'in_progress',
    };
    if (assignDeadline) {
      data.deadline = new Date(assignDeadline).toISOString();
    }

    onSaveAssignment(data);
    onStageChange(pendingActiveEditor._id, 'active');
    setAssignModalOpen(false);
    setPendingActiveEditor(null);
  };

  const handleAddEditor = () => {
    setEditingEditor(null);
    setModalOpen(true);
  };

  const handleEditEditor = (editor: IEditor) => {
    setEditingEditor(editor);
    setModalOpen(true);
  };

  const handleModalSave = (data: Partial<IEditor>) => {
    onSave(data, editingEditor?._id);
    setModalOpen(false);
    setEditingEditor(null);
  };

  const handleLeadClick = (lead: ILead) => {
    setViewLeadData(lead);
    setViewLeadModalOpen(true);
  };

  const unassignedLeads = leads.filter(l => l.status === 'unassigned');

  return (
    <>
      <div className="kanban-board">
        {PIPELINE_STAGES.map((stage) => {
          const stageEditors = getEditorsByStage(stage.id);
          const isDragOver = dragOverColumn === stage.id;

          return (
            <div
              key={stage.id}
              className={`kanban-column${isDragOver ? ' drag-over' : ''}`}
              onDragOver={(e) => handleDragOver(e, stage.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              <div className="column-header">
                <div className="column-title">
                  <span className="column-dot" style={{ backgroundColor: stage.color }} />
                  {stage.label}
                </div>
                <span className="column-count">{stageEditors.length}</span>
              </div>

              <div className="column-cards">
                {stageEditors.length === 0 ? (
                  <div className="column-empty">No editors</div>
                ) : (
                  stageEditors.map((editor) => {
                    // Find active assignment
                    const activeAssignment = assignments.find(
                      (a) => a.editor?._id === editor._id && !['closed', 'declined', 'no_reply'].includes(a.status)
                    );

                    return (
                      <EditorCard
                        key={editor._id}
                        editor={editor}
                        activeAssignment={activeAssignment}
                        onDragStart={() => handleDragStart(editor)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleEditEditor(editor)}
                        onDelete={() => onDelete(editor._id)}
                        onStageChange={(newStage) => processStageChange(editor, newStage)}
                        onLeadClick={() => activeAssignment?.lead && handleLeadClick(activeAssignment.lead)}
                      />
                    );
                  })
                )}

                {stage.id === 'qualified' && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleAddEditor}
                    style={{ width: '100%', marginTop: 4 }}
                    id="add-editor-btn"
                  >
                    + Add Editor
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <EditorModal
          isOpen={modalOpen}
          editor={editingEditor}
          onSave={handleModalSave}
          onClose={() => {
            setModalOpen(false);
            setEditingEditor(null);
          }}
        />
      )}

      {assignModalOpen && (
        <div className="modal-overlay" onClick={() => setAssignModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Assign Lead to {pendingActiveEditor?.name}</h3>
              <button className="modal-close" onClick={() => setAssignModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body">
                <p className="text-secondary" style={{ marginBottom: 16 }}>
                  Before an editor becomes Active, they must be assigned a lead to work on.
                </p>
                <div className="input-group">
                  <label className="input-label">Select Unassigned Lead <span className="input-required">*</span></label>
                  <select
                    className="select"
                    value={assignLeadId}
                    onChange={(e) => setAssignLeadId(e.target.value)}
                    required
                  >
                    <option value="">Choose a lead...</option>
                    {unassignedLeads.map((l) => (
                      <option key={l._id} value={l._id}>{l.name} {l.company ? `(${l.company})` : ''}</option>
                    ))}
                  </select>
                  {unassignedLeads.length === 0 && (
                    <span className="text-secondary text-xs">No unassigned leads available! Please create a lead first.</span>
                  )}
                </div>
                <div className="input-group">
                  <label className="input-label">Deadline</label>
                  <input
                    className="input"
                    type="date"
                    value={assignDeadline}
                    onChange={(e) => setAssignDeadline(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setAssignModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!assignLeadId}>Assign & Activate</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewLeadModalOpen && (
        <LeadModal
          isOpen={viewLeadModalOpen}
          lead={viewLeadData}
          onSave={() => {}} // Read-only from this view, or we can allow edits? We can allow edits!
          onClose={() => {
            setViewLeadModalOpen(false);
            setViewLeadData(null);
          }}
        />
      )}
    </>
  );
}
