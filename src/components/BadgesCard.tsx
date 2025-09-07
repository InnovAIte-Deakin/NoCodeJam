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
      <Card>
        <CardHeader>
          <CardTitle>Your Badges</CardTitle>
          <CardDescription>Loading your achievements...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🏆</span>
          Your Badges
        </CardTitle>
        <CardDescription>
          {badges.length > 0 
            ? `You've earned ${badges.length} of ${BADGE_DEFINITIONS.length} badges!`
            : `Earn badges by completing challenges! ${BADGE_DEFINITIONS.length} badges available.`
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Earned Badges Section */}
          {badges.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <span>🏆</span>
                Earned Badges ({badges.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-card border border-border rounded-lg p-4 hover:shadow-md hover:border-primary/50 transition-all duration-200 group"
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{badge.icon}</div>
                      <h4 className="font-semibold text-foreground text-sm mb-1">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                      <p className="text-xs text-primary">
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
              <h3 className="text-lg font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <span>🔒</span>
                Locked Badges ({lockedBadges.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {lockedBadges.map((badgeDef) => (
                  <div
                    key={badgeDef.id}
                    className="bg-muted/50 border border-muted rounded-lg p-4 opacity-60 hover:opacity-80 transition-opacity duration-200 relative"
                    title={`Complete to unlock: ${badgeDef.description}`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2 grayscale">{badgeDef.icon_url}</div>
                      <h4 className="font-semibold text-muted-foreground text-sm mb-1">{badgeDef.name}</h4>
                      <p className="text-xs text-muted-foreground/80 mb-2">{badgeDef.description}</p>
                      <div className="flex items-center justify-center">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-muted text-muted-foreground">
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
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No badges available</h3>
              <p className="text-muted-foreground">Badge system is being set up!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
