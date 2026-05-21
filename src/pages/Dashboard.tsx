import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

import {
  Trophy,
  Star,
  Calendar,
  ExternalLink,
  Github,
  BookOpen,
  Sparkles,
} from 'lucide-react';

import {
  getDashboardAnalyticsData,
  type DashboardAnalyticsData,
} from '@/services/analyticsService';

import { RecommendedChallengeCard } from '@/components/RecommendedChallengeCard';
import { supabase } from '@/lib/supabaseClient';

export function Dashboard() {
  const { user } = useAuth();

  const [dashboardData, setDashboardData] =
    useState<DashboardAnalyticsData | null>(null);

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      if (!user) {
        setDashboardData(null);
        setSubmissions([]);
        setRecommendations([]);
        setLoading(false);
        return;
      }

      try {
        // Dashboard analytics
        const data = await getDashboardAnalyticsData(user.id);
        setDashboardData(data);

        // Submissions
        const { data: submissionsData } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', user.id);

        setSubmissions(submissionsData || []);

        // Recommendations
        try {
          setRecsLoading(true);

          const { data, error } =
            await supabase.functions.invoke('get-recommendations');

          if (error) {
            console.error('Failed to fetch recommendations:', error);
            setRecommendations([]);
          } else {
            setRecommendations(data?.recommendations || []);
          }
        } catch (error) {
          console.error('Unexpected recommendation error:', error);
          setRecommendations([]);
        } finally {
          setRecsLoading(false);
        }
      } catch (error) {
        console.error('Error loading dashboard analytics:', error);

        toast({
          title: 'Failed to load dashboard',
          description:
            error instanceof Error
              ? error.message
              : 'Unable to load dashboard analytics.',
          variant: 'destructive',
        });

        setDashboardData({
          summary: {
            current_xp: user.xp,
            xp_progress_percent: (user.xp % 1000) / 10,
            xp_to_next_milestone: Math.max(
              1000 - (user.xp % 1000),
              0
            ),
            completed_challenges: 0,
            badge_count: user.badges.length,
            learning_streak: 0,
          },
          recent_submissions: [],
          pathways: [],
        });
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  const summary = dashboardData?.summary ?? {
    current_xp: user.xp,
    xp_progress_percent: (user.xp % 1000) / 10,
    xp_to_next_milestone: Math.max(1000 - (user.xp % 1000), 0),
    completed_challenges: 0,
    badge_count: user.badges.length,
    learning_streak: 0,
  };

  const recentSubmissions = dashboardData?.recent_submissions ?? [];
  const pathways = dashboardData?.pathways ?? [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container-responsive py-6 sm:py-8">

        {/* Welcome Header */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome back, {user.username}! 👋
          </h1>

          <p className="text-sm sm:text-base text-gray-300">
            Ready to take on some new challenges today?
          </p>
        </header>

        {/* Recommended Section */}
        <Card className="bg-slate-900 border border-slate-700 mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-400" />

              <span className="text-xl sm:text-2xl font-bold text-white">
                Recommended for You
              </span>
            </div>

            <p className="text-sm text-gray-400">
              Based on your recent progress and completed challenges.
            </p>
          </CardHeader>

          <CardContent className="p-4 sm:p-6">
            {recsLoading ? (
              <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-950/50 p-6 text-center text-sm text-slate-300">
                Finding the best challenges for you...
              </div>
            ) : recommendations.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendations.map((challenge) => (
                  <RecommendedChallengeCard
                    key={challenge.id}
                    challenge={challenge}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-950/50 p-6 text-center space-y-3">
                <h3 className="text-sm font-medium text-white">
                  No personalized picks just yet
                </h3>

                <p className="text-sm text-gray-300">
                  Explore a few more challenges and we’ll suggest better matches here.
                </p>

                <Button asChild>
                  <Link to="/challenges">Browse challenges</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </main>
  );
}