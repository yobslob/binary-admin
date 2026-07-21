'use client';

import { useState, useRef } from 'react';
import type { IEmailTemplate } from '@/lib/types';
import { TEMPLATE_VARIABLES } from '@/lib/constants';
import { renderTemplate, getTemplateVariables } from '@/lib/email';

interface EmailTemplateEditorProps {
  templates: IEmailTemplate[];
  onSave: (templates: IEmailTemplate[]) => void;
}

export default function EmailTemplateEditor({ templates, onSave }: EmailTemplateEditorProps) {
  const [localTemplates, setLocalTemplates] = useState<IEmailTemplate[]>(templates);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState<Record<number, boolean>>({});
  const bodyRefs = useRef<Record<number, HTMLTextAreaElement | null>>({});

  const sampleVars = getTemplateVariables(
    { name: 'John Doe', email: 'john@example.com', meetLink: 'https://meet.google.com/abc-defg-hij' } as never,
    { name: 'Acme Corp', company: 'Acme Inc.' } as never
  );

  const updateTemplate = (index: number, field: keyof IEmailTemplate, value: string) => {
    setLocalTemplates((prev) =>
      prev.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    );
  };

  const insertVariable = (index: number, variable: string) => {
    const textarea = bodyRefs.current[index];
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = localTemplates[index].body;
    const newBody = current.substring(0, start) + variable + current.substring(end);

    updateTemplate(index, 'body', newBody);

    // Restore cursor position after React re-render
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + variable.length;
    });
  };

  const togglePreview = (index: number) => {
    setShowPreview((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSave = () => {
    onSave(localTemplates);
  };

  return (
    <div className="template-editor">
      <div style={{ marginBottom: 24 }}>
        <h3>Email Templates</h3>
        <p className="text-secondary" style={{ marginTop: 4, fontSize: '0.82rem' }}>
          Manage email templates for editor communication. Use variables below to personalize.
        </p>
      </div>

      <div className="template-list">
        {localTemplates.map((template, index) => (
          <div key={index} className="template-card">
            <div className="template-card-header">
              <span className="template-name">{template.name}</span>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                {expandedIndex === index ? '▲ Collapse' : '▼ Expand'}
              </button>
            </div>

            {expandedIndex === index && (
              <>
                <div className="variable-chips">
                  {TEMPLATE_VARIABLES.map((v) => (
                    <button
                      key={v}
                      className="variable-chip"
                      onClick={() => insertVariable(index, v)}
                      type="button"
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <div className="input-group" style={{ marginBottom: 12 }}>
                  <label className="input-label">Subject</label>
                  <input
                    className="input"
                    value={template.subject}
                    onChange={(e) => updateTemplate(index, 'subject', e.target.value)}
                  />
                </div>

                <div className="input-group" style={{ marginBottom: 12 }}>
                  <label className="input-label">Body</label>
                  <textarea
                    className="textarea"
                    value={template.body}
                    onChange={(e) => updateTemplate(index, 'body', e.target.value)}
                    rows={8}
                    ref={(el) => { bodyRefs.current[index] = el; }}
                  />
                </div>

                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => togglePreview(index)}
                  style={{ marginBottom: 12 }}
                >
                  {showPreview[index] ? '👁 Hide Preview' : '👁 Show Preview'}
                </button>

                {showPreview[index] && (
                  <div className="template-preview">
                    <div style={{ marginBottom: 8, fontWeight: 500, fontSize: '0.85rem' }}>
                      Subject: {renderTemplate(template.subject, sampleVars)}
                    </div>
                    <div className="divider" style={{ marginBottom: 8 }} />
                    {renderTemplate(template.body, sampleVars)}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={handleSave} id="save-templates-btn">
          Save All Templates
        </button>
      </div>
    </div>
  );
}
