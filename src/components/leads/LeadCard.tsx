'use client';

import type { ILead } from '@/lib/types';
import { FILE_TYPE_ICONS } from '@/lib/constants';
import StatusBadge from '../shared/StatusBadge';

interface LeadCardProps {
  lead: ILead;
  onClick: () => void;
}

export default function LeadCard({ lead, onClick }: LeadCardProps) {
  return (
    <div className="lead-card" onClick={onClick}>
      <div className="lead-card-header">
        <span className="lead-card-name">{lead.name}</span>
        <StatusBadge status={lead.status} type="lead" />
      </div>

      {lead.company && <div className="lead-card-company">{lead.company}</div>}

      {lead.files && lead.files.length > 0 && (
        <div className="lead-card-files">
          {lead.files.map((f, i) => (
            <a
              key={i}
              className="file-chip"
              href={f.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
            >
              {FILE_TYPE_ICONS[f.type || 'other']} {f.name}
            </a>
          ))}
        </div>
      )}

      <div className="editor-card-meta">
        {lead.ticketSize != null && lead.ticketSize > 0 && (
          <span className="badge badge-accent">₹{lead.ticketSize.toLocaleString('en-IN')}</span>
        )}
        {lead.notes && (
          <span className="badge badge-neutral" title={lead.notes}>📝 Notes</span>
        )}
      </div>
    </div>
  );
}
