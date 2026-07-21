'use client';

import { useState, useEffect, useCallback } from 'react';
import type { IEditor, ILead, IAssignment, IEmailTemplate } from '@/lib/types';
import { useToast } from './shared/Toast';
import StatsBar from './shared/StatsBar';
import ConfirmDialog from './shared/ConfirmDialog';
import PipelineBoard from './pipeline/PipelineBoard';
import LeadPool from './leads/LeadPool';
import AssignmentTracker from './assignments/AssignmentTracker';
import EmailTemplateEditor from './settings/EmailTemplateEditor';

type TabId = 'pipeline' | 'leads' | 'assignments' | 'settings';

interface DashboardProps {
  onLogout: () => void;
}

export default function Dashboard({ onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>('pipeline');
  const [editors, setEditors] = useState<IEditor[]>([]);
  const [leads, setLeads] = useState<ILead[]>([]);
  const [assignments, setAssignments] = useState<IAssignment[]>([]);
  const [templates, setTemplates] = useState<IEmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    danger?: boolean;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  const { showToast } = useToast();

  // ─── Data Fetching (single request) ───────────────────────

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch('/editors/api/dashboard');
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(data.error || `Server error (${res.status})`);
      }
      const data = await res.json();
      setEditors(data.editors || []);
      setLeads(data.leads || []);
      setAssignments(data.assignments || []);
      setTemplates(data.settings?.value || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard data';
      setLoadError(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ─── Editor Operations ────────────────────────────────────

  const saveEditor = async (data: Partial<IEditor>, id?: string) => {
    try {
      const url = id ? `/editors/api/editors/${id}` : '/editors/api/editors';
      const method = id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast(id ? 'Editor updated' : 'Editor added', 'success');
        fetchAll();
      } else {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        showToast(err.error || 'Failed to save editor', 'error');
      }
    } catch { showToast('Network error — check your connection', 'error'); }
  };

  const deleteEditor = (id: string) => {
    const editor = editors.find((e) => e._id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Editor',
      message: `Are you sure you want to delete "${editor?.name || 'this editor'}"? This cannot be undone.`,
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/editors/api/editors/${id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Editor deleted', 'success');
            fetchAll();
          } else {
            showToast('Failed to delete editor', 'error');
          }
        } catch { showToast('Network error', 'error'); }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const changeEditorStage = async (id: string, newStage: string) => {
    try {
      const res = await fetch(`/editors/api/editors/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      if (res.ok) {
        showToast('Stage updated', 'success');
        fetchAll();
      } else {
        showToast('Failed to update stage', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  // ─── Lead Operations ──────────────────────────────────────

  const saveLead = async (data: Partial<ILead>, id?: string) => {
    try {
      const url = id ? `/editors/api/leads/${id}` : '/editors/api/leads';
      const method = id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast(id ? 'Lead updated' : 'Lead added', 'success');
        fetchAll();
      } else {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        showToast(err.error || 'Failed to save lead', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  const deleteLead = (id: string) => {
    const lead = leads.find((l) => l._id === id);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Lead',
      message: `Are you sure you want to delete "${lead?.name || 'this lead'}"?`,
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/editors/api/leads/${id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Lead deleted', 'success');
            fetchAll();
          } else {
            showToast('Failed to delete lead', 'error');
          }
        } catch { showToast('Network error', 'error'); }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // ─── Assignment Operations ────────────────────────────────

  const saveAssignment = async (data: Record<string, unknown>, id?: string) => {
    try {
      const url = id ? `/editors/api/assignments/${id}` : '/editors/api/assignments';
      const method = id ? 'PUT' : 'POST';

      // If updating ticket size, update the lead first
      if (id && data.ticketSize) {
        const assignment = assignments.find((a) => a._id === id);
        if (assignment?.lead?._id) {
          await fetch(`/editors/api/leads/${assignment.lead._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticketSize: data.ticketSize }),
          });
        }
        delete data.ticketSize;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        showToast(id ? 'Assignment updated' : 'Assignment created', 'success');
        fetchAll();
      } else {
        const err = await res.json().catch(() => ({ error: 'Request failed' }));
        showToast(err.error || 'Failed to save assignment', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  const deleteAssignment = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Assignment',
      message: 'Are you sure you want to remove this assignment? The lead will be set back to unassigned.',
      danger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/editors/api/assignments/${id}`, { method: 'DELETE' });
          if (res.ok) {
            showToast('Assignment deleted', 'success');
            fetchAll();
          } else {
            showToast('Failed to delete assignment', 'error');
          }
        } catch { showToast('Network error', 'error'); }
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // ─── Settings Operations ──────────────────────────────────

  const saveTemplates = async (updated: IEmailTemplate[]) => {
    try {
      const res = await fetch('/editors/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: updated }),
      });
      if (res.ok) {
        showToast('Templates saved', 'success');
        setTemplates(updated);
      } else {
        showToast('Failed to save templates', 'error');
      }
    } catch { showToast('Network error', 'error'); }
  };

  // ─── Logout ───────────────────────────────────────────────

  const handleLogout = async () => {
    try {
      await fetch('/editors/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logout' }),
      });
    } catch { /* ignore */ }
    onLogout();
  };

  // ─── Tabs ─────────────────────────────────────────────────

  const tabs: { id: TabId; label: string }[] = [
    { id: 'pipeline', label: 'Pipeline' },
    { id: 'leads', label: 'Leads' },
    { id: 'assignments', label: 'Assignments' },
    { id: 'settings', label: 'Settings' },
  ];

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="loading-screen">
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: '2rem', marginBottom: 16, opacity: 0.4 }}>⚠</div>
          <h3 style={{ marginBottom: 8 }}>Connection Failed</h3>
          <p className="text-secondary" style={{ fontSize: '0.85rem', marginBottom: 20, lineHeight: 1.6 }}>
            {loadError}
          </p>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn btn-primary" onClick={fetchAll}>
              Retry
            </button>
            <button className="btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-left">
          <svg className="header-logo" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="7" fill="#c9a84c" fillOpacity="0.15" />
            <path d="M7 8h5c2 0 3.5 1.5 3.5 3.5S14 15 12 15H7V8zm2.5 2.5v2h2.5c.7 0 1.2-.5 1.2-1s-.5-1-1.2-1h-2.5z" fill="#c9a84c" />
            <path d="M15 8h5c2 0 3.5 1.5 3.5 3.5S22 15 20 15h-1.5l2.5 2.5h-3.5L15 15V8zm2.5 2.5v2H20c.7 0 1.2-.5 1.2-1s-.5-1-1.2-1h-2.5z" fill="#c9a84c" fillOpacity="0.5" />
          </svg>
          <span className="header-title">Binary Admin</span>
        </div>
        <div className="header-right">
          <button className="btn btn-ghost btn-sm" onClick={fetchAll} id="refresh-btn">
            ↻ Refresh
          </button>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout} id="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab${activeTab === tab.id ? ' active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            id={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <StatsBar editors={editors} leads={leads} assignments={assignments} />

      <div className="dashboard-content">
        {activeTab === 'pipeline' && (
          <PipelineBoard
            editors={editors}
            onSave={saveEditor}
            onDelete={deleteEditor}
            onStageChange={changeEditorStage}
            onRefresh={fetchAll}
          />
        )}
        {activeTab === 'leads' && (
          <LeadPool
            leads={leads}
            onSave={saveLead}
            onDelete={deleteLead}
            onRefresh={fetchAll}
          />
        )}
        {activeTab === 'assignments' && (
          <AssignmentTracker
            assignments={assignments}
            editors={editors}
            leads={leads}
            onSave={saveAssignment}
            onDelete={deleteAssignment}
            onRefresh={fetchAll}
          />
        )}
        {activeTab === 'settings' && (
          <EmailTemplateEditor
            templates={templates}
            onSave={saveTemplates}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        confirmLabel="Delete"
        danger={confirmDialog.danger}
      />
    </div>
  );
}
