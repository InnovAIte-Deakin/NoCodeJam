import { supabase } from '@/lib/supabaseClient';
import { Badge } from '@/types';

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  criteria: BadgeCriteria;
  xpRequired?: number;
  challengesRequired?: number;
  difficultyRequired?: string[];
  isSecret?: boolean;
}

export interface BadgeCriteria {
  type: 'challenges_completed' | 'xp_earned' | 'first_challenge' | 'difficulty_master' | 'leaderboard_position' | 'streak' | 'expert_challenges';
  value: number;
  additional?: {
    difficulty?: string[];
    consecutiveDays?: number;
    topPosition?: number;
  };
}

export interface UserProgress {
  totalChallenges: number;
  totalXP: number;
  challengesByDifficulty: Record<string, number>;
  currentStreak: number;
  leaderboardPosition: number;
  expertChallenges: number;
}

// Predefined badge definitions based on requirements - matches database exactly
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: '0ed6f802-dbff-48e7-8ee3-bbe3328818f4',
    name: 'Novice',
    description: 'Complete your first challenge',
    icon_url: '🌟',
    criteria: {
      type: 'first_challenge',
      value: 1
    }
  },
  {
    id: 'd09854a9-d962-46c7-8eee-13bbb933b4d9',
    name: 'Pioneer',
    description: 'Complete 5 challenges',
    icon_url: '🚀',
    criteria: {
      type: 'challenges_completed',
      value: 5
    }
  },
  {
    id: 'c54c863d-b1af-4999-b6cb-3c0a168a0fef',
    name: 'Master Builder',
    description: 'Complete 15 challenges',
    icon_url: '🏗️',
    criteria: {
      type: 'challenges_completed',
      value: 15
    }
  },
  {
    id: '630d95a3-1d6b-4176-a130-9f22ec934aea',
    name: 'AI Expert',
    description: 'Complete 10 expert-level challenges',
    icon_url: '🤖',
    criteria: {
      type: 'expert_challenges',
      value: 10
    }
  },
  {
    id: '10ac7d58-55f8-4aaf-9cac-8dcd19585dd4',
    name: 'No Code Champion',
    description: 'Complete challenges in all difficulty levels',
    icon_url: '🏆',
    criteria: {
      type: 'difficulty_master',
      value: 3,
      additional: {
        difficulty: ['Beginner', 'Intermediate', 'Expert']
      }
    }
  },
  {
    id: '56467c15-9f30-4bee-b4d4-a5cab7eeabb5',
    name: 'Legend',
    description: 'Reach top 10 on leaderboard',
    icon_url: '👑',
    criteria: {
      type: 'leaderboard_position',
      value: 10
    }
  },
  {
    id: '0ba49e4e-9137-4ffe-894b-12f765e73f35',
    name: 'XP Collector',
    description: 'Earn 1000 XP',
    icon_url: '💎',
    criteria: {
      type: 'xp_earned',
      value: 1000
    }
  },
  {
    id: '9a8b997d-44b5-45df-b05d-6fc0987a5cd0',
    name: 'Consistent Learner',
    description: 'Submit challenges for 7 consecutive days',
    icon_url: '📅',
    criteria: {
      type: 'streak',
      value: 7,
      additional: {
        consecutiveDays: 7
      }
    }
  },
  {
    id: '1178544a-c405-4e51-a090-c97948720ae7',
    name: 'Speed Demon',
    description: 'Complete 3 challenges in one day',
    icon_url: '⚡',
    criteria: {
      type: 'challenges_completed',
      value: 3,
      additional: {
        consecutiveDays: 1
      }
    }
  }
];

export class BadgeService {
  /**
   * Get user's current progress statistics
   */
  static async getUserProgress(userId: string): Promise<UserProgress> {
    try {

      // Get total approved submissions with correct join for challenge difficulty
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('challenge_id, submitted_at, challenges (difficulty)')
        .eq('user_id', userId)
        .eq('status', 'approved');

      if (submissionsError) {
        console.error('Supabase submissionsError:', submissionsError);
        console.error('Supabase submissions data:', submissions);
        throw submissionsError;
      }

      // Get user XP
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('total_xp')
        .eq('id', userId)
        .single();

      if (userError) throw userError;


      // Log submissions for debugging
      console.log('BadgeService: submissions data:', submissions);

      // Calculate difficulty counts robustly
      const challengesByDifficulty = (submissions || []).reduce((acc, sub) => {
        let difficulty = 'Unknown';
        if (sub.challenges) {
          if (Array.isArray(sub.challenges) && sub.challenges.length > 0) {
            difficulty = sub.challenges[0]?.difficulty || 'Unknown';
          } else if (typeof sub.challenges === 'object' && sub.challenges !== null && !Array.isArray(sub.challenges)) {
            difficulty = (sub.challenges as { difficulty?: string }).difficulty || 'Unknown';
          }
        }
        acc[difficulty] = (acc[difficulty] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Calculate current streak (simplified - you might want to improve this)
      const streak = await this.calculateSubmissionStreak(userId);

      // Get leaderboard position (simplified)
      const position = await this.getLeaderboardPosition(userId);

      return {
        totalChallenges: submissions?.length || 0,
        totalXP: userData?.total_xp || 0,
        challengesByDifficulty,
        currentStreak: streak,
        leaderboardPosition: position,
        expertChallenges: challengesByDifficulty['Expert'] || 0
      };
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  /**
   * Check which badges a user should earn based on their progress
   */
  static async checkEligibleBadges(userId: string): Promise<BadgeDefinition[]> {
    const progress = await this.getUserProgress(userId);
    const eligibleBadges: BadgeDefinition[] = [];

    for (const badge of BADGE_DEFINITIONS) {
      if (await this.checkBadgeCriteria(badge, progress)) {
        // Check if user already has this badge
        const hasBadge = await this.userHasBadge(userId, badge.id);
        if (!hasBadge) {
          eligibleBadges.push(badge);
        }
      }
    }

    return eligibleBadges;
  }

  /**
   * Award badges to a user
   */
  static async awardBadges(userId: string, badges: BadgeDefinition[]): Promise<void> {
    try {
      for (const badge of badges) {
        // First, ensure the badge exists in the badges table
        await this.ensureBadgeExists(badge);

        // Use the badge ID directly since we have the exact UUIDs from the database
        const { error } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badge.id, // Direct use of UUID
            earned_at: new Date().toISOString()
          });

        if (error && !error.message.includes('duplicate')) {
          console.error(`Error awarding badge ${badge.name} (${badge.id}):`, error);
          throw error;
        } else {
          console.log(`Successfully awarded badge ${badge.name} to user ${userId}`);
        }
      }
    } catch (error) {
      console.error('Error awarding badges:', error);
      throw error;
    }
  }

  /**
   * Check and award badges after a user action
   */
  static async processUserAction(userId: string): Promise<BadgeDefinition[]> {
    try {
      const eligibleBadges = await this.checkEligibleBadges(userId);
      
      if (eligibleBadges.length > 0) {
        await this.awardBadges(userId, eligibleBadges);
        return eligibleBadges;
      }
      
      return [];
    } catch (error) {
      console.error('Error processing user action:', error);
      return [];
    }
  }

  /**
   * Get all badges earned by a user
   */
  static async getUserBadges(userId: string): Promise<Badge[]> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          earned_at,
          badges!inner (
            id,
            name,
            description,
            icon_url
          )
        `)
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (data || []).map((item: any) => ({
        id: item.badges.id,
        name: item.badges.name,
        description: item.badges.description,
        icon: item.badges.icon_url,
        unlockedAt: new Date(item.earned_at)
      }) as Badge);
    } catch (error) {
      console.error('Error getting user badges:', error);
      return [];
    }
  }

  // Private helper methods
  private static async checkBadgeCriteria(badge: BadgeDefinition, progress: UserProgress): Promise<boolean> {
    switch (badge.criteria.type) {
      case 'first_challenge':
      case 'challenges_completed':
        return progress.totalChallenges >= badge.criteria.value;

      case 'xp_earned':
        return progress.totalXP >= badge.criteria.value;

      case 'expert_challenges':
        return progress.expertChallenges >= badge.criteria.value;

      case 'difficulty_master': {
        const requiredDifficulties = badge.criteria.additional?.difficulty || [];
        return requiredDifficulties.every(diff => 
          (progress.challengesByDifficulty[diff] || 0) > 0
        );
      }

      case 'leaderboard_position':
        return progress.leaderboardPosition > 0 && progress.leaderboardPosition <= badge.criteria.value;

      case 'streak':
        return progress.currentStreak >= badge.criteria.value;

      default:
        return false;
    }
  }

  private static async userHasBadge(userId: string, badgeId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_id', badgeId)
      .single();

    return !error && !!data;
  }

  private static async ensureBadgeExists(badge: BadgeDefinition): Promise<void> {
    const { error } = await supabase
      .from('badges')
      .upsert({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon_url: badge.icon_url,
        criteria: JSON.stringify(badge.criteria)
      }, {
        onConflict: 'id'
      });

    if (error) throw error;
  }

  private static async calculateSubmissionStreak(userId: string): Promise<number> {
    // Simplified streak calculation
    // You could implement a more sophisticated version
    const { data, error } = await supabase
      .from('submissions')
      .select('submitted_at')
      .eq('user_id', userId)
      .eq('status', 'approved')
      .order('submitted_at', { ascending: false })
      .limit(30);

    if (error || !data) return 0;

    // Calculate consecutive days (simplified logic)
    let streak = 0;
    let currentDate = new Date();
    
    for (const submission of data) {
      const submissionDate = new Date(submission.submitted_at);
      const daysDiff = Math.floor((currentDate.getTime() - submissionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= streak + 1) {
        streak++;
        currentDate = submissionDate;
      } else {
        break;
      }
    }

    return streak;
  }

  private static async getLeaderboardPosition(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('users')
      .select('id, total_xp')
      .order('total_xp', { ascending: false });

    if (error || !data) return 0;

    const position = data.findIndex(user => user.id === userId);
    return position >= 0 ? position + 1 : 0;
  }
}
