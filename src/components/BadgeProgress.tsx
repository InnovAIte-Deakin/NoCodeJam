import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Lock, CheckCircle } from 'lucide-react';
import { BadgeDefinition, BadgeService, UserProgress, BADGE_DEFINITIONS } from '@/services/badgeService';
import { useAuth } from '@/contexts/AuthContext';

interface BadgeProgressProps {
  userId?: string;
  showOnlyAchievable?: boolean;
}

interface BadgeWithProgress extends BadgeDefinition {
  earned: boolean;
  progress: number;
  maxProgress: number;
  progressText: string;
}

export function BadgeProgress({ userId, showOnlyAchievable = false }: BadgeProgressProps) {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  const targetUserId = userId || user?.id;

  useEffect(() => {
    if (!targetUserId) return;

    const fetchBadgeProgress = async () => {
      try {
        setLoading(true);
        const progress = await BadgeService.getUserProgress(targetUserId);
        const userBadges = await BadgeService.getUserBadges(targetUserId);
        
        setUserProgress(progress);

        const badgesWithProgress = BADGE_DEFINITIONS.map(badge => {
          const earned = userBadges.some(ub => ub.id === badge.id);
          const { progress: currentProgress, maxProgress, progressText } = calculateBadgeProgress(badge, progress);

          return {
            ...badge,
            earned,
            progress: currentProgress,
            maxProgress,
            progressText
          };
        });

        // Filter badges if requested
        const filteredBadges = showOnlyAchievable 
          ? badgesWithProgress.filter(b => !b.earned && b.progress > 0)
          : badgesWithProgress;

        setBadges(filteredBadges);
      } catch (error) {
        console.error('Error fetching badge progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBadgeProgress();
  }, [targetUserId, showOnlyAchievable]);

  const calculateBadgeProgress = (badge: BadgeDefinition, progress: UserProgress) => {
    switch (badge.criteria.type) {
      case 'first_challenge':
      case 'challenges_completed':
        return {
          progress: Math.min(progress.totalChallenges, badge.criteria.value),
          maxProgress: badge.criteria.value,
          progressText: `${progress.totalChallenges}/${badge.criteria.value} challenges`
        };

      case 'xp_earned':
        return {
          progress: Math.min(progress.totalXP, badge.criteria.value),
          maxProgress: badge.criteria.value,
          progressText: `${progress.totalXP.toLocaleString()}/${badge.criteria.value.toLocaleString()} XP`
        };

      case 'expert_challenges':
        return {
          progress: Math.min(progress.expertChallenges, badge.criteria.value),
          maxProgress: badge.criteria.value,
          progressText: `${progress.expertChallenges}/${badge.criteria.value} expert challenges`
        };

      case 'difficulty_master':
        const requiredDifficulties = badge.criteria.additional?.difficulty || [];
        const completedDifficulties = requiredDifficulties.filter(diff => 
          (progress.challengesByDifficulty[diff] || 0) > 0
        ).length;
        return {
          progress: completedDifficulties,
          maxProgress: requiredDifficulties.length,
          progressText: `${completedDifficulties}/${requiredDifficulties.length} difficulty levels`
        };

      case 'leaderboard_position':
        const isInTopPosition = progress.leaderboardPosition > 0 && progress.leaderboardPosition <= badge.criteria.value;
        return {
          progress: isInTopPosition ? badge.criteria.value : Math.max(0, badge.criteria.value - progress.leaderboardPosition + 1),
          maxProgress: badge.criteria.value,
          progressText: progress.leaderboardPosition > 0 
            ? `Rank #${progress.leaderboardPosition}` 
            : 'Not ranked yet'
        };

      case 'streak':
        return {
          progress: Math.min(progress.currentStreak, badge.criteria.value),
          maxProgress: badge.criteria.value,
          progressText: `${progress.currentStreak}/${badge.criteria.value} day streak`
        };

      default:
        return {
          progress: 0,
          maxProgress: 1,
          progressText: 'No progress tracked'
        };
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Badge Progress</CardTitle>
          <CardDescription>Loading your achievements...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Badge Progress</CardTitle>
        <CardDescription>
          {showOnlyAchievable 
            ? 'Badges you can earn next' 
            : 'Track your achievements and progress'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {badges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {showOnlyAchievable 
              ? 'No achievable badges at the moment' 
              : 'No badges available'
            }
          </div>
        ) : (
          badges.map((badge) => (
            <TooltipProvider key={badge.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                      badge.earned 
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                        : badge.isSecret 
                          ? 'bg-gray-50 border-gray-200 opacity-60'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div 
                          className={`text-3xl ${
                            badge.earned ? '' : badge.isSecret ? 'filter grayscale' : 'opacity-60'
                          }`}
                        >
                          {badge.isSecret && !badge.earned ? '❓' : badge.icon}
                        </div>
                        {badge.earned && (
                          <CheckCircle className="absolute -top-1 -right-1 w-4 h-4 text-green-600 bg-white rounded-full" />
                        )}
                        {badge.isSecret && !badge.earned && (
                          <Lock className="absolute -top-1 -right-1 w-4 h-4 text-gray-400 bg-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={`font-semibold ${badge.earned ? 'text-gray-900' : 'text-gray-600'}`}>
                            {badge.isSecret && !badge.earned ? '???' : badge.name}
                          </h3>
                          <div className="flex items-center space-x-2">
                            {badge.earned && (
                              <Badge variant="secondary" className="bg-green-100 text-green-800">
                                Earned
                              </Badge>
                            )}
                            {badge.isSecret && (
                              <Badge variant="outline">Secret</Badge>
                            )}
                          </div>
                        </div>

                        <p className={`text-sm mb-3 ${badge.earned ? 'text-gray-700' : 'text-gray-500'}`}>
                          {badge.isSecret && !badge.earned ? 'Complete challenges to unlock this secret badge' : badge.description}
                        </p>

                        {!badge.earned && !badge.isSecret && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">{badge.progressText}</span>
                              <span className="text-gray-500">
                                {Math.round((badge.progress / badge.maxProgress) * 100)}%
                              </span>
                            </div>
                            <Progress 
                              value={(badge.progress / badge.maxProgress) * 100} 
                              className="h-2"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="max-w-xs">
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                    {!badge.earned && !badge.isSecret && (
                      <p className="text-xs text-gray-500 mt-1">
                        Progress: {badge.progressText}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))
        )}
      </CardContent>
    </Card>
  );
}
