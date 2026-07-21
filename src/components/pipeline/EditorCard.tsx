'use client';

import type { IEditor } from '@/lib/types';
import { STAGE_MAP, STAGE_TRANSITIONS } from '@/lib/constants';

interface EditorCardProps {
  editor: IEditor;
  onDragStart: () => void;
  onDragEnd: () => void;
  onClick: () => void;
  onDelete: () => void;
  onStageChange: (stage: string) => void;
}

export default function EditorCard({
  editor,
  onDragStart,
  onDragEnd,
  onClick,
  onDelete,
  onStageChange,
}: EditorCardProps) {
  const stageConfig = STAGE_MAP[editor.stage];
  const allowedTransitions = STAGE_TRANSITIONS[editor.stage] || [];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const handleAction = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    if (action === 'delete') {
      onDelete();
    } else {
      onStageChange(action);
    }
  };

  // Stage-specific quick actions
  const renderActions = () => {
    const actions: { label: string; action: string; className: string }[] = [];

    switch (editor.stage) {
      case 'qualified':
        actions.push({ label: '📅 Schedule Call', action: 'call_scheduled', className: 'btn btn-xs' });
        break;
      case 'call_scheduled':
        actions.push({ label: '✓ Accept', action: 'onboarded', className: 'btn btn-xs btn-success' });
        actions.push({ label: '✗ Deny', action: 'denied', className: 'btn btn-xs btn-danger' });
        break;
      case 'denied':
        actions.push({ label: '↩ Re-qualify', action: 'qualified', className: 'btn btn-xs' });
        break;
      case 'onboarded':
        actions.push({ label: '📝 Contract', action: 'contract_signed', className: 'btn btn-xs' });
        break;
      case 'contract_signed':
        actions.push({ label: '▶ Activate', action: 'active', className: 'btn btn-xs btn-success' });
        break;
      case 'active':
        actions.push({ label: '✓ Complete', action: 'completed', className: 'btn btn-xs' });
        break;
      case 'completed':
        actions.push({ label: '▶ Reactivate', action: 'active', className: 'btn btn-xs' });
        break;
    }

    return actions;
  };

  const quickActions = renderActions();

  return (
    <div
      className="editor-card"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      onClick={onClick}
    >
      <div className="editor-card-name">{editor.name}</div>
      <div className="editor-card-email">{editor.email}</div>

      <div className="editor-card-meta">
        <span className={`badge ${stageConfig?.badgeClass || 'badge-neutral'}`}>
          {stageConfig?.label || editor.stage}
        </span>
        <span className="badge badge-neutral">{timeAgo(editor.updatedAt)}</span>
        {editor.commissionRate !== 5 && (
          <span className="badge badge-accent">{editor.commissionRate}%</span>
        )}
      </div>

      {quickActions.length > 0 && (
        <div className="editor-card-actions">
          {quickActions.map((qa) => (
            <button
              key={qa.action}
              className={qa.className}
              onClick={(e) => handleAction(e, qa.action)}
            >
              {qa.label}
            </button>
          ))}
          <button
            className="btn btn-xs btn-danger"
            onClick={(e) => handleAction(e, 'delete')}
            style={{ marginLeft: 'auto' }}
          >
            🗑
          </button>
        </div>
      )}
    </div>
  );
}
