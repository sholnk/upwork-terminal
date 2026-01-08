/**
 * Proposal Analytics Engine
 * Analyzes proposal history to identify winning patterns
 */

export interface ProposalStats {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
  winRate: number; // percentage
}

export interface SkillAnalytics {
  skill: string;
  count: number;
  winRate: number;
  avgProposalTime: number; // days from posting to acceptance
}

export interface BudgetRangeAnalytics {
  range: string; // e.g., "0-1000", "1000-5000"
  count: number;
  winRate: number;
  avgBudget: number;
}

export interface ClientQualityAnalytics {
  rating: number; // 1-5
  count: number;
  winRate: number;
}

export interface ProposalAnalytics {
  overall: ProposalStats;
  bySkill: SkillAnalytics[];
  byBudgetRange: BudgetRangeAnalytics[];
  byClientRating: ClientQualityAnalytics[];
  topSkills: string[]; // Top 5 by win rate
  bestBudgetRange: string;
}

/**
 * Proposal input type for analytics
 */
interface ProposalInput {
  status?: string;
  job?: {
    skills?: string[];
    budget?: number;
    clientInfo?: {
      rating?: number;
    };
  };
}

/**
 * Calculate proposal win rate
 */
function calculateWinRate(accepted: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((accepted / total) * 100);
}

/**
 * Get budget range label
 */
function getBudgetRange(budget: number): string {
  if (budget < 1000) return "0-1000";
  if (budget < 5000) return "1000-5000";
  if (budget < 10000) return "5000-10000";
  return "10000+";
}

/**
 * Analyze proposal data
 */
export function analyzeProposals(proposals: ProposalInput[]): ProposalAnalytics {
  const skillMap = new Map<string, { count: number; won: number }>();
  const budgetMap = new Map<string, { count: number; won: number }>();
  const ratingMap = new Map<number, { count: number; won: number }>();

  let totalProposals = 0;
  let acceptedProposals = 0;
  let rejectedProposals = 0;
  let pendingProposals = 0;

  // Process each proposal
  proposals.forEach((proposal) => {
    totalProposals++;

    // Count by status
    if (proposal.status === "accepted") acceptedProposals++;
    else if (proposal.status === "rejected") rejectedProposals++;
    else if (proposal.status === "pending") pendingProposals++;

    const isWon = proposal.status === "accepted";

    // Analyze by skills
    if (proposal.job?.skills) {
      proposal.job.skills.forEach((skill: string) => {
        const current = skillMap.get(skill) || { count: 0, won: 0 };
        skillMap.set(skill, {
          count: current.count + 1,
          won: current.won + (isWon ? 1 : 0),
        });
      });
    }

    // Analyze by budget range
    if (proposal.job?.budget) {
      const range = getBudgetRange(proposal.job.budget);
      const current = budgetMap.get(range) || { count: 0, won: 0 };
      budgetMap.set(range, {
        count: current.count + 1,
        won: current.won + (isWon ? 1 : 0),
      });
    }

    // Analyze by client rating
    if (proposal.job?.clientInfo?.rating) {
      const rating = Math.floor(proposal.job.clientInfo.rating);
      const current = ratingMap.get(rating) || { count: 0, won: 0 };
      ratingMap.set(rating, {
        count: current.count + 1,
        won: current.won + (isWon ? 1 : 0),
      });
    }
  });

  // Compile results
  const bySkill: SkillAnalytics[] = Array.from(skillMap.entries())
    .map(([skill, data]) => ({
      skill,
      count: data.count,
      winRate: calculateWinRate(data.won, data.count),
      avgProposalTime: 3, // Placeholder
    }))
    .sort((a, b) => b.winRate - a.winRate);

  const byBudgetRange: BudgetRangeAnalytics[] = Array.from(budgetMap.entries())
    .map(([range, data]) => ({
      range,
      count: data.count,
      winRate: calculateWinRate(data.won, data.count),
      avgBudget: 5000, // Placeholder
    }))
    .sort((a, b) => b.winRate - a.winRate);

  const byClientRating: ClientQualityAnalytics[] = Array.from(ratingMap.entries())
    .map(([rating, data]) => ({
      rating,
      count: data.count,
      winRate: calculateWinRate(data.won, data.count),
    }))
    .sort((a, b) => b.rating - a.rating);

  const topSkills = bySkill
    .slice(0, 5)
    .map((s) => s.skill);

  const bestBudgetRange = byBudgetRange[0]?.range || "不明";

  return {
    overall: {
      total: totalProposals,
      accepted: acceptedProposals,
      rejected: rejectedProposals,
      pending: pendingProposals,
      winRate: calculateWinRate(acceptedProposals, totalProposals),
    },
    bySkill,
    byBudgetRange,
    byClientRating,
    topSkills,
    bestBudgetRange,
  };
}
