# UpWork Terminal - Project Summary

## Overview

**UpWork Terminal** is a comprehensive freelance management web application for managing all aspects of freelance work on UpWork. Built with Next.js 15, TypeScript, and Claude AI, it provides a centralized hub for job research, proposal management, contract tracking, and client relationship management.

## Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router) + React 19 + TypeScript 5.7
- **UI Framework**: Tailwind CSS 4 + shadcn/ui components
- **Database**: PostgreSQL + Prisma ORM 6.2.1
- **Data Validation**: Zod 4.2.1
- **State Management**: TanStack Query v5 + Zustand
- **AI Integration**: Claude 3.5 Sonnet (Anthropic SDK)
- **Icons**: Lucide React

### Project Structure
```
upwork-terminal/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Authentication pages (login/callback)
│   │   ├── (dashboard)/          # Protected dashboard routes
│   │   │   ├── jobs/             # Job research & analysis
│   │   │   ├── proposals/        # Proposal management
│   │   │   ├── contracts/        # Contract tracking
│   │   │   ├── clients/          # Client management
│   │   │   ├── page.tsx          # Main dashboard home
│   │   │   ├── layout.tsx        # Dashboard layout with nav
│   │   │   └── settings/         # Settings page
│   │   └── api/                  # API routes
│   │       ├── jobs/             # Job CRUD operations
│   │       ├── proposals/        # Proposal generation & management
│   │       ├── inbox/            # Email inbox ingestion
│   │       └── sophia/           # Sophia analysis engine
│   │
│   ├── components/               # React components
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── jobs/                 # Job-related components
│   │   │   ├── job-analyze-shell.tsx
│   │   │   ├── job-score-card.tsx
│   │   │   ├── job-scoring-form.tsx
│   │   │   ├── job-memo-editor.tsx
│   │   │   ├── job-tag-editor.tsx
│   │   │   ├── job-decision-buttons.tsx
│   │   │   └── job-sophia-button.tsx
│   │   ├── proposals/            # Proposal components
│   │   │   ├── proposal-form.tsx
│   │   │   └── proposal-display.tsx
│   │   ├── sophia/               # Sophia display
│   │   │   └── sophia-report-display.tsx
│   │   └── layout/               # Layout components
│   │       └── main-nav.tsx
│   │
│   ├── lib/                      # Utilities & business logic
│   │   ├── schemas/              # Zod validation schemas
│   │   │   ├── job-analysis.ts
│   │   │   ├── proposal.ts
│   │   │   └── inbox.ts
│   │   ├── job/                  # Job-related logic
│   │   │   └── scoring.ts
│   │   ├── proposal/             # Proposal generation
│   │   │   └── generator.ts
│   │   ├── sophia/               # Sophia analysis engine
│   │   │   ├── engine.ts
│   │   │   └── schemas.ts
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── utils.ts              # Utility functions
│   │
│   └── types/                    # TypeScript definitions
│       └── index.ts
│
├── prisma/                       # Database schema & migrations
│   └── schema.prisma
│
├── package.json
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── components.json               # shadcn/ui config
└── PROJECT_SUMMARY.md           # This file
```

## Feature Implementation

### Phase 1: Foundation (Completed ✓)
- [x] Next.js 15 setup with App Router
- [x] Tailwind CSS + shadcn/ui integration
- [x] PostgreSQL + Prisma ORM
- [x] NextAuth.js (UpWork OAuth ready)

### Phase 2-3: Core Features (Completed ✓)
- [x] Inbox email ingestion with Claude parsing
- [x] Job research & filtering
- [x] Job saving/tagging/memo system
- [x] Sophia analysis engine with Claude 3.5 Sonnet
- [x] Multi-phase analysis (Q_META, F_ULTIMATE, Artifacts)

### Phase 4: Job Analysis (Completed ✓)
**Scoring System**:
- 5-dimension scoring (0-20 each):
  - 適合度 (Fit)
  - 要件の明確さ (Clarity)
  - 予算対効果 (Budget ROI)
  - クライアント品質 (Client Quality)
  - 受注可能性 (Win Chance)
- Automatic classification: Excellent/Good/Fair/Poor

**Job Analysis Components**:
- JobScoreCard: Visual score display with progress bars
- JobScoringForm: Interactive score input with sliders
- JobMemoEditor: Free-form note taking
- JobTagEditor: Tag management with suggestions
- JobDecisionButtons: propose/hold/drop decisions
- SophiaReportDisplay: Sophia analysis visualization

**APIs**:
- `GET /api/jobs/:id` - Fetch job with proposals
- `PATCH /api/jobs/:id` - Update analysis/scores/notes/tags
- `GET /api/jobs/:id/sophia-reports` - Fetch Sophia analyses

### Phase 5: Proposal Templates (Completed ✓)
**Two Template Types**:
- **Type A: Short Deliverable**
  - Quick-turnaround projects
  - Direct approach description
  - 3-5 days typical timeline

- **Type B: Audit → Build**
  - Complex 2-phase projects
  - Discovery/audit phase first
  - Implementation phase second
  - More detailed & professional

**Claude Integration**:
- Bilingual proposal generation (Japanese → English)
- Professional formatting
- Template-aware content
- ProposalGenerator module
- `POST /api/proposals/generate` - Claude-powered generation

**Components**:
- ProposalForm: Template selection + input fields
- ProposalDisplay: Generated proposal with tabs
- Proposals list page with statistics

**APIs**:
- `POST /api/proposals/generate` - Generate with Claude
- `POST /api/proposals` - Create draft proposal
- `GET /api/proposals` - List user proposals

### Phase 6: Navigation & Dashboard (Completed ✓)
**Main Navigation**:
- MainNav sidebar component with logo
- 6 main sections: Dashboard, Jobs, Proposals, Contracts, Clients, Settings
- Mobile-responsive menu
- Active route highlighting

**Dashboard Home**:
- Key metrics cards (total jobs, proposals, saved jobs, contracts)
- Quick action cards linking to each module
- Recent jobs activity
- Recent proposals activity
- Dynamic data loading

**Settings Page**:
- Auto-sync configuration
- Profile settings
- Notification preferences
- App version info

## Database Schema

### Core Models
- **User**: Authentication & profile
- **Job**: UpWork jobs with analysis data
- **Proposal**: Drafted & submitted proposals
- **SophiaReport**: Analysis results from Claude
- **InboxMessage**: Email parsing & tracking
- **InboxExtract**: Extracted URLs/content

### Key Fields
- `Job.analysisJson`: Stores scoring & decision data
- `Proposal.coverLetter`: Full proposal text (stored for reference)
- `SophiaReport.qMetaJson/fUltimateJson/artifactsJson`: Full analysis output

## Single-User Mode
The application uses `SINGLE_USER_ID` environment variable for MVP development:
- All API routes validate against this single user ID
- Simplified authentication (no multi-tenancy)
- Environment-based user context

## API Endpoints Summary

### Jobs
- `GET /api/jobs/:id` - Fetch job details
- `PATCH /api/jobs/:id` - Update job analysis/scores

### Proposals
- `GET /api/proposals` - List all proposals
- `POST /api/proposals` - Create draft proposal
- `POST /api/proposals/generate` - Generate with Claude

### Inbox
- `POST /api/inbox/ingest` - Ingest email
- `GET /api/inbox/messages/:id` - Fetch message
- `PATCH /api/inbox/messages/:id/status` - Update status
- `POST /api/inbox/messages/:id/create-job` - Convert to Job

### Analysis
- `GET /api/jobs/:id/sophia-reports` - Fetch Sophia analyses
- `POST /api/sophia/analyze` - Run Sophia analysis

## UI Components Library

### Created Components
- **Button**: Multiple variants (default, secondary, destructive, ghost, outline)
- **Input**: Form text input
- **Textarea**: Multi-line text input
- **Badge**: Status badges with variants
- **Card**: Container component with header/content/footer
- **Tabs**: Tabbed interface component
- **Label**: Form label component
- **Separator**: Horizontal divider
- **Progress**: Progress bar component
- **Slider**: Range slider component
- **Skeleton**: Loading placeholder

## Key Features & Highlights

1. **Smart Job Analysis**
   - 5-dimension scoring system
   - Sophia AI-powered analysis with meta-questions
   - Decision tracking (propose/hold/drop)

2. **Bilingual Proposal Generation**
   - Claude 3.5 Sonnet powered
   - Template-based (A/B variants)
   - Japanese-first, English translation
   - Professional formatting

3. **Email Integration**
   - Inbox message parsing with Claude
   - Automatic job link extraction
   - Job creation from emails

4. **Comprehensive Analysis**
   - Q_META: Intention, misalignment, Socratic questions
   - F_ULTIMATE: Awareness, classification, navigation, verification
   - Artifacts: Generated content (summaries, pitches, proposals)

5. **Full Project Lifecycle**
   - Job discovery → Analysis → Proposal → Tracking

## Development Setup

### Environment Variables (.env)
```bash
# Database
DATABASE_URL=postgresql://...

# UpWork API (future)
UPWORK_CLIENT_ID=...
UPWORK_CLIENT_SECRET=...

# Claude AI
ANTHROPIC_API_KEY=sk-ant-...

# Single-user MVP mode
SINGLE_USER_ID=user-id-here
```

### Installation
```bash
npm install
npx prisma migrate dev
npm run dev  # localhost:3000
```

## Testing
- TypeScript strict mode validation
- Zod schema validation for all APIs
- Component-level error boundaries

## Future Enhancements

1. **Phase 7: Miyabi Agent Integration**
   - Autonomous job research
   - Proposal optimization
   - Contract monitoring

2. **Multi-user Support**
   - Remove SINGLE_USER_ID
   - Add user authentication
   - Per-user data isolation

3. **UpWork OAuth Integration**
   - Real UpWork API connectivity
   - Live job sync
   - Direct proposal submission

4. **Contract Management**
   - Milestone tracking
   - Timesheet logging
   - Payment tracking

5. **Analytics & Reporting**
   - Win rate tracking
   - Income statistics
   - Performance metrics

6. **Deployment**
   - Vercel deployment configuration
   - PostgreSQL on Railway/Supabase
   - CI/CD pipeline with GitHub Actions

## Performance Optimizations

- Next.js RSC (React Server Components) for data fetching
- TanStack Query for client-side caching
- Prisma query optimization
- Image optimization
- CSS-in-JS with Tailwind

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance (WCAG AA)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

**Current Status**: MVP Phase 6 Complete - All core features implemented
**Version**: 0.1.0 (Beta)
**Next**: Phase 7 (Miyabi Agent Integration) & Deployment to Vercel
