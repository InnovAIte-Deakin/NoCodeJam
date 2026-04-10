import { supabase } from "@/lib/supabaseClient";

export interface DashboardSummary {
  current_xp: number;
  xp_progress_percent: number;
  xp_to_next_milestone: number;
  completed_challenges: number;
  badge_count: number;
}

export interface RecentSubmission {
  id: string;
  challenge_id: string;
  challenge_title: string;
  status: "pending" | "approved" | "rejected" | string;
  submitted_at: string | null;
  submission_url: string | null;
  admin_feedback: string | null;
}

export interface PathwayProgressSummary {
  pathway_id: string;
  pathway_title: string;
  progress_percent: number;
  completed_challenges: number;
  total_challenges: number;
  total_xp: number;
  status: "active" | "completed" | "dropped" | string;
}

export interface DashboardAnalyticsData {
  summary: DashboardSummary;
  recent_submissions: RecentSubmission[];
  pathways: PathwayProgressSummary[];
}

type SubmissionRow = {
  id: string;
  challenge_id: string;
  status: string;
  submitted_at: string | null;
  submission_url: string | null;
  admin_feedback: string | null;
};

type ChallengeTitleRow = {
  id: string;
  title: string;
};

type UserXpRow = {
  total_xp: number | null;
};

type EnrollmentRow = {
  pathway_id: string;
  status: string;
  progress: number | null;
  started_at: string;
};

type PathwayRow = {
  id: string;
  title: string;
  total_xp: number;
};

type ModuleRow = {
  id: string;
  pathway_id: string;
};

type ChallengeRow = {
  id: string;
  module_id: string | null;
};

type CompletionRow = {
  challenge_id: string;
};

function getNextMilestone(currentXp: number): number {
  if (currentXp <= 0) {
    return 1000;
  }

  return Math.ceil(currentXp / 1000) * 1000;
}

function buildDashboardSummary(
  currentXp: number,
  completedChallenges: number,
  badgeCount: number
): DashboardSummary {
  const nextMilestone = getNextMilestone(currentXp);

  return {
    current_xp: currentXp,
    xp_progress_percent: (currentXp % 1000) / 10,
    xp_to_next_milestone: nextMilestone - currentXp,
    completed_challenges: completedChallenges,
    badge_count: badgeCount,
  };
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const [{ data: userData, error: userError }, { count: completedChallenges, error: submissionsError }, { count: badgeCount, error: badgeError }] =
    await Promise.all([
      supabase.from("users").select("total_xp").eq("id", userId).single(),
      supabase
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "approved"),
      supabase
        .from("user_badges")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

  if (userError) {
    throw new Error(userError.message || "Failed to fetch dashboard summary");
  }

  if (submissionsError) {
    throw new Error(submissionsError.message || "Failed to fetch completed challenges");
  }

  if (badgeError) {
    throw new Error(badgeError.message || "Failed to fetch badge count");
  }

  return buildDashboardSummary(
    ((userData as UserXpRow | null)?.total_xp ?? 0),
    completedChallenges ?? 0,
    badgeCount ?? 0
  );
}

export async function getRecentSubmissions(
  userId: string,
  limit = 5
): Promise<RecentSubmission[]> {
  const { data: submissionsData, error: submissionsError } = await supabase
    .from("submissions")
    .select("id, challenge_id, status, submitted_at, submission_url, admin_feedback")
    .eq("user_id", userId)
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (submissionsError) {
    throw new Error(submissionsError.message || "Failed to fetch recent submissions");
  }

  const submissions = (submissionsData as SubmissionRow[] | null) ?? [];
  const challengeIds = Array.from(
    new Set(
      submissions
        .map((submission) => submission.challenge_id)
        .filter((challengeId): challengeId is string => Boolean(challengeId))
    )
  );

  let challengeTitles = new Map<string, string>();

  if (challengeIds.length > 0) {
    const { data: challengesData, error: challengesError } = await supabase
      .from("challenges")
      .select("id, title")
      .in("id", challengeIds);

    if (challengesError) {
      throw new Error(challengesError.message || "Failed to fetch submission challenge titles");
    }

    challengeTitles = new Map(
      ((challengesData as ChallengeTitleRow[] | null) ?? []).map((challenge) => [
        challenge.id,
        challenge.title,
      ])
    );
  }

  return submissions.map((submission) => ({
    ...submission,
    challenge_title: challengeTitles.get(submission.challenge_id) ?? "Untitled challenge",
  }));
}

export async function getUserPathwayProgress(
  userId: string
): Promise<PathwayProgressSummary[]> {
  const { data: enrollmentsData, error: enrollmentsError } = await supabase
    .from("pathway_enrollments")
    .select("pathway_id, status, progress, started_at")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (enrollmentsError) {
    throw new Error(enrollmentsError.message || "Failed to fetch pathway enrollments");
  }

  const enrollments = (enrollmentsData as EnrollmentRow[] | null) ?? [];

  if (enrollments.length === 0) {
    return [];
  }

  const pathwayIds = enrollments.map((enrollment) => enrollment.pathway_id);

  const [{ data: pathwaysData, error: pathwaysError }, { data: modulesData, error: modulesError }] =
    await Promise.all([
      supabase.from("pathways").select("id, title, total_xp").in("id", pathwayIds),
      supabase.from("pathway_modules").select("id, pathway_id").in("pathway_id", pathwayIds),
    ]);

  if (pathwaysError) {
    throw new Error(pathwaysError.message || "Failed to fetch pathways");
  }

  if (modulesError) {
    throw new Error(modulesError.message || "Failed to fetch pathway modules");
  }

  const pathways = (pathwaysData as PathwayRow[] | null) ?? [];
  const modules = (modulesData as ModuleRow[] | null) ?? [];
  const moduleIds = modules.map((module) => module.id);

  let challenges: ChallengeRow[] = [];
  if (moduleIds.length > 0) {
    const { data: challengesData, error: challengesError } = await supabase
      .from("challenges")
      .select("id, module_id")
      .in("module_id", moduleIds)
      .eq("status", "published");

    if (challengesError) {
      throw new Error(challengesError.message || "Failed to fetch pathway challenges");
    }

    challenges = (challengesData as ChallengeRow[] | null) ?? [];
  }

  const challengeIds = challenges.map((challenge) => challenge.id);
  let completions: CompletionRow[] = [];

  if (challengeIds.length > 0) {
    const { data: completionsData, error: completionsError } = await supabase
      .from("challenge_completions")
      .select("challenge_id")
      .eq("user_id", userId)
      .in("challenge_id", challengeIds);

    if (completionsError) {
      throw new Error(completionsError.message || "Failed to fetch pathway challenge completions");
    }

    completions = (completionsData as CompletionRow[] | null) ?? [];
  }

  const pathwaysById = new Map(pathways.map((pathway) => [pathway.id, pathway]));
  const modulesByPathwayId = new Map<string, ModuleRow[]>();
  const challengesByModuleId = new Map<string, ChallengeRow[]>();
  const completedChallengeIds = new Set(completions.map((completion) => completion.challenge_id));

  for (const module of modules) {
    const currentModules = modulesByPathwayId.get(module.pathway_id) ?? [];
    currentModules.push(module);
    modulesByPathwayId.set(module.pathway_id, currentModules);
  }

  for (const challenge of challenges) {
    if (!challenge.module_id) {
      continue;
    }

    const currentChallenges = challengesByModuleId.get(challenge.module_id) ?? [];
    currentChallenges.push(challenge);
    challengesByModuleId.set(challenge.module_id, currentChallenges);
  }

  return enrollments.flatMap((enrollment) => {
    const pathway = pathwaysById.get(enrollment.pathway_id);
    if (!pathway) {
      return [];
    }

    const pathwayModules = modulesByPathwayId.get(enrollment.pathway_id) ?? [];
    const pathwayChallenges = pathwayModules.flatMap(
      (module) => challengesByModuleId.get(module.id) ?? []
    );
    const totalChallenges = pathwayChallenges.length;
    const completedChallenges = pathwayChallenges.filter((challenge) =>
      completedChallengeIds.has(challenge.id)
    ).length;

    return [
      {
        pathway_id: pathway.id,
        pathway_title: pathway.title,
        progress_percent: enrollment.progress ?? 0,
        completed_challenges: completedChallenges,
        total_challenges: totalChallenges,
        total_xp: pathway.total_xp,
        status: enrollment.status,
      },
    ];
  });
}

export async function getDashboardAnalyticsData(
  userId: string
): Promise<DashboardAnalyticsData> {
  const [summary, recentSubmissions, pathways] = await Promise.all([
    getDashboardSummary(userId),
    getRecentSubmissions(userId),
    getUserPathwayProgress(userId),
  ]);

  return {
    summary,
    recent_submissions: recentSubmissions,
    pathways,
  };
}
