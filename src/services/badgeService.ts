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
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    name: 'Welcome Badge',
    description: 'Awarded for signing up to the platform',
    icon_url: '👋',
    criteria: {
      type: 'xp_earned',
      value: 0 // Award to anyone with 0 or more XP (everyone)
    }
  },
  {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
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
    console.log(`Checking eligible badges for user: ${userId}`);

    const progress = await this.getUserProgress(userId);
    console.log(`User progress:`, progress);

    // Fetch dynamic badges from DB; fall back to static seed list if empty
    let dynamicBadges: BadgeDefinition[] = [];
    try {
      dynamicBadges = await this.getAllBadges();
    } catch (e) {
      console.warn('Failed to fetch badges from DB, falling back to static definitions.', e);
    }

    // Merge: DB overrides static by id; include any static not yet in DB (useful during initial seeding)
    const byId = new Map<string, BadgeDefinition>();
    for (const b of BADGE_DEFINITIONS) byId.set(b.id, b);
    for (const b of dynamicBadges) byId.set(b.id, b); // DB wins
    const effectiveBadges = Array.from(byId.values());

    console.log(`Using ${effectiveBadges.length} badge definitions (DB: ${dynamicBadges.length}, static fallback: ${BADGE_DEFINITIONS.length})`);

    const eligibleBadges: BadgeDefinition[] = [];
    for (const badge of effectiveBadges) {
      console.log(`Checking badge: ${badge.name} (${badge.id})`);
      const meetsCriteria = await this.checkBadgeCriteria(badge, progress);
      console.log(`Meets criteria for ${badge.name}: ${meetsCriteria}`);
      if (meetsCriteria) {
        const hasBadge = await this.userHasBadge(userId, badge.id);
        console.log(`User already has ${badge.name}: ${hasBadge}`);
        if (!hasBadge) {
          console.log(`Adding ${badge.name} to eligible badges`);
          eligibleBadges.push(badge);
        }
      }
    }

    console.log(`Total eligible badges: ${eligibleBadges.length}`, eligibleBadges.map(b => b.name));
    return eligibleBadges;
  }

  /**
   * Award badges to a user
   */
  static async awardBadges(userId: string, badges: BadgeDefinition[]): Promise<void> {
    try {
      console.log(`Attempting to award ${badges.length} badges to user ${userId}`);
      
      for (const badge of badges) {
        console.log(`Processing badge: ${badge.name} (${badge.id})`);
        
        // First, ensure the badge exists in the badges table
        await this.ensureBadgeExists(badge);
        console.log(`Badge ${badge.name} exists in badges table`);

        // Use the badge ID directly since we have the exact UUIDs from the database
        const { data, error } = await supabase
          .from('user_badges')
          .insert({
            user_id: userId,
            badge_id: badge.id, // Direct use of UUID
            earned_at: new Date().toISOString()
          })
          .select();

        if (error) {
          if (error.message.includes('duplicate')) {
            console.log(`Badge ${badge.name} already awarded to user ${userId} (duplicate key)`);
          } else {
            console.error(`Error awarding badge ${badge.name} (${badge.id}):`, error);
            throw error;
          }
        } else {
          console.log(`Successfully awarded badge ${badge.name} to user ${userId}`, data);
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
   * Simple test to manually insert a badge for a user
   */
  static async simpleTestBadgeInsert(): Promise<void> {
    try {
      console.log('=== SIMPLE BADGE INSERT TEST ===');
      
      // Get first user
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username')
        .limit(1);
      
      if (usersError || !users || users.length === 0) {
        console.error('No users found or error:', usersError);
        return;
      }
      
      const user = users[0];
      console.log('Testing with user:', user);
      
      // Get the Welcome Badge
      const welcomeBadge = BADGE_DEFINITIONS.find(b => b.name === 'Welcome Badge');
      if (!welcomeBadge) {
        console.error('Welcome badge not found');
        return;
      }
      
      console.log('Testing with badge:', welcomeBadge);
      
      // First, insert the badge into badges table
      const { error: badgeInsertError } = await supabase
        .from('badges')
        .upsert({
          id: welcomeBadge.id,
          name: welcomeBadge.name,
          description: welcomeBadge.description,
          icon_url: welcomeBadge.icon_url,
          criteria: JSON.stringify(welcomeBadge.criteria)
        }, {
          onConflict: 'id'
        });
      
      if (badgeInsertError) {
        console.error('Error inserting badge:', badgeInsertError);
        return;
      }
      
      console.log('Badge inserted/updated successfully');
      
      // Check if user already has this badge
      const { data: existingBadge, error: checkError } = await supabase
        .from('user_badges')
        .select('id')
        .eq('user_id', user.id)
        .eq('badge_id', welcomeBadge.id)
        .single();
      
      if (!checkError && existingBadge) {
        console.log('User already has this badge:', existingBadge);
        return;
      }
      
      // Try to insert user_badge
      const { data: insertResult, error: insertError } = await supabase
        .from('user_badges')
        .insert({
          user_id: user.id,
          badge_id: welcomeBadge.id,
          earned_at: new Date().toISOString()
        })
        .select();
      
      if (insertError) {
        console.error('Error inserting user badge:', insertError);
        return;
      }
      
      console.log('✅ SUCCESS! User badge inserted:', insertResult);
      
      // Verify it exists
      const { data: verification, error: verifyError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', user.id);
      
      if (verifyError) {
        console.error('Error verifying badge insertion:', verifyError);
      }
      console.log('All user badges for this user:', verification);
      
    } catch (error) {
      console.error('Test failed:', error);
    }
  }

  /**
   * Debug method to check database state
   */
  static async debugDatabaseState(): Promise<void> {
    try {
      console.log('=== DEBUG: Database State ===');
      
      // Check if badges table exists and has data
      const { data: badges, error: badgesError } = await supabase
        .from('badges')
        .select('*');
      
      console.log('Badges table:', badges?.length || 0, 'badges found');
      if (badgesError) console.error('Badges error:', badgesError);
      
      // Check if users table exists and has data
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username, total_xp');
      
      console.log('Users table:', users?.length || 0, 'users found');
      if (usersError) console.error('Users error:', usersError);
      
      // Check user_badges table
      const { data: userBadges, error: userBadgesError } = await supabase
        .from('user_badges')
        .select('*');
      
      console.log('User badges table:', userBadges?.length || 0, 'records found');
      if (userBadgesError) console.error('User badges error:', userBadgesError);
      
      // Check submissions
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('id, user_id, status')
        .eq('status', 'approved');
      
      console.log('Approved submissions:', submissions?.length || 0, 'found');
      if (submissionsError) console.error('Submissions error:', submissionsError);
      
      console.log('=== END DEBUG ===');
      
    } catch (error) {
      console.error('Debug database state error:', error);
    }
  }

  /**
   * Debug method to test badge awarding for a specific user
   */
  static async testBadgeAward(userId: string): Promise<void> {
    try {
      console.log(`Testing badge award for user: ${userId}`);
      
      // Try to award the first badge (Novice badge for completing first challenge)
      const noviceBadge = BADGE_DEFINITIONS.find(b => b.name === 'Novice');
      if (!noviceBadge) {
        console.error('Novice badge not found');
        return;
      }
      
      console.log(`Attempting to award Novice badge:`, noviceBadge);
      
      // Check if user exists
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, username')
        .eq('id', userId)
        .single();
        
      if (userError) {
        console.error('User not found:', userError);
        return;
      }
      
      console.log(`User found:`, user);
      
      // Check current user badges
      const { data: currentBadges, error: badgesError } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId);
      if (badgesError) {
        console.error('Error fetching current user badges:', badgesError);
      }
      console.log(`Current user badges:`, currentBadges);
      
      // Try to award badge
      await this.awardBadges(userId, [noviceBadge]);
      
      console.log(`Badge award completed`);
      
    } catch (error) {
      console.error('Error in test badge award:', error);
    }
  }

  /**
   * Process all users and award badges based on their current progress
   * This is useful for retroactively awarding badges to existing users
   */
  static async processAllUsers(): Promise<{ userId: string; newBadges: BadgeDefinition[] }[]> {
    try {
      console.log('Starting batch badge processing for all users...');
      
      // Get all users
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, username');

      if (usersError) throw usersError;

      const results: { userId: string; newBadges: BadgeDefinition[] }[] = [];

      for (const user of users || []) {
        try {
          console.log(`Processing badges for user: ${user.username} (${user.id})`);
          const newBadges = await this.processUserAction(user.id);
          
          if (newBadges.length > 0) {
            console.log(`Awarded ${newBadges.length} new badges to ${user.username}:`, newBadges.map(b => b.name));
            results.push({ userId: user.id, newBadges });
          } else {
            console.log(`No new badges for ${user.username}`);
          }
        } catch (error) {
          console.error(`Error processing user ${user.username}:`, error);
        }
      }

      console.log(`Batch processing complete. ${results.length} users received new badges.`);
      return results;
    } catch (error) {
      console.error('Error in batch badge processing:', error);
      return [];
    }
  }

  /**
   * Process badges for a specific user based on their current progress
   * This is useful for retroactively awarding badges to a single user
   */
  static async processUserBadges(userId: string): Promise<BadgeDefinition[]> {
    try {
      console.log(`Processing badges for user: ${userId}`);
      const newBadges = await this.processUserAction(userId);
      
      if (newBadges.length > 0) {
        console.log(`Awarded ${newBadges.length} new badges:`, newBadges.map(b => b.name));
      } else {
        console.log('No new badges awarded');
      }
      
      return newBadges;
    } catch (error) {
      console.error('Error processing user badges:', error);
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
      const badges = (data || []).map((item: any) => ({
        id: item.badges.id,
        name: item.badges.name,
        description: item.badges.description,
        icon: item.badges.icon_url,
        unlockedAt: new Date(item.earned_at)
      }) as Badge);

      return badges;
    } catch (error) {
      console.error('Error getting user badges:', error);
      return [];
    }
  }

  /**
   * Get all badge definitions from database
   */
  static async getAllBadges(): Promise<BadgeDefinition[]> {
    try {
      const { data, error } = await supabase
        .from('badges')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      return (data || []).map(badge => ({
        id: badge.id,
        name: badge.name,
        description: badge.description,
        icon_url: badge.icon_url,
        criteria: typeof badge.criteria === 'string' ? JSON.parse(badge.criteria) : badge.criteria
      }));
    } catch (error) {
      console.error('Error getting all badges:', error);
      return [];
    }
  }

  /**
   * Create a new badge
   */
  static async createBadge(badge: Omit<BadgeDefinition, 'id'>): Promise<BadgeDefinition> {
    try {
      // Validate badge data
      this.validateBadgeData(badge);

      const { data, error } = await supabase
        .from('badges')
        .insert({
          name: badge.name,
          description: badge.description,
          icon_url: badge.icon_url,
          criteria: JSON.stringify(badge.criteria)
        })
        .select()
        .single();

      if (error) throw error;

      const newBadge = {
        id: data.id,
        name: data.name,
        description: data.description,
        icon_url: data.icon_url,
        criteria: typeof data.criteria === 'string' ? JSON.parse(data.criteria) : data.criteria
      };

      console.log('Created new badge:', newBadge.name);
      return newBadge;
    } catch (error) {
      console.error('Error creating badge:', error);
      throw error;
    }
  }

  /**
   * Update an existing badge
   */
  static async updateBadge(id: string, updates: Partial<Omit<BadgeDefinition, 'id'>>): Promise<BadgeDefinition> {
    try {
      // Validate updated data
      if (updates.name || updates.description || updates.icon_url || updates.criteria) {
        this.validateBadgeData(updates as BadgeDefinition);
      }

      const updateData: Record<string, unknown> = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.description) updateData.description = updates.description;
      if (updates.icon_url) updateData.icon_url = updates.icon_url;
      if (updates.criteria) updateData.criteria = JSON.stringify(updates.criteria);

      const { data, error } = await supabase
        .from('badges')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedBadge = {
        id: data.id,
        name: data.name,
        description: data.description,
        icon_url: data.icon_url,
        criteria: typeof data.criteria === 'string' ? JSON.parse(data.criteria) : data.criteria
      };

      console.log('Updated badge:', updatedBadge.name);
      return updatedBadge;
    } catch (error) {
      console.error('Error updating badge:', error);
      throw error;
    }
  }

  /**
   * Delete a badge (with safety checks)
   */
  static async deleteBadge(id: string): Promise<void> {
    try {
      // Check if any users have earned this badge
      const { data: userBadges, error: checkError } = await supabase
        .from('user_badges')
        .select('user_id')
        .eq('badge_id', id)
        .limit(1);

      if (checkError) throw checkError;

      if (userBadges && userBadges.length > 0) {
        throw new Error('Cannot delete badge: Users have already earned this badge');
      }

      const { error } = await supabase
        .from('badges')
        .delete()
        .eq('id', id);

      if (error) throw error;

      console.log('Deleted badge:', id);
    } catch (error) {
      console.error('Error deleting badge:', error);
      throw error;
    }
  }

  /**
   * Get count of users who have earned a specific badge
   */
  static async getBadgeUserCount(badgeId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('badge_id', badgeId);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error getting badge user count:', error);
      return 0;
    }
  }

  /**
   * Validate badge data
   */
  private static validateBadgeData(badge: Partial<BadgeDefinition>): void {
    if (badge.name && badge.name.trim().length === 0) {
      throw new Error('Badge name is required');
    }

    if (badge.description && badge.description.trim().length === 0) {
      throw new Error('Badge description is required');
    }

    if (badge.icon_url && badge.icon_url.trim().length === 0) {
      throw new Error('Badge icon is required');
    }

    if (badge.criteria) {
      const { criteria } = badge;
      
      if (!criteria.type) {
        throw new Error('Badge criteria type is required');
      }

      if (typeof criteria.value !== 'number' || criteria.value <= 0) {
        throw new Error('Badge criteria value must be a positive number');
      }

      // Validate specific criteria types
      switch (criteria.type) {
        case 'difficulty_master': {
          if (!criteria.additional?.difficulty || criteria.additional.difficulty.length === 0) {
            throw new Error('Difficulty master badges must specify difficulty levels');
          }
          const validDifficulties = ['Beginner', 'Intermediate', 'Expert'];
          for (const diff of criteria.additional.difficulty) {
            if (!validDifficulties.includes(diff)) {
              throw new Error(`Invalid difficulty: ${diff}. Must be one of: ${validDifficulties.join(', ')}`);
            }
          }
          break;
        }

        case 'streak': {
          if (criteria.additional?.consecutiveDays && criteria.additional.consecutiveDays !== criteria.value) {
            throw new Error('For streak badges, consecutiveDays should match the main value');
          }
          break;
        }

        case 'leaderboard_position': {
          if (criteria.value > 100) {
            throw new Error('Leaderboard position should be reasonable (1-100)');
          }
          break;
        }

        case 'xp_earned': {
          if (criteria.value > 1000000) {
            throw new Error('XP value should be reasonable (max 1,000,000)');
          }
          break;
        }

        case 'challenges_completed':
        case 'expert_challenges': {
          if (criteria.value > 1000) {
            throw new Error('Challenge count should be reasonable (max 1000)');
          }
          break;
        }
      }
    }
  }

  // Private helper methods
  private static async checkBadgeCriteria(badge: BadgeDefinition, progress: UserProgress): Promise<boolean> {
    console.log(`Checking criteria for ${badge.name}:`, badge.criteria, 'against progress:', progress);
    
    switch (badge.criteria.type) {
      case 'first_challenge': {
        const result = progress.totalChallenges >= badge.criteria.value;
        console.log(`First challenge check: ${progress.totalChallenges} >= ${badge.criteria.value} = ${result}`);
        return result;
      }
        
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
