'use client';

import type { IEditor, ILead, IAssignment } from '@/lib/types';

interface StatsBarProps {
  editors: IEditor[];
  leads: ILead[];
  assignments: IAssignment[];
}

export default function StatsBar({ editors, leads, assignments }: StatsBarProps) {
  const totalEditors = editors.length;
  const activeEditors = editors.filter((e) => e.stage === 'active').length;
  const inPipeline = editors.filter(
    (e) => !['active', 'completed', 'denied'].includes(e.stage)
  ).length;
  const totalLeads = leads.length;
  const unassignedLeads = leads.filter((l) => l.status === 'unassigned').length;
  const activeAssignments = assignments.filter(
    (a) => !['closed', 'declined', 'no_reply'].includes(a.status)
  ).length;
  const totalCommission = assignments.reduce(
    (sum, a) => sum + (a.commissionEarned || 0),
    0
  );

  const stats = [
    { label: 'Editors', value: totalEditors },
    { label: 'Active', value: activeEditors },
    { label: 'In Pipeline', value: inPipeline },
    { label: 'Leads', value: totalLeads },
    { label: 'Unassigned', value: unassignedLeads },
    { label: 'Active Tasks', value: activeAssignments },
    { label: 'Commission', value: `₹${totalCommission.toLocaleString('en-IN')}` },
  ];

  return (
    <div className="stats-bar">
      {stats.map((stat) => (
        <div key={stat.label} className="stat-item">
          <span className="stat-label">{stat.label}</span>
          <span className="stat-value">{stat.value}</span>
        </div>
      ))}
    </div>
  );
}
