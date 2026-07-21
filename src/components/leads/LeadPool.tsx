'use client';

import { useState } from 'react';
import type { ILead } from '@/lib/types';
import { LEAD_STATUSES } from '@/lib/constants';
import LeadCard from './LeadCard';
import LeadModal from './LeadModal';

interface LeadPoolProps {
  leads: ILead[];
  onSave: (data: Partial<ILead>, id?: string) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export default function LeadPool({ leads, onSave, onDelete, onRefresh }: LeadPoolProps) {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<ILead | null>(null);

  const filtered = leads.filter((lead) => {
    if (statusFilter && lead.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        lead.name.toLowerCase().includes(q) ||
        (lead.company && lead.company.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleCardClick = (lead: ILead) => {
    setEditingLead(lead);
    setModalOpen(true);
  };

  const handleAdd = () => {
    setEditingLead(null);
    setModalOpen(true);
  };

  const handleSave = (data: Partial<ILead>) => {
    onSave(data, editingLead?._id);
    setModalOpen(false);
    setEditingLead(null);
  };

  return (
    <div className="lead-pool">
      <div className="lead-pool-header">
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

      <div className="lead-pool-filters">
        <button
          className={`filter-chip${statusFilter === null ? ' active' : ''}`}
          onClick={() => setStatusFilter(null)}
        >
          All
        </button>
        {LEAD_STATUSES.map((s) => (
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
          <div className="empty-state-icon">📋</div>
          <div className="empty-state-text">No leads found</div>
          <div className="empty-state-subtext">
            {searchQuery || statusFilter ? 'Try adjusting your filters' : 'Add your first lead to get started'}
          </div>
        </div>
      ) : (
        <div className="lead-grid" style={{ marginTop: 16 }}>
          {filtered.map((lead) => (
            <LeadCard key={lead._id} lead={lead} onClick={() => handleCardClick(lead)} />
          ))}
        </div>
      )}

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
    </div>
  );
}
