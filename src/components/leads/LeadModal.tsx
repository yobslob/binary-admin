'use client';

import { useState, useEffect } from 'react';
import type { ILead, FileReference } from '@/lib/types';
import { LEAD_STATUSES } from '@/lib/constants';

interface LeadModalProps {
  isOpen: boolean;
  lead?: ILead | null;
  onSave: (data: Partial<ILead>) => void;
  onClose: () => void;
}

export default function LeadModal({ isOpen, lead, onSave, onClose }: LeadModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    company: '',
    ticketSize: 0,
    status: 'unassigned' as ILead['status'],
    notes: '',
  });
  const [files, setFiles] = useState<FileReference[]>([]);

  useEffect(() => {
    if (lead) {
      setForm({
        name: lead.name || '',
        email: lead.email || '',
        company: lead.company || '',
        ticketSize: lead.ticketSize || 0,
        status: lead.status,
        notes: lead.notes || '',
      });
      setFiles(lead.files || []);
    } else {
      setForm({ name: '', email: '', company: '', ticketSize: 0, status: 'unassigned', notes: '' });
      setFiles([]);
    }
  }, [lead]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, files });
  };

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addFile = () => {
    setFiles((prev) => [...prev, { name: '', url: '', type: 'other' }]);
  };

  const updateFile = (index: number, field: keyof FileReference, value: string) => {
    setFiles((prev) => prev.map((f, i) => (i === index ? { ...f, [field]: value } : f)));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;
  const isEditing = !!lead;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEditing ? 'Edit Lead' : 'Add New Lead'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Name <span className="input-required">*</span></label>
                <input
                  className="input"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Client / brand name"
                  required
                  id="lead-name"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Company</label>
                <input
                  className="input"
                  value={form.company}
                  onChange={(e) => updateField('company', e.target.value)}
                  placeholder="Company name"
                  id="lead-company"
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="client@email.com"
                  id="lead-email"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Ticket Size (₹)</label>
                <input
                  className="input"
                  type="number"
                  min={0}
                  value={form.ticketSize}
                  onChange={(e) => updateField('ticketSize', Number(e.target.value))}
                  placeholder="0"
                  id="lead-ticket"
                />
              </div>
            </div>

            {isEditing && (
              <div className="input-group">
                <label className="input-label">Status</label>
                <select
                  className="select"
                  value={form.status}
                  onChange={(e) => updateField('status', e.target.value)}
                  id="lead-status"
                >
                  {LEAD_STATUSES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Files / References</label>
              <div className="file-list">
                {files.map((file, i) => (
                  <div key={i} className="file-row">
                    <input
                      className="input"
                      value={file.name}
                      onChange={(e) => updateFile(i, 'name', e.target.value)}
                      placeholder="File name"
                    />
                    <input
                      className="input"
                      value={file.url}
                      onChange={(e) => updateFile(i, 'url', e.target.value)}
                      placeholder="URL (Drive, Dropbox...)"
                    />
                    <select
                      className="select"
                      value={file.type || 'other'}
                      onChange={(e) => updateFile(i, 'type', e.target.value)}
                      style={{ width: 'auto', minWidth: 90 }}
                    >
                      <option value="video">🎬 Video</option>
                      <option value="document">📄 Doc</option>
                      <option value="image">🖼️ Image</option>
                      <option value="other">📎 Other</option>
                    </select>
                    <button type="button" className="btn btn-xs btn-danger" onClick={() => removeFile(i)}>✗</button>
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-ghost" onClick={addFile}>+ Add File</button>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Notes</label>
              <textarea
                className="textarea"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Any notes about this lead..."
                rows={3}
                id="lead-notes"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={!form.name.trim()} id="lead-save">
              {isEditing ? 'Save Changes' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
