'use client';

import { useState } from 'react';
import type { ILead } from '@/lib/types';
import { LEAD_STATUSES, LEAD_STATUS_MAP } from '@/lib/constants';
import LeadCard from './LeadCard';
import LeadModal from './LeadModal';

interface LeadBoardProps {
  leads: ILead[];
  onSave: (data: Partial<ILead>, id?: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, newStatus: string) => void;
  onRefresh: () => void;
}

export default function LeadBoard({ leads, onSave, onDelete, onStatusChange, onRefresh }: LeadBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [draggingLead, setDraggingLead] = useState<ILead | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<ILead | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLeads = leads.filter((lead) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(q) ||
        (lead.company && lead.company.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getLeadsByStatus = (statusId: string) =>
    filteredLeads.filter((l) => l.status === statusId);

  const handleDragStart = (lead: ILead) => {
    setDraggingLead(lead);
  };

  const handleDragOver = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    if (draggingLead && draggingLead.status !== statusId) {
      setDragOverColumn(statusId);
    }
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, statusId: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    if (draggingLead && draggingLead.status !== statusId) {
      onStatusChange(draggingLead._id, statusId);
    }
    setDraggingLead(null);
  };

  const handleDragEnd = () => {
    setDraggingLead(null);
    setDragOverColumn(null);
  };

  const handleAdd = () => {
    setEditingLead(null);
    setModalOpen(true);
  };

  const handleEdit = (lead: ILead) => {
    setEditingLead(lead);
    setModalOpen(true);
  };

  const handleSave = (data: Partial<ILead>) => {
    onSave(data, editingLead?._id);
    setModalOpen(false);
    setEditingLead(null);
  };

  return (
    <>
      <div className="lead-pool-header" style={{ marginBottom: 16 }}>
        <h3>Leads <span className="text-secondary text-sm">({leads.length})</span></h3>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              placeholder="Search leads..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              id="lead-search"
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleAdd} id="add-lead-btn">
            + Add Lead
          </button>
        </div>
      </div>

      <div className="kanban-board">
        {LEAD_STATUSES.map((status) => {
          const columnLeads = getLeadsByStatus(status.id);
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
                <span className="column-count">{columnLeads.length}</span>
              </div>

              <div className="column-cards">
                {columnLeads.length === 0 ? (
                  <div className="column-empty">No leads</div>
                ) : (
                  columnLeads.map((lead) => (
                    <div
                      key={lead._id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move';
                        handleDragStart(lead);
                      }}
                      onDragEnd={handleDragEnd}
                      style={{ cursor: 'grab' }}
                    >
                      <LeadCard 
                        lead={lead} 
                        onClick={() => handleEdit(lead)} 
                      />
                    </div>
                  ))
                )}

                {status.id === 'unassigned' && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={handleAdd}
                    style={{ width: '100%', marginTop: 4 }}
                  >
                    + Add Lead
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <LeadModal
          isOpen={modalOpen}
          lead={editingLead}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditingLead(null);
          }}
        />
      )}
    </>
  );
}
