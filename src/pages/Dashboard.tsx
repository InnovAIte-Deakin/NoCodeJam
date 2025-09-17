import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Trophy, Star, Calendar, ExternalLink, Github } from 'lucide-react';
import { BadgeService } from '@/services/badgeService';
import type { Badge as BadgeType } from '@/types';

export function Dashboard() {
  const { user } = useAuth();
  interface SubmissionRow { id: string; challenge_id: string; status: string; submitted_at?: string; admin_feedback?: string; submission_url: string; }
  interface ChallengeRow { id: string; title: string; }
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [userBadges, setUserBadges] = useState<BadgeType[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgesError, setBadgesError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (user) {
        const { data: submissionsData } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', user.id);
        setSubmissions(submissionsData || []);
      } else {
        setSubmissions([]);
      }
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*');
      setChallenges(challengesData || []);
      setLoading(false);
    };
    fetchData();
  }, [user]);

  // Fetch badges separately so they can be refreshed individually
  useEffect(() => {
    const fetchBadges = async () => {
      if (!user?.id) return;
      try {
        setBadgesLoading(true);
        setBadgesError(null);
        const badges = await BadgeService.getUserBadges(user.id);
        setUserBadges(badges);
      } catch (e) {
        console.error('Error loading badges:', e);
        setBadgesError('Failed to load badges');
      } finally {
        setBadgesLoading(false);
      }
    };
    fetchBadges();
  }, [user?.id]);

  const refreshBadges = async () => {
    if (!user?.id) return;
    try {
      setBadgesLoading(true);
      setBadgesError(null);
      // Re-evaluate user badges (awards any missed ones)
      await BadgeService.processUserBadges(user.id);
      const badges = await BadgeService.getUserBadges(user.id);
      setUserBadges(badges);
    } catch (e) {
      console.error('Error refreshing badges:', e);
      setBadgesError('Failed to refresh badges');
    } finally {
      setBadgesLoading(false);
    }
  };

  if (!user) return null;
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Loading dashboard...</div>;
  }

  const completedChallenges = submissions.filter(s => s.status === 'approved').length;
  const nextLevelXP = Math.ceil(user.xp / 1000) * 1000;
  const progressToNextLevel = (user.xp % 1000) / 10;

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Stats & Progress */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* XP and Level Progress */}
            <Card className="card-gradient-bar bg-gray-800 border-gray-700">
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
                    <span className="text-xl sm:text-2xl font-bold text-purple-400">{user.xp}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-300 mb-2">
                      <span>Progress to next milestone</span>
                      <span>{nextLevelXP - user.xp} XP remaining</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-3" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4">
                    <div className="text-center p-3 sm:p-4 card-contrast rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-purple-400">{completedChallenges}</div>
                      <div className="text-xs sm:text-sm text-gray-300">Challenges Completed</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 card-contrast rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-orange-400">{userBadges.length}</div>
                      <div className="text-xs sm:text-sm text-gray-300">Badges Earned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl text-white">Recent Submissions</CardTitle>
                <CardDescription className="text-gray-300">
                  Your latest challenge submissions and their status
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.slice(0, 3).map((submission) => {
                      const challenge = challenges.find((c) => c.id === submission.challenge_id);
                      return (
                        <div key={submission.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-700 rounded-lg space-y-2 sm:space-y-0">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm sm:text-base text-white">{challenge?.title}</h4>
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
                            <Button variant="ghost" size="sm" asChild>
                              <a href={submission.submission_url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
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
          </div>

          {/* Right Column - Profile & Badges */}
          <div className="space-y-4 sm:space-y-6">
            {/* Profile Card */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg sm:text-xl text-white">Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="text-lg sm:text-xl">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-bold text-base sm:text-lg text-white">{user.username}</h3>
                    <p className="text-sm sm:text-base text-gray-300">{user.email}</p>
                    {user.bio && (
                      <p className="text-xs sm:text-sm text-gray-400 mt-1">{user.bio}</p>
                    )}
                    {user.githubUsername && (
                      <div className="flex items-center justify-center space-x-1 mt-1 text-xs sm:text-sm text-gray-300">
                        <Github className="w-4 h-4" />
                        <span>{user.githubUsername}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {user.joinedAt.toLocaleDateString()}</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/profile">Edit Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 space-x-4">
                <div>
                  <CardTitle className="text-lg sm:text-xl text-white">Badges</CardTitle>
                  <CardDescription className="text-gray-300">
                    Your achievements and milestones
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={refreshBadges} disabled={badgesLoading}>
                  {badgesLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {badgesError && (
                  <div className="mb-3 text-xs text-red-400">{badgesError}</div>
                )}
                {badgesLoading && userBadges.length === 0 ? (
                  <div className="text-center py-4 sm:py-6 text-gray-400 text-sm">Loading badges...</div>
                ) : userBadges.length > 0 ? (
                  <div className="grid grid-cols-2 gap-1 sm:gap-4">
                    {userBadges.slice(0, 6).map((badge) => (
                      <div
                        key={badge.id}
                        className="relative p-3 sm:p-4 rounded-xl bg-gray-900/70 border border-gray-700 hover:border-gray-500 transition-colors shadow-sm flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-2xl sm:text-3xl leading-none select-none">{badge.icon}</span>
                        </div>
                        <h4 className="font-semibold text-sm sm:text-base text-white mb-1 line-clamp-1">{badge.name}</h4>
                        <p className="text-xs text-gray-400 line-clamp-2 flex-1">{badge.description}</p>
                        <div className="mt-2 text-[10px] text-gray-500">Earned {badge.unlockedAt?.toLocaleDateString?.() || ''}</div>
                      </div>
                    ))}
                    {userBadges.length > 6 && (
                      <div className="col-span-full text-center text-xs text-gray-400">+{userBadges.length - 6} more — view all on your profile</div>
                    )}
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