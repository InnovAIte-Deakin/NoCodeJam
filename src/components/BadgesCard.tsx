import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BadgeService } from '@/services/badgeService';
import { useAuth } from '@/contexts/AuthContext';
import type { Badge } from '@/types';

export function BadgesCard() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          const userBadges = await BadgeService.getUserBadges(user.id);
          setBadges(userBadges);
        } catch (error) {
          console.error('Error fetching user badges:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBadges();
  }, [user?.id]);

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
            ? `You've earned ${badges.length} badge${badges.length === 1 ? '' : 's'}!`
            : 'Complete challenges to earn your first badge!'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {badges.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No badges yet</h3>
            <p className="text-muted-foreground">Start completing challenges to earn your first badge!</p>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
}
