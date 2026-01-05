-- CreateEnum
CREATE TYPE "ProfileSource" AS ENUM ('paste', 'file', 'upwork_api');

-- CreateEnum
CREATE TYPE "SophiaTargetType" AS ENUM ('profile', 'job', 'proposal');

-- CreateEnum
CREATE TYPE "InboxProvider" AS ENUM ('gmail', 'forwarded_email', 'manual');

-- CreateEnum
CREATE TYPE "InboxStatus" AS ENUM ('new', 'processed', 'ignored');

-- CreateEnum
CREATE TYPE "InboxExtractType" AS ENUM ('job_link', 'text_extract');

-- CreateEnum
CREATE TYPE "JobSource" AS ENUM ('upwork', 'inbox', 'manual');

-- CreateEnum
CREATE TYPE "ProposalTemplateType" AS ENUM ('A_short_deliverable', 'B_audit_then_build');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "upworkUserId" TEXT,
    "upworkProfile" JSONB,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hourlyRate" DECIMAL(10,2),
    "skills" TEXT[],
    "timezone" TEXT,
    "availability" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "jobAlerts" BOOLEAN NOT NULL DEFAULT true,
    "proposalAlerts" BOOLEAN NOT NULL DEFAULT true,
    "autoSyncJobs" BOOLEAN NOT NULL DEFAULT true,
    "syncFrequencyMinutes" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profile_snapshots" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "source" "ProfileSource" NOT NULL,
    "rawProfileText" TEXT NOT NULL,
    "intentMemoJa" TEXT,
    "portfolios" JSONB,
    "firstMonthStrategy" TEXT,
    "englishConfidence" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profile_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sophia_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetType" "SophiaTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "userAnswerJa" TEXT,
    "qMetaJson" JSONB NOT NULL,
    "fUltimateJson" JSONB NOT NULL,
    "artifactsJson" JSONB NOT NULL,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "rawResponse" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sophia_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbox_messages" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "InboxProvider" NOT NULL,
    "from" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "snippet" TEXT,
    "rawBodyText" TEXT,
    "receivedAt" TIMESTAMP(3) NOT NULL,
    "status" "InboxStatus" NOT NULL DEFAULT 'new',
    "createdJobId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inbox_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inbox_extracts" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "type" "InboxExtractType" NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inbox_extracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" TEXT NOT NULL,
    "upworkJobId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT,
    "subcategory" TEXT,
    "skills" TEXT[],
    "budget" DECIMAL(10,2),
    "budgetType" TEXT,
    "duration" TEXT,
    "experienceLevel" TEXT,
    "jobType" TEXT,
    "postedAt" TIMESTAMP(3) NOT NULL,
    "url" TEXT NOT NULL,
    "clientInfo" JSONB,
    "userId" TEXT NOT NULL,
    "saved" BOOLEAN NOT NULL DEFAULT false,
    "savedAt" TIMESTAMP(3),
    "tags" TEXT[],
    "notes" TEXT,
    "rating" INTEGER,
    "source" "JobSource" NOT NULL DEFAULT 'upwork',
    "createdFromInboxMessageId" TEXT,
    "analysisJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposals" (
    "id" TEXT NOT NULL,
    "upworkProposalId" TEXT,
    "jobId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coverLetter" TEXT NOT NULL,
    "bidAmount" DECIMAL(10,2),
    "bidType" TEXT,
    "estimatedHours" INTEGER,
    "templateName" TEXT,
    "templateType" "ProposalTemplateType",
    "inputJson" JSONB,
    "connectsUsed" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "submittedAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),
    "clientResponse" TEXT,
    "clientViewed" BOOLEAN NOT NULL DEFAULT false,
    "viewedAt" TIMESTAMP(3),
    "responseRate" DECIMAL(5,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposal_templates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "proposal_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" TEXT NOT NULL,
    "upworkContractId" TEXT NOT NULL,
    "proposalId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "contractType" TEXT NOT NULL,
    "rate" DECIMAL(10,2),
    "weeklyLimit" INTEGER,
    "totalAmount" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'active',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "totalEarned" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalHours" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "milestones" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "upworkMilestoneId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timesheets" (
    "id" TEXT NOT NULL,
    "contractId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "hours" DECIMAL(5,2) NOT NULL,
    "description" TEXT,
    "memo" TEXT,
    "manualTime" BOOLEAN NOT NULL DEFAULT false,
    "trackedTime" DECIMAL(5,2),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "timesheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "upworkClientId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "location" TEXT,
    "timezone" TEXT,
    "totalSpent" DECIMAL(12,2),
    "totalHires" INTEGER,
    "paymentVerified" BOOLEAN NOT NULL DEFAULT false,
    "rating" DECIMAL(3,2),
    "reviewsCount" INTEGER,
    "tags" TEXT[],
    "notes" TEXT,
    "favorited" BOOLEAN NOT NULL DEFAULT false,
    "lastContactAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_communications" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "communicatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_communications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "syncType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "recordsSynced" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_upworkUserId_key" ON "users"("upworkUserId");

-- CreateIndex
CREATE INDEX "users_upworkUserId_idx" ON "users"("upworkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- CreateIndex
CREATE INDEX "profile_snapshots_userId_idx" ON "profile_snapshots"("userId");

-- CreateIndex
CREATE INDEX "sophia_reports_userId_idx" ON "sophia_reports"("userId");

-- CreateIndex
CREATE INDEX "sophia_reports_targetType_idx" ON "sophia_reports"("targetType");

-- CreateIndex
CREATE INDEX "sophia_reports_createdAt_idx" ON "sophia_reports"("createdAt");

-- CreateIndex
CREATE INDEX "inbox_messages_userId_idx" ON "inbox_messages"("userId");

-- CreateIndex
CREATE INDEX "inbox_messages_status_idx" ON "inbox_messages"("status");

-- CreateIndex
CREATE INDEX "inbox_messages_receivedAt_idx" ON "inbox_messages"("receivedAt");

-- CreateIndex
CREATE INDEX "inbox_extracts_messageId_idx" ON "inbox_extracts"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "jobs_upworkJobId_key" ON "jobs"("upworkJobId");

-- CreateIndex
CREATE INDEX "jobs_userId_idx" ON "jobs"("userId");

-- CreateIndex
CREATE INDEX "jobs_upworkJobId_idx" ON "jobs"("upworkJobId");

-- CreateIndex
CREATE INDEX "jobs_saved_idx" ON "jobs"("saved");

-- CreateIndex
CREATE INDEX "jobs_postedAt_idx" ON "jobs"("postedAt");

-- CreateIndex
CREATE UNIQUE INDEX "proposals_upworkProposalId_key" ON "proposals"("upworkProposalId");

-- CreateIndex
CREATE INDEX "proposals_userId_idx" ON "proposals"("userId");

-- CreateIndex
CREATE INDEX "proposals_jobId_idx" ON "proposals"("jobId");

-- CreateIndex
CREATE INDEX "proposals_status_idx" ON "proposals"("status");

-- CreateIndex
CREATE INDEX "proposals_submittedAt_idx" ON "proposals"("submittedAt");

-- CreateIndex
CREATE INDEX "proposal_templates_userId_idx" ON "proposal_templates"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_upworkContractId_key" ON "contracts"("upworkContractId");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_proposalId_key" ON "contracts"("proposalId");

-- CreateIndex
CREATE INDEX "contracts_userId_idx" ON "contracts"("userId");

-- CreateIndex
CREATE INDEX "contracts_clientId_idx" ON "contracts"("clientId");

-- CreateIndex
CREATE INDEX "contracts_status_idx" ON "contracts"("status");

-- CreateIndex
CREATE INDEX "contracts_startDate_idx" ON "contracts"("startDate");

-- CreateIndex
CREATE UNIQUE INDEX "milestones_upworkMilestoneId_key" ON "milestones"("upworkMilestoneId");

-- CreateIndex
CREATE INDEX "milestones_contractId_idx" ON "milestones"("contractId");

-- CreateIndex
CREATE INDEX "milestones_status_idx" ON "milestones"("status");

-- CreateIndex
CREATE INDEX "timesheets_contractId_idx" ON "timesheets"("contractId");

-- CreateIndex
CREATE INDEX "timesheets_date_idx" ON "timesheets"("date");

-- CreateIndex
CREATE UNIQUE INDEX "timesheets_contractId_date_key" ON "timesheets"("contractId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "clients_upworkClientId_key" ON "clients"("upworkClientId");

-- CreateIndex
CREATE INDEX "clients_userId_idx" ON "clients"("userId");

-- CreateIndex
CREATE INDEX "clients_upworkClientId_idx" ON "clients"("upworkClientId");

-- CreateIndex
CREATE INDEX "client_communications_clientId_idx" ON "client_communications"("clientId");

-- CreateIndex
CREATE INDEX "client_communications_communicatedAt_idx" ON "client_communications"("communicatedAt");

-- CreateIndex
CREATE INDEX "sync_logs_userId_idx" ON "sync_logs"("userId");

-- CreateIndex
CREATE INDEX "sync_logs_syncType_idx" ON "sync_logs"("syncType");

-- CreateIndex
CREATE INDEX "sync_logs_startedAt_idx" ON "sync_logs"("startedAt");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profile_snapshots" ADD CONSTRAINT "profile_snapshots_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sophia_reports" ADD CONSTRAINT "sophia_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox_messages" ADD CONSTRAINT "inbox_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inbox_extracts" ADD CONSTRAINT "inbox_extracts_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "inbox_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposals" ADD CONSTRAINT "proposals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_proposalId_fkey" FOREIGN KEY ("proposalId") REFERENCES "proposals"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "milestones" ADD CONSTRAINT "milestones_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "timesheets" ADD CONSTRAINT "timesheets_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_communications" ADD CONSTRAINT "client_communications_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_logs" ADD CONSTRAINT "sync_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
