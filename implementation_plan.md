# Binary Admin — Editor Pipeline Dashboard (v2)

A minimalist, dark-themed admin dashboard for managing the editor hiring pipeline, lead assignments, and outreach tracking at Binary Growth. Deployed as a standalone Next.js micro-frontend on Vercel, proxied under `binarygrowth.org/editors`.

---

## Architecture Overview

```mermaid
graph TB
    subgraph "Vercel Deployment"
        A["binarygrowth.org/editors"] -->|Rewrite| B["binary-admin.vercel.app/editors"]
        B --> C["Password Gate"]
        C --> D["Dashboard"]
    end

    subgraph "Dashboard Views"
        D --> E["Editor Pipeline — Kanban"]
        D --> F["Lead Pool — Client & File Management"]
        D --> G["Assignment Tracker — Outreach Lifecycle"]
        D --> H["Settings — Email Templates"]
    end

    subgraph "Backend"
        B --> I["Next.js API Routes"]
        I --> J["MongoDB Atlas"]
    end
```

---

## Editor Pipeline Stages (Kanban)

Updated with **Contract Signed** stage:

```
Qualified → Call Scheduled → Denied
                           → Onboarded → Contract Signed → Active → Completed
```

| Stage | Description | Key Actions |
|-------|-------------|-------------|
| **Qualified** | Editor passes initial screening | Send Meet invite (email template), Edit, Delete |
| **Call Scheduled** | Meet link sent, awaiting call | Mark Accepted / Denied |
| **Denied** | Rejected after call | Delete, or move back to Qualified |
| **Onboarded** | Accepted, joined Discord | Send Discord link, prepare contract |
| **Contract Signed** | Commission agreement finalized | Assign first lead |
| **Active** | Working on assigned trailer | View assignment, update trailer progress |
| **Completed** | Delivered trailer(s), tracking outreach | View history, reassign new lead |

---

## Lead Management

Leads (potential clients) are managed separately from editors. Each lead has reference files (Google Drive links, asset URLs, etc.) that editors will use to create trailers.

**Lead Statuses:**
| Status | Meaning |
|--------|---------|
| **Unassigned** | In the pool, waiting for an available editor |
| **Assigned** | Assigned to an editor, trailer in progress |
| **Trailer Delivered** | Editor finished the trailer |
| **Warm Approached** | Outreach sent using the trailer |
| **Replied** | Lead replied to outreach |
| **On Call** | Lead is on a closing call |
| **Closed** | Deal closed → editor earns 5% commission |
| **Declined** | Lead declined after outreach |

---

## Assignment Tracking (Editor ↔ Lead)

Each assignment links one editor to one lead and tracks the full outreach lifecycle:

```mermaid
graph LR
    A["Assigned"] --> B["Trailer In Progress"]
    B --> C["Trailer Delivered"]
    C --> D["Warm Approached"]
    D --> E["Replied"]
    D --> H["No Reply"]
    E --> F["On Call"]
    F --> G["Closed ✓"]
    F --> I["Declined ✗"]
```

The **Assignment Tracker** view shows all active and historical assignments with their current outreach status, giving you a full picture of what's happening across all editors and leads.

---

## Data Models (MongoDB Collections)

### `editors` Collection

```typescript
interface Editor {
  _id: ObjectId;
  name: string;
  email: string;
  phone?: string;
  discordUsername?: string;
  stage: 'qualified' | 'call_scheduled' | 'denied' | 'onboarded' | 'contract_signed' | 'active' | 'completed';
  meetLink?: string;
  commissionRate: number;        // Default 5%
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### `leads` Collection

```typescript
interface Lead {
  _id: ObjectId;
  name: string;                  // Client/brand name
  email?: string;
  company?: string;
  files: FileReference[];        // Trailer source material
  status: 'unassigned' | 'assigned' | 'trailer_delivered' | 'warm_approached' | 'replied' | 'on_call' | 'closed' | 'declined';
  ticketSize?: number;           // Deal value
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FileReference {
  name: string;                  // e.g. "Brand Guidelines PDF"
  url: string;                   // Google Drive link, Dropbox, etc.
  type?: string;                 // 'video' | 'document' | 'image' | 'other'
}
```

### `assignments` Collection

```typescript
interface Assignment {
  _id: ObjectId;
  editorId: ObjectId;            // Ref → editors
  leadId: ObjectId;              // Ref → leads
  status: 'in_progress' | 'trailer_delivered' | 'warm_approached' | 'replied' | 'on_call' | 'closed' | 'declined' | 'no_reply';
  trailerDeliveredAt?: Date;
  warmApproachedAt?: Date;
  repliedAt?: Date;
  closedAt?: Date;
  commissionEarned?: number;     // Auto-calc: ticketSize × commissionRate
  notes?: string;
  assignedAt: Date;
  updatedAt: Date;
}
```

### `settings` Collection

```typescript
interface Settings {
  _id: ObjectId;
  key: string;                   // e.g. 'email_template_meet_invite'
  value: any;                    // Template content with variables
}

// Email template stored as:
interface EmailTemplate {
  name: string;                  // "Meet Invite", "Onboarding Welcome", etc.
  subject: string;               // "Binary Growth — Editor Call Invitation"
  body: string;                  // Template with {{variables}}
}
```

**Available template variables:**
`{{editor_name}}`, `{{editor_email}}`, `{{meet_link}}`, `{{discord_link}}`, `{{date}}`, `{{time}}`, `{{lead_name}}`, `{{company}}`

---

## Proposed Changes

### Project Setup

#### [NEW] `package.json`
- **Dependencies**: `next`, `react`, `react-dom`, `mongoose`, `uuid`, `bcryptjs`
- **Dev dependencies**: `typescript`, `@types/react`, `@types/node`, `@types/bcryptjs`
- Scripts: `dev`, `build`, `start`

#### [NEW] `next.config.ts`
- `basePath: '/editors'` for micro-frontend routing

#### [NEW] `.env.local`
```
MONGODB_URI=mongodb+srv://yogesh-binary:hr16p1076@cluster44.wcunv9a.mongodb.net/binary_admin
ADMIN_PASSWORD_HASH=<bcrypt hash of chosen password>
NEXT_PUBLIC_DISCORD_INVITE=https://discord.gg/your-invite
```

> [!IMPORTANT]
> The MongoDB connection string will be stored securely in `.env.local` (gitignored) and as a Vercel environment variable for production. Never committed to Git.

---

### Design System

#### [NEW] `src/app/globals.css`

Minimalist dark theme matching binarygrowth.org:

| Token | Value | Usage |
|-------|-------|-------|
| `--bg` | `#000000` | Page background |
| `--surface` | `#0a0a0a` | Card/panel backgrounds |
| `--surface-elevated` | `#111111` | Modals, dropdowns |
| `--border` | `rgba(255,255,255,0.08)` | Subtle borders |
| `--border-strong` | `rgba(255,255,255,0.15)` | Active/hover borders |
| `--text-primary` | `#e5e5e0` | Main text |
| `--text-secondary` | `rgba(255,255,255,0.5)` | Muted text |
| `--accent` | `#c9a84c` | Gold — buttons, highlights |
| `--accent-hover` | `#d4b46e` | Gold hover |
| `--danger` | `#ef4444` | Delete, denied |
| `--success` | `#22c55e` | Closed, active |
| `--warning` | `#f59e0b` | In progress, pending |
| `--info` | `#3b82f6` | Informational |

- DM Sans from Google Fonts
- Glassmorphic cards: `backdrop-filter: blur(12px)`, subtle borders
- Smooth `0.2s ease` transitions
- No excessive animations — clean and functional

---

### Database Layer

#### [NEW] `src/lib/mongodb.ts`
- Mongoose connection singleton (cached across hot reloads)
- Connects to MongoDB Atlas using `MONGODB_URI`

#### [NEW] `src/lib/models/Editor.ts`
- Mongoose schema & model for the `editors` collection

#### [NEW] `src/lib/models/Lead.ts`
- Mongoose schema & model for the `leads` collection
- Embedded `files` array (FileReference sub-schema)

#### [NEW] `src/lib/models/Assignment.ts`
- Mongoose schema & model for the `assignments` collection
- References `editorId` and `leadId`

#### [NEW] `src/lib/models/Settings.ts`
- Mongoose schema & model for email templates and app settings

---

### API Routes

All API routes are Next.js Route Handlers under `src/app/api/`:

#### [NEW] `src/app/api/auth/route.ts`
- `POST /api/auth` — validate password, return session token (httpOnly cookie)
- Password compared against bcrypt hash in env

#### [NEW] `src/app/api/editors/route.ts`
- `GET` — list all editors (with optional stage filter)
- `POST` — create new editor

#### [NEW] `src/app/api/editors/[id]/route.ts`
- `GET` — get single editor with assignment history
- `PUT` — update editor (including stage changes)
- `DELETE` — delete editor

#### [NEW] `src/app/api/leads/route.ts`
- `GET` — list all leads (with optional status filter)
- `POST` — create new lead with file references

#### [NEW] `src/app/api/leads/[id]/route.ts`
- `GET` — get single lead with assignment history
- `PUT` — update lead (status, files, details)
- `DELETE` — delete lead

#### [NEW] `src/app/api/assignments/route.ts`
- `GET` — list all assignments (filter by editor, lead, status)
- `POST` — create assignment (link editor ↔ lead)

#### [NEW] `src/app/api/assignments/[id]/route.ts`
- `PUT` — update assignment status (progress through outreach pipeline)
- `DELETE` — cancel assignment

#### [NEW] `src/app/api/settings/route.ts`
- `GET` — get all settings (email templates)
- `PUT` — update settings (save edited templates)

---

### App Layout & Pages

#### [NEW] `src/app/layout.tsx`
- Root layout: DM Sans font, dark theme, metadata

#### [NEW] `src/app/page.tsx`
- Entry point: renders `LoginGate` → `Dashboard`
- Auth check on mount (verify cookie with API)

---

### Components

#### [NEW] `src/components/LoginGate.tsx`
- Centered password input + gold submit button
- Binary Growth branding
- Calls `POST /api/auth` to authenticate

#### [NEW] `src/components/Dashboard.tsx`
- **Tab navigation** across 4 views:
  1. **Pipeline** — Editor Kanban board
  2. **Leads** — Lead pool management
  3. **Assignments** — Active & historical assignments
  4. **Settings** — Email templates
- **Header**: Logo, active tab, quick stats, logout
- Responsive sidebar on larger screens, tab bar on smaller

#### [NEW] `src/components/pipeline/PipelineBoard.tsx`
- Horizontal Kanban with 7 columns (one per stage)
- Drag-and-drop between columns (HTML5 Drag API)
- Column headers with count badges
- Stage-colored accent indicators

#### [NEW] `src/components/pipeline/EditorCard.tsx`
- Compact card: name, email, time in stage
- Contextual action buttons per stage
- Current assignment preview (if active)
- Click to open detail modal

#### [NEW] `src/components/pipeline/EditorModal.tsx`
- Add/Edit editor form
- Fields adapt based on current stage
- Assignment history timeline
- Commission summary

#### [NEW] `src/components/leads/LeadPool.tsx`
- Grid/list view of all leads
- Filter by status (unassigned, assigned, closed, etc.)
- Search by name/company
- Quick-assign button (opens editor picker)

#### [NEW] `src/components/leads/LeadCard.tsx`
- Card showing: name, company, status, file count
- File links (clickable, open in new tab)
- Assignment status indicator
- Click to open detail modal

#### [NEW] `src/components/leads/LeadModal.tsx`
- Add/Edit lead form
- Dynamic file list: add/remove file references (name + URL + type)
- Assignment history for this lead
- Outreach timeline visualization

#### [NEW] `src/components/assignments/AssignmentTracker.tsx`
- Table/card view of all assignments
- Filter by: editor, lead, status, date range
- Sortable columns
- Status badges with outreach pipeline progress bar
- Quick-action buttons to advance status

#### [NEW] `src/components/assignments/AssignmentModal.tsx`
- Create: pick editor (from contract_signed/active/completed) + pick lead (from unassigned pool)
- View/Edit: update outreach status, add notes, enter ticket size
- Commission auto-calculator when status = closed

#### [NEW] `src/components/assignments/AssignmentTimeline.tsx`
- Visual timeline showing assignment progression:
  `Assigned → In Progress → Delivered → Warm Approached → Replied → Closed/Declined`
- Timestamps at each step
- Used inside both EditorModal and LeadModal for history

#### [NEW] `src/components/settings/EmailTemplateEditor.tsx`
- List of saved email templates
- Rich text area for editing subject + body
- Variable picker sidebar: click `{{editor_name}}` to insert at cursor
- Preview pane: shows rendered template with sample data
- Save to MongoDB via `PUT /api/settings`
- Default templates seeded on first load:
  1. **Meet Invite** — for scheduling calls with qualified editors
  2. **Onboarding Welcome** — for accepted editors joining Discord
  3. **Assignment Brief** — for briefing editors on their lead

#### [NEW] `src/components/shared/StatsBar.tsx`
- Quick-glance stats: Total Editors, Active, Leads in Pool, Assignments in Progress, Total Commission
- Displayed in the dashboard header

#### [NEW] `src/components/shared/ConfirmDialog.tsx`
- Destructive action confirmation modal

#### [NEW] `src/components/shared/Toast.tsx`
- Minimal notification toast (bottom-right, auto-dismiss)

#### [NEW] `src/components/shared/StatusBadge.tsx`
- Reusable colored badge for statuses across all views

---

### Utilities

#### [NEW] `src/lib/email.ts`
- `renderTemplate(template, variables)` — replaces `{{var}}` placeholders with actual values
- `openMailto(to, subject, body)` — opens mailto: with rendered content
- `getTemplateVariables(editor?, lead?)` — builds variable map from editor/lead data

#### [NEW] `src/lib/constants.ts`
- Pipeline stage definitions with labels, colors, allowed transitions
- Lead status definitions
- Assignment status definitions
- Default email templates
- Default commission rate (5%)

#### [NEW] `src/lib/auth.ts`
- Server-side auth helpers
- `verifyPassword(input, hash)` — bcrypt compare
- `createSession()` / `verifySession()` — cookie-based session management

---

### Vercel Deployment

#### [MODIFY] `binary_growth/vercel.json`
Add rewrite rules:
```json
{ "source": "/editors", "destination": "https://binary-admin.vercel.app/editors" },
{ "source": "/editors/:match*", "destination": "https://binary-admin.vercel.app/editors/:match*" }
```

#### [NEW] `binary_admin/vercel.json`
Minimal config — the `basePath` in `next.config.ts` handles routing.

---

## File Structure Summary

```
binary_admin/
├── .env.local
├── .gitignore
├── next.config.ts
├── package.json
├── tsconfig.json
├── vercel.json
├── public/
│   └── white_logo.png              # Binary Growth logo (copied from main site)
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── globals.css
    │   └── api/
    │       ├── auth/route.ts
    │       ├── editors/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       ├── leads/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       ├── assignments/
    │       │   ├── route.ts
    │       │   └── [id]/route.ts
    │       └── settings/route.ts
    ├── components/
    │   ├── LoginGate.tsx
    │   ├── Dashboard.tsx
    │   ├── pipeline/
    │   │   ├── PipelineBoard.tsx
    │   │   ├── EditorCard.tsx
    │   │   └── EditorModal.tsx
    │   ├── leads/
    │   │   ├── LeadPool.tsx
    │   │   ├── LeadCard.tsx
    │   │   └── LeadModal.tsx
    │   ├── assignments/
    │   │   ├── AssignmentTracker.tsx
    │   │   ├── AssignmentModal.tsx
    │   │   └── AssignmentTimeline.tsx
    │   ├── settings/
    │   │   └── EmailTemplateEditor.tsx
    │   └── shared/
    │       ├── StatsBar.tsx
    │       ├── ConfirmDialog.tsx
    │       ├── Toast.tsx
    │       └── StatusBadge.tsx
    └── lib/
        ├── mongodb.ts
        ├── auth.ts
        ├── email.ts
        ├── constants.ts
        └── models/
            ├── Editor.ts
            ├── Lead.ts
            ├── Assignment.ts
            └── Settings.ts
```

---

## Verification Plan

### Automated Tests
- `npm run build` — clean production build, no TypeScript errors
- `npm run dev` — local dev server at `localhost:3000/editors`

### Manual Verification
1. **Auth**: Wrong password rejected, correct password grants access, session persists on refresh
2. **Editor Pipeline**: Add → drag through stages → all transitions work correctly
3. **Lead Management**: Add lead with files → files clickable → assign to editor
4. **Assignment Flow**: Create assignment → advance through outreach statuses → commission calculates on close
5. **Email Templates**: Edit template → insert variables → preview renders correctly → mailto opens with filled content
6. **History**: Completed assignments show in editor's history and lead's history
7. **Data Integrity**: MongoDB data persists across sessions, devices, and deployments
8. **Responsive**: Functional on desktop (primary), usable on tablet
