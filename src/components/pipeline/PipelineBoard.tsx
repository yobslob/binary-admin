'use client';

import { useState } from 'react';
import type { IEditor } from '@/lib/types';
import { PIPELINE_STAGES, STAGE_TRANSITIONS } from '@/lib/constants';
import EditorCard from './EditorCard';
import EditorModal from './EditorModal';

interface PipelineBoardProps {
  editors: IEditor[];
  onSave: (data: Partial<IEditor>, id?: string) => void;
  onDelete: (id: string) => void;
  onStageChange: (id: string, newStage: string) => void;
  onRefresh: () => void;
}

export default function PipelineBoard({ editors, onSave, onDelete, onStageChange, onRefresh }: PipelineBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [draggingEditor, setDraggingEditor] = useState<IEditor | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEditor, setEditingEditor] = useState<IEditor | null>(null);

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
        onStageChange(draggingEditor._id, stageId);
      }
    }
    setDraggingEditor(null);
  };

  const handleDragEnd = () => {
    setDraggingEditor(null);
    setDragOverColumn(null);
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
                  stageEditors.map((editor) => (
                    <EditorCard
                      key={editor._id}
                      editor={editor}
                      onDragStart={() => handleDragStart(editor)}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleEditEditor(editor)}
                      onDelete={() => onDelete(editor._id)}
                      onStageChange={(stage) => onStageChange(editor._id, stage)}
                    />
                  ))
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
    </>
  );
}
