import { BadgeService } from './badgeService';

/**
 * Utility functions for badge management that can be called from browser console
 * 
 * Usage in browser console:
 * - window.badgeUtils.processAllUsers()
 * - window.badgeUtils.processUser('user-id')
 * - window.badgeUtils.getUserBadges('user-id')
 */

class BadgeUtils {
  /**
   * Process all users and award badges based on their current progress
   */
  static async processAllUsers() {
    console.log('🏆 Starting badge processing for all users...');
    try {
      const results = await BadgeService.processAllUsers();
      console.log('✅ Badge processing complete!');
      console.table(results.map(r => ({
        userId: r.userId,
        newBadges: r.newBadges.length,
        badgeNames: r.newBadges.map(b => b.name).join(', ')
      })));
      return results;
    } catch (error) {
      console.error('❌ Error processing badges:', error);
      throw error;
    }
  }

  /**
   * Process badges for a specific user
   */
  static async processUser(userId: string) {
    console.log(`🏆 Processing badges for user: ${userId}`);
    try {
      const newBadges = await BadgeService.processUserBadges(userId);
      console.log(`✅ Processing complete! Awarded ${newBadges.length} badges:`, newBadges.map(b => b.name));
      return newBadges;
    } catch (error) {
      console.error('❌ Error processing user badges:', error);
      throw error;
    }
  }

  /**
   * Get all badges for a specific user
   */
  static async getUserBadges(userId: string) {
    console.log(`🏆 Fetching badges for user: ${userId}`);
    try {
      const badges = await BadgeService.getUserBadges(userId);
      console.log(`✅ Found ${badges.length} badges:`, badges.map(b => b.name));
      console.table(badges.map(b => ({
        name: b.name,
        icon: b.icon,
        description: b.description,
        earnedAt: b.unlockedAt.toLocaleDateString()
      })));
      return badges;
    } catch (error) {
      console.error('❌ Error fetching user badges:', error);
      throw error;
    }
  }

  /**
   * Get user progress statistics
   */
  static async getUserProgress(userId: string) {
    console.log(`📊 Fetching progress for user: ${userId}`);
    try {
      const progress = await BadgeService.getUserProgress(userId);
      console.log('✅ User progress:', progress);
      console.table([progress]);
      return progress;
    } catch (error) {
      console.error('❌ Error fetching user progress:', error);
      throw error;
    }
  }

  /**
   * Show help information
   */
  static help() {
    console.log(`
🏆 Badge Management Utilities

Available functions:
- badgeUtils.processAllUsers()           - Process all users and award badges
- badgeUtils.processUser(userId)         - Process a specific user
- badgeUtils.getUserBadges(userId)       - Get badges for a user
- badgeUtils.getUserProgress(userId)     - Get progress stats for a user
- badgeUtils.help()                      - Show this help

Examples:
badgeUtils.processAllUsers()
badgeUtils.processUser('123e4567-e89b-12d3-a456-426614174000')
badgeUtils.getUserBadges('123e4567-e89b-12d3-a456-426614174000')
    `);
  }
}

// Make available globally for console access
if (typeof window !== 'undefined') {
  (window as any).badgeUtils = BadgeUtils;
}

export { BadgeUtils };
