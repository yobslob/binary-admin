'use client';

import { useState, useEffect } from 'react';
import type { IEditor } from '@/lib/types';
import { PIPELINE_STAGES, DEFAULT_COMMISSION_RATE } from '@/lib/constants';

interface EditorModalProps {
  isOpen: boolean;
  editor?: IEditor | null;
  onSave: (data: Partial<IEditor>) => void;
  onClose: () => void;
}

export default function EditorModal({ isOpen, editor, onSave, onClose }: EditorModalProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    discordUsername: '',
    stage: 'qualified' as IEditor['stage'],
    meetLink: '',
    commissionRate: DEFAULT_COMMISSION_RATE,
    notes: '',
  });

  useEffect(() => {
    if (editor) {
      setForm({
        name: editor.name || '',
        email: editor.email || '',
        phone: editor.phone || '',
        discordUsername: editor.discordUsername || '',
        stage: editor.stage,
        meetLink: editor.meetLink || '',
        commissionRate: editor.commissionRate ?? DEFAULT_COMMISSION_RATE,
        notes: editor.notes || '',
      });
    } else {
      setForm({
        name: '',
        email: '',
        phone: '',
        discordUsername: '',
        stage: 'qualified',
        meetLink: '',
        commissionRate: DEFAULT_COMMISSION_RATE,
        notes: '',
      });
    }
  }, [editor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    onSave(form);
  };

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const isEditing = !!editor;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEditing ? 'Edit Editor' : 'Add New Editor'}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="input-row">
              <div className="input-group">
                <label className="input-label">
                  Name <span className="input-required">*</span>
                </label>
                <input
                  className="input"
                  type="text"
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Editor name"
                  required
                  id="editor-name"
                />
              </div>
              <div className="input-group">
                <label className="input-label">
                  Email <span className="input-required">*</span>
                </label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="editor@email.com"
                  required
                  id="editor-email"
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label className="input-label">Phone</label>
                <input
                  className="input"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  placeholder="+91 ..."
                  id="editor-phone"
                />
              </div>
              <div className="input-group">
                <label className="input-label">Discord Username</label>
                <input
                  className="input"
                  type="text"
                  value={form.discordUsername}
                  onChange={(e) => updateField('discordUsername', e.target.value)}
                  placeholder="username#1234"
                  id="editor-discord"
                />
              </div>
            </div>

            {isEditing && (
              <div className="input-row">
                <div className="input-group">
                  <label className="input-label">Stage</label>
                  <select
                    className="select"
                    value={form.stage}
                    onChange={(e) => updateField('stage', e.target.value)}
                    id="editor-stage"
                  >
                    {PIPELINE_STAGES.map((s) => (
                      <option key={s.id} value={s.id}>{s.label}</option>
                    ))}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Commission Rate (%)</label>
                  <input
                    className="input"
                    type="number"
                    min={0}
                    max={100}
                    value={form.commissionRate}
                    onChange={(e) => updateField('commissionRate', Number(e.target.value))}
                    id="editor-commission"
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Google Meet Link</label>
              <input
                className="input"
                type="url"
                value={form.meetLink}
                onChange={(e) => updateField('meetLink', e.target.value)}
                placeholder="https://meet.google.com/..."
                id="editor-meet-link"
              />
            </div>

            <div className="input-group">
              <label className="input-label">Notes</label>
              <textarea
                className="textarea"
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                placeholder="Any notes about this editor..."
                rows={3}
                id="editor-notes"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!form.name.trim() || !form.email.trim()}
              id="editor-save"
            >
              {isEditing ? 'Save Changes' : 'Add Editor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
