import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeService, BADGE_DEFINITIONS } from '@/services/badgeService';
import type { Badge } from '@/types';

interface BadgesCardProps {
  userId: string;
}

export function BadgesCard({ userId }: BadgesCardProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate locked badges (badges user hasn't earned yet)
  const earnedBadgeIds = badges.map(badge => badge.id);
  const lockedBadges = BADGE_DEFINITIONS.filter(badgeDef => !earnedBadgeIds.includes(badgeDef.id));

  useEffect(() => {
    const fetchBadges = async () => {
      if (userId) {
        try {
          setLoading(true);
          const userBadges = await BadgeService.getUserBadges(userId);
          setBadges(userBadges);
        } catch (error) {
          console.error('Error fetching user badges:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBadges();
  }, [userId]);

  if (loading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <span>🏆</span>
            Your Badges
          </CardTitle>
          <CardDescription className="text-gray-300">Loading your achievements...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 rounded-lg bg-gray-700/50"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <span>🏆</span>
          Your Badges
        </CardTitle>
        <CardDescription className="text-gray-300">
          {badges.length > 0
            ? `You've earned ${badges.length} of ${BADGE_DEFINITIONS.length} badges!`
            : `Earn badges by completing challenges! ${BADGE_DEFINITIONS.length} badges available.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Earned Badges Section */}
          {badges.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-200 flex items-center gap-2 tracking-tight">
                  <span>🏆</span>
                  Earned Badges ({badges.length})
                </h3>
                <span className="text-xs text-gray-400">Showing all earned</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="relative rounded-lg p-4 bg-gray-900/70 border border-gray-700 hover:border-gray-500 hover:bg-gray-900 shadow-sm transition-colors group"
                  >
                    <div className="text-center flex flex-col h-full">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200 drop-shadow-sm">{badge.icon}</div>
                      <h4 className="font-medium text-gray-100 text-sm mb-1 line-clamp-1">{badge.name}</h4>
                      <p className="text-[11px] text-gray-400 mb-3 line-clamp-2 flex-1">{badge.description}</p>
                      <p className="text-[10px] uppercase tracking-wide font-medium text-indigo-300/80 mt-auto">
                        Earned {new Date(badge.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locked Badges Section */}
          {lockedBadges.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-gray-400 flex items-center gap-2">
                  <span>🔒</span>
                  Locked Badges ({lockedBadges.length})
                </h3>
                <span className="text-xs text-gray-500">Keep going!</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {lockedBadges.map((badgeDef) => (
                  <div
                    key={badgeDef.id}
                    className="relative rounded-lg p-4 bg-gray-800/40 border border-gray-700/60 hover:border-gray-600 transition-colors opacity-60 hover:opacity-80"
                    title={`Complete to unlock: ${badgeDef.description}`}
                  >
                    <div className="text-center flex flex-col h-full">
                      <div className="text-3xl mb-2 grayscale">{badgeDef.icon_url}</div>
                      <h4 className="font-medium text-gray-400 text-sm mb-1 line-clamp-1">{badgeDef.name}</h4>
                      <p className="text-[11px] text-gray-500 mb-3 line-clamp-2 flex-1">{badgeDef.description}</p>
                      <div className="flex items-center justify-center mt-auto">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-700/60 text-gray-300 border border-gray-600/70">
                          🔒 Locked
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State - only show when no badges at all */}
          {badges.length === 0 && lockedBadges.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 drop-shadow">🎯</div>
              <h3 className="text-lg font-semibold text-gray-100 mb-2">No badges available</h3>
              <p className="text-gray-400">Badge system is being set up!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
