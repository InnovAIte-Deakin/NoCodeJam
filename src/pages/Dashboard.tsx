import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { Trophy, Star, ExternalLink, BookOpen, Flame, Mountain, Award, Map, Sparkles } from 'lucide-react';
import { RecommendedChallengeCard } from '@/components/RecommendedChallengeCard';
import { supabase } from '@/lib/supabaseClient';
import {
  getDashboardAnalyticsData,
  type DashboardAnalyticsData,
} from '@/services/analyticsService';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { StartHereOnboarding } from '@/components/StartHereOnboarding';
import type { Challenge } from '@/types';

type RecommendedChallenge = Challenge & { score?: number; reason?: string };

export function Dashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardAnalyticsData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedChallenge[]>([]);
  const [starterChallenge, setStarterChallenge] = useState<{ id: string; title: string } | null>(null);
  const [startHereSkipped, setStartHereSkipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [recsLoading, setRecsLoading] = useState(false);

  // const xpChartData = [{ day: "Mon", xp: 20 }, { day: "Tue", xp: 35 }, { day: "Wed", xp: 28 }, { day: "Thu", xp: 50 }, { day: "Fri", xp: 45 }, { day: "Sat", xp: 15 }, { day: "Sun", xp: 32 }];

  useEffect(() => {
    if (!user) {
      setStartHereSkipped(false);
      return;
    }

    setStartHereSkipped(localStorage.getItem(`nocodejam-start-here-skipped-${user.id}`) === 'true');
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (!user) {
        setDashboardData(null);
        setRecommendations([]);
        setStarterChallenge(null);
        setLoading(false);
        return;
      }

      try {
        const data = await getDashboardAnalyticsData(user.id);
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard analytics:', error);
        toast({
          title: 'Failed to load dashboard',
          description: error instanceof Error ? error.message : 'Unable to load dashboard analytics.',
          variant: 'destructive',
        });
        setDashboardData({
          summary: {
            current_xp: user.xp,
            xp_progress_percent: (user.xp % 1000) / 10,
            xp_to_next_milestone: Math.max(1000 - (user.xp % 1000), 0),
            completed_challenges: 0,
            badge_count: user.badges.length,
            learning_streak: 0,
          },
          recent_submissions: [],
          pathways: [],
        });
      }

      // Fetch recommendations
      try {
        setRecsLoading(true);
        console.log('Calling get-recommendations for user:', user.id);

        const { data, error } = await supabase.functions.invoke('get-recommendations');

        if (error) {
          console.error('Failed to fetch recommendations:', error);
          setRecommendations([]);
        } else {
          console.log('Recommendations response:', data);
          setRecommendations((data?.recommendations || []) as RecommendedChallenge[]);
        }
      } catch (error) {
        console.error('Unexpected recommendation error:', error);
        setRecommendations([]);
      } finally {
        setRecsLoading(false);
      }

      // Fetch one beginner-friendly challenge for the guided flow
      try {
        const { data, error } = await supabase
          .from('challenges')
          .select('id, title')
          .eq('difficulty', 'Beginner')
          .neq('challenge_type', 'onboarding')
          .order('created_at', { ascending: true })
          .limit(1);

        if (error) {
          console.error('Failed to fetch starter challenge:', error);
          setStarterChallenge(null);
        } else {
          setStarterChallenge(data?.[0] ?? null);
        }
      } catch (error) {
        console.error('Unexpected starter challenge error:', error);
        setStarterChallenge(null);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  if (!user) return null;
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Loading dashboard...</div>;
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
  const showStartHere = (summary.current_xp === 0 || summary.completed_challenges === 0) && !startHereSkipped;
  // const showStartHere = !startHereSkipped;

  const xpChartData = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => ({
    day,
    xp: 0,
  }));

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  recentSubmissions.forEach((submission) => {
    if (!submission.submitted_at) return;

    const submissionDate = new Date(submission.submitted_at);

    if (submissionDate < oneWeekAgo) return;

    const day = submissionDate.toLocaleDateString("en-US", { weekday: "short" });

    const item = xpChartData.find((d) => d.day === day);

    if (item && submission.status === "approved") {
      item.xp += Number(submission.challenge_xp);
    }
  });

  const learningStreak = summary.learning_streak;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="container-responsive py-6 sm:py-8">
        {/* Welcome Header */}
        <header id="dashboard-welcome" className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome back, {user.username}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-300">
            Ready to take on some new challenges today?
          </p>
        </header>

        {showStartHere && (
          <StartHereOnboarding
            starterChallenge={starterChallenge}
            onSkip={() => {
              localStorage.setItem(`nocodejam-start-here-skipped-${user.id}`, 'true');
              setStartHereSkipped(true);
            }}
          />
        )}

        <Card className="bg-gray-800 border-gray-700 mb-6 sm:mb-8">
          <CardContent className="p-5 sm:p-6">
            <div className="space-y-5">
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold text-white">
                  Explore Learning Content
                </h2>
                <p className="text-sm sm:text-base text-gray-400 mt-1">
                  Browse featured pathways, trending challenges, and newly added learning materials.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Featured Pathways */}
                <Link to="/pathways" className="block">
                  <div className="rounded-xl p-5 bg-gradient-to-br from-blue-900/40 to-purple-900/30 border border-gray-700 transition-all duration-200 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20 hover:-translate-y-1 cursor-pointer">
                    <div className="bg-blue-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                      <Map className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Featured Pathways</h3>
                    <p className="text-sm text-gray-300">
                      Explore curated learning journeys designed to level up your skills.
                    </p>
                  </div>
                </Link>
                {/* Top Challenges */}
                <Link to="/challenges" className="block">
                  <div className="rounded-xl p-5 bg-gradient-to-br from-purple-900/40 to-pink-900/30 border border-gray-700 transition-all duration-200 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 hover:-translate-y-1 cursor-pointer">
                    <div className="bg-purple-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                      <Trophy className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Top Challenges</h3>
                    <p className="text-sm text-gray-300">
                      Tackle the most popular coding challenges and compete with peers.
                    </p>
                  </div>
                </Link>
                {/* New Content */}
                <Link to="/learn" className="block">
                  <div className="rounded-xl p-5 bg-gradient-to-br from-cyan-900/40 to-blue-900/30 border border-gray-700 transition-all duration-200 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 cursor-pointer">
                    <div className="bg-cyan-500/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">New Content</h3>
                    <p className="text-sm text-gray-300">
                      Discover the latest learning materials and courses added this week.
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Stats & Progress */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* XP and Level Progress */}
            <Card id="xp-card" className="card-gradient-bar bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl text-white">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>Your Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-300">Current XP</span>
                    <span className="text-xl sm:text-2xl font-bold text-purple-400">{summary.current_xp}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-300 mb-2">
                      <span>Progress to next milestone</span>
                      <span>{summary.xp_to_next_milestone} XP remaining</span>
                    </div>
                    <Progress value={summary.xp_progress_percent} className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-pink-500" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4">
                    <div className="p-3 sm:p-4 card-contrast rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-900/30 p-2 rounded-lg">
                          <Mountain className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-300">Challenges Completed</div>
                          <div className="text-xl sm:text-2xl font-bold text-purple-400">{summary.completed_challenges}</div>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 sm:p-4 card-contrast rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-900/30 p-2 rounded-lg">
                          <Award className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm text-gray-300">Badges Earned</div>
                          <div className="text-xl sm:text-2xl font-bold text-orange-400">{summary.badge_count}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">XP Earned This Week</CardTitle>
                <CardDescription className="text-gray-300">
                  XP earned from approved challenge submissions in the last 7 days
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={xpChartData}>
                      <XAxis dataKey="day" stroke="#ccc" />
                      <YAxis stroke="#ccc" />
                      <Tooltip />
                      <Bar dataKey="xp" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Recommended for You */}
            <Card className="bg-slate-900 border border-slate-700">
              <CardHeader className="pb-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1 whitespace-nowrap">
                      <Sparkles className="h-5 w-5 shrink-0 text-yellow-400" />
                      <span className="text-xl sm:text-2xl font-bold leading-none text-white">
                        Recommended for You
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 max-w-2xl">
                      Based on your recent progress and completed challenges.
                    </p>
                  </div>

                  <div className="flex justify-start sm:justify-end">
                    <Badge className="bg-emerald-100 text-emerald-800">
                      Personalized
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {recsLoading ? (
                  <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-950/50 p-6 text-center text-sm text-slate-300">
                    Finding the best challenges for you...
                  </div>
                ) : recommendations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {recommendations.map((challenge) => (
                      <RecommendedChallengeCard key={challenge.id} challenge={challenge} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-950/50 p-6 text-center space-y-3">
                    <h3 className="text-sm font-medium text-white">No personalized picks just yet</h3>
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

            {/* Recent Submissions */}
            <Card id="recent-submissions-card" className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-white">Recent Submissions</CardTitle>
                <CardDescription className="text-gray-300">
                  Your latest challenge submissions and their status
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {recentSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {recentSubmissions.slice(0, 3).map((submission) => {
                      return (
                        <div key={submission.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-700 rounded-lg space-y-2 sm:space-y-0">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm sm:text-base text-white">{submission.challenge_title}</h4>
                            <p className="text-xs sm:text-sm text-gray-300">
                              Submitted {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : ''}
                            </p>
                            {submission.admin_feedback && (
                              <p className="text-xs sm:text-sm text-gray-400 mt-1">{submission.admin_feedback}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 sm:space-x-3 self-start sm:self-center">
                            <Badge
                              variant={submission.status === 'approved' ? 'default' :
                                submission.status === 'pending' ? 'secondary' : 'destructive'}
                              className="text-xs"
                            >
                              {submission.status}
                            </Badge>
                            {submission.submission_url && (
                              <Button variant="ghost" size="sm" asChild>
                                <a href={submission.submission_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">No submissions yet</p>
                    <Button asChild>
                      <Link to="/challenges">Start Your First Challenge</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl text-white">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <span>Pathway Progress</span>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Your active learning pathways and completion progress
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {pathways.length > 0 ? (
                  <div className="space-y-4">
                    {pathways.map((pathway) => (
                      <div key={pathway.pathway_id} className="rounded-lg bg-gray-700 p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-medium text-sm sm:text-base text-white">{pathway.pathway_title}</h4>
                            <p className="text-xs sm:text-sm text-gray-300">
                              {pathway.completed_challenges}/{pathway.total_challenges} challenges completed
                            </p>
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-cyan-300">
                            {pathway.total_xp} XP
                          </span>
                        </div>
                        <Progress value={pathway.progress_percent} className="mb-2 h-3" />
                        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-300">
                          <span>{pathway.progress_percent}% complete</span>
                          <span className="capitalize">{pathway.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 sm:py-8">
                    <BookOpen className="mx-auto mb-3 h-10 w-10 text-gray-400 sm:h-12 sm:w-12" />
                    <p className="text-sm sm:text-base text-gray-300 mb-3 sm:mb-4">No pathways in progress yet</p>
                    <Button asChild>
                      <Link to="/pathways">Browse Pathways</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile & Badges */}
          <div className="space-y-4 sm:space-y-6">
            {/* Profile Card */}
            <Card id="dashboard-profile-card" className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl text-white">Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-purple-500">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback className="text-lg sm:text-xl">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <h3 className="font-bold text-lg sm:text-xl text-white">
                        {user.username}
                      </h3>
                      <p className="text-sm sm:text-base text-gray-300">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm text-gray-400">

                    <div className="flex items-center justify-between">
                      <span>Joined since</span>
                      <span className="text-white">
                        {user.joinedAt.toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span>Learning streak</span>
                      <div className="flex items-center gap-1 text-white">
                        <span>{learningStreak} days</span>
                        <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
                      </div>
                    </div>

                  </div>
                  <div className="pt-3">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/profile">Edit Profile</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card id="dashboard-badges-card" className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-white">Badges</CardTitle>
                <CardDescription className="text-gray-300">
                  Your achievements and milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {user.badges.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {user.badges.map((badge) => (
                      <div key={badge.id} className="text-center p-2 sm:p-3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{badge.icon}</div>
                        <div className="font-medium text-xs sm:text-sm text-gray-900">{badge.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{badge.description}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 sm:py-6">
                    <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-gray-300">No badges yet</p>
                    <p className="text-xs text-gray-400 mt-1">Complete challenges to earn your first badge!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
