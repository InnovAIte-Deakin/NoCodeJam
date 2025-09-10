import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Medal, Award, Crown, Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Link } from 'react-router-dom';

interface LeaderboardUser {
  id: string;
  username: string;
  avatar?: string;
  total_xp: number;
  challengeCount: number;
  badgeCount: number;
  rankChange?: number;
}

export function LeaderboardPage() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [previousLeaderboard, setPreviousLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboardData = async (): Promise<LeaderboardUser[]> => {
    // Fetch users with XP
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, avatar, total_xp')
      .order('total_xp', { ascending: false });

    if (usersError || !users) return [];

    // Get challenge counts for each user
    const usersWithChallenges = await Promise.all(
      users.map(async (user) => {
        const { count: challengeCount } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'approved');

        // Get badge counts for each user
        const { count: badgeCount } = await supabase
          .from('user_badges')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        return {
          ...user,
          challengeCount: challengeCount || 0,
          badgeCount: badgeCount || 0,
          rankChange: 0 // Will calculate this below
        };
      })
    );

    return usersWithChallenges;
  };

  const calculateRankChanges = (current: LeaderboardUser[], previous: LeaderboardUser[]): LeaderboardUser[] => {
    return current.map((user, index) => {
      const currentRank = index + 1;
      const previousRank = previous.findIndex(prev => prev.id === user.id) + 1;
      const rankChange = previousRank === 0 ? 0 : previousRank - currentRank;
      return { ...user, rankChange };
    });
  };

  useEffect(() => {
    const fetchAndSetLeaderboard = async () => {
      setLoading(true);
      const data = await fetchLeaderboardData();
      if (data.length > 0) {
        const dataWithChanges = calculateRankChanges(data, previousLeaderboard);
        setPreviousLeaderboard(leaderboard);
        setLeaderboard(dataWithChanges);
      }
      setLoading(false);
    };

    fetchAndSetLeaderboard();

    // Set up real-time subscription for leaderboard updates
    const subscription = supabase
      .channel('leaderboard-updates')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: 'total_xp=neq.0' // Only listen for XP changes
      }, () => {
        fetchAndSetLeaderboard(); // Refresh leaderboard when XP changes
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'submissions',
        filter: 'status=eq.approved'
      }, () => {
        fetchAndSetLeaderboard(); // Refresh when submissions are approved
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'user_badges'
      }, () => {
        fetchAndSetLeaderboard(); // Refresh when badges are earned
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Find current user's rank and data
  const currentUserIndex = leaderboard.findIndex(u => u.id === user?.id);
  const currentUserRank = currentUserIndex + 1;
  const currentUserData = currentUserIndex >= 0 ? leaderboard[currentUserIndex] : null;

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return (
        <div className="relative">
          <Crown className="w-10 h-10 text-yellow-500 drop-shadow-2xl" />
          <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full opacity-30 animate-pulse"></div>
        </div>
      );
      case 2: return (
        <div className="relative">
          <Medal className="w-9 h-9 text-slate-500 drop-shadow-xl" />
          <div className="absolute inset-0 w-9 h-9 bg-gradient-to-br from-slate-400 to-gray-600 rounded-full opacity-15"></div>
        </div>
      );
      case 3: return (
        <div className="relative">
          <Award className="w-8 h-8 text-orange-600 drop-shadow-lg" />
          <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-600 rounded-full opacity-15"></div>
        </div>
      );
      default: return <div className="w-8 h-8 flex items-center justify-center text-lg font-bold text-gray-500 bg-gray-100 rounded-full">#{position}</div>;
    }
  };

  const getRankChangeIcon = (change: number, isTopThree: boolean = false, isFirstPlace: boolean = false) => {
    if (change > 0) return <TrendingUp className={`w-4 h-4 ${isFirstPlace ? 'text-purple-300' : isTopThree ? 'text-white' : 'text-green-500'}`} />;
    if (change < 0) return <TrendingDown className={`w-4 h-4 ${isFirstPlace ? 'text-purple-300' : isTopThree ? 'text-white' : 'text-red-500'}`} />;
    return <Minus className={`w-4 h-4 ${isFirstPlace ? 'text-purple-200' : isTopThree ? 'text-white/70' : 'text-gray-400'}`} />;
  };

  const getAvatarSize = (position: number) => {
    switch (position) {
      case 1: return "w-16 h-16";
      case 2: return "w-14 h-14";
      case 3: return "w-12 h-12";
      default: return "w-12 h-12";
    }
  };

  const getRankStyle = (position: number, isCurrentUser: boolean) => {
    // Start with base styling that explicitly removes any default background
    let baseStyle = "flex items-center space-x-4 p-6 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden bg-transparent";

    if (isCurrentUser) {
      baseStyle += " bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 shadow-lg ring-2 ring-purple-200";
    } else if (position === 1) {
      // 1st Place - Ultimate Champion Gold Card with Epic Effects - Force override with !important
      baseStyle += " !bg-gradient-to-br !from-yellow-400/40 !via-amber-500/50 !via-orange-500/45 !via-yellow-500/35 !to-amber-600/40 backdrop-blur-xl border-2 border-yellow-300/70 shadow-2xl ring-4 ring-yellow-400/60 before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-200/15 before:via-white/25 before:via-amber-100/20 before:to-yellow-300/15 before:animate-pulse after:absolute after:inset-0 after:bg-gradient-to-br after:from-transparent after:via-yellow-300/5 after:to-amber-400/10 after:animate-pulse after:delay-1000";
    } else if (position === 2) {
      // 2nd Place - Metallic silver with iridescent effect
      baseStyle += " bg-gradient-to-br from-slate-400/30 via-gray-500/40 to-zinc-600/30 backdrop-blur-lg border border-white/30 shadow-xl ring-3 ring-slate-300/40 before:absolute before:inset-0 before:bg-gradient-to-r before:from-slate-300/20 before:via-white/30 before:to-slate-400/20";
    } else if (position === 3) {
      // 3rd Place - Warm metallic bronze with glow
      baseStyle += " bg-gradient-to-br from-amber-500/25 via-orange-500/35 to-red-600/25 backdrop-blur-lg border border-white/25 shadow-lg ring-2 ring-amber-400/40 before:absolute before:inset-0 before:bg-gradient-to-r before:from-amber-400/20 before:via-orange-300/30 before:to-red-400/20";
    } else {
      baseStyle += " bg-white border border-gray-200 hover:bg-gray-50 hover:shadow-md";
    }
    return baseStyle;
  };

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Dynamic animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Large gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-yellow-300/15 via-orange-300/20 to-red-400/15 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-300/20 via-pink-300/15 to-rose-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-to-r from-cyan-300/10 via-blue-300/15 to-indigo-400/10 rounded-full blur-2xl animate-bounce delay-500"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-to-l from-emerald-300/12 via-teal-300/15 to-cyan-400/12 rounded-full blur-2xl animate-pulse delay-2000"></div>

        {/* Floating geometric shapes */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-violet-400/20 to-purple-500/20 rotate-45 animate-float"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-gradient-to-tl from-amber-400/25 to-yellow-500/25 rounded-full animate-float-delayed"></div>
        <div className="absolute bottom-32 left-1/3 w-28 h-28 bg-gradient-to-r from-rose-400/20 to-pink-500/20 rounded-lg rotate-12 animate-float-slow"></div>
        <div className="absolute top-2/3 left-10 w-20 h-20 bg-gradient-to-b from-blue-400/25 to-cyan-500/25 rounded-full animate-float-reverse"></div>
        <div className="absolute bottom-20 right-1/3 w-36 h-36 bg-gradient-to-bl from-indigo-400/15 to-purple-500/15 rounded-full animate-float-long"></div>

        {/* Particle-like effects */}
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-yellow-400/60 rounded-full animate-ping delay-300"></div>
        <div className="absolute top-1/4 right-1/3 w-1.5 h-1.5 bg-orange-400/70 rounded-full animate-ping delay-700"></div>
        <div className="absolute bottom-1/3 left-1/5 w-2.5 h-2.5 bg-pink-400/60 rounded-full animate-ping delay-1000"></div>
        <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-purple-400/80 rounded-full animate-ping delay-500"></div>
        <div className="absolute bottom-1/4 right-1/5 w-2 h-2 bg-cyan-400/70 rounded-full animate-ping delay-1200"></div>

        {/* Subtle mesh overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,215,0,0.05),transparent_50%)]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-300">
            See how you rank against other no-code developers in the community
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-lg text-gray-400">Loading leaderboard...</div>
        ) : (
          <>
            {/* Current User Rank (if not in top 10) */}
            {user && currentUserRank > 10 && (
              <Card className="mb-6 border-purple-500 shadow-lg bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-purple-600" />
                    <span>Your Rank</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-14 h-14 bg-purple-100 rounded-full shadow-md">
                      <span className="font-bold text-purple-600 text-lg">#{currentUserRank}</span>
                    </div>
                    <Avatar className="w-14 h-14 ring-2 ring-purple-200">
                      <AvatarImage src={user.avatar} alt={user.username} />
                      <AvatarFallback className="bg-purple-100 text-purple-700 font-bold">
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{user.username}</h3>
                      <p className="text-sm text-gray-600">{user.xp} XP</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{currentUserData?.challengeCount || 0} challenges</span>
                        <span>{currentUserData?.badgeCount || 0} badges</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        {getRankChangeIcon(currentUserData?.rankChange || 0, false)}
                        <span className={`text-sm font-medium ${
                          (currentUserData?.rankChange || 0) > 0 ? 'text-green-600' :
                          (currentUserData?.rankChange || 0) < 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {currentUserData?.rankChange === 0 ? 'No change' :
                           (currentUserData?.rankChange || 0) > 0 ? `+${currentUserData?.rankChange}` :
                           currentUserData?.rankChange}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top 10 Leaderboard */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-white">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <span>Top 10 Developers</span>
                </CardTitle>
                <CardDescription className="text-gray-300">
                  The highest-ranking no-code developers in our community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.slice(0, 10).map((developer, index) => {
                    const position = index + 1;
                    const isCurrentUser = developer.id === user?.id;
                    return position === 1 ? (
                      // Special gold card for 1st place without Card wrapper
                      <div
                        key={developer.id}
                        className="flex items-center space-x-4 p-6 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden cursor-pointer"
                        style={{
                          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.4) 0%, rgba(245, 158, 11, 0.5) 25%, rgba(234, 88, 12, 0.45) 50%, rgba(251, 191, 36, 0.35) 75%, rgba(245, 158, 11, 0.4) 100%)',
                          backdropFilter: 'blur(16px)',
                          border: '2px solid rgba(251, 191, 36, 0.7)',
                          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(251, 191, 36, 0.6)',
                          borderRadius: '16px'
                        }}
                        onClick={() => window.location.href = isCurrentUser ? '/profile' : `/profile/${developer.id}`}
                      >
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center relative">
                              {getRankIcon(position)}
                              {/* Champion Sparkle Effects for 1st Place */}
                              {position === 1 && (
                                <>
                                  <div className="absolute -top-3 -left-3 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-80"></div>
                                  <div className="absolute -bottom-2 -right-2 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping opacity-90" style={{animationDelay: '0.5s'}}></div>
                                  <div className="absolute top-1/2 -right-4 w-2 h-2 bg-orange-400 rounded-full animate-ping opacity-70" style={{animationDelay: '1s'}}></div>
                                  <div className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping opacity-85" style={{animationDelay: '0.3s'}}></div>
                                  <div className="absolute -bottom-3 -left-1 w-1 h-1 bg-amber-300 rounded-full animate-ping opacity-75" style={{animationDelay: '0.8s'}}></div>
                                </>
                              )}
                            </div>
                          <div className="relative">
                            <Avatar className={`${getAvatarSize(position)} ring-4 ${
                              position === 1 ? 'ring-yellow-300/60 shadow-2xl shadow-yellow-500/30' :
                              position === 2 ? 'ring-slate-300/40 shadow-xl shadow-slate-500/20' :
                              position === 3 ? 'ring-orange-300/40 shadow-lg shadow-orange-500/20' :
                              'ring-gray-200 shadow-md'
                            }`}>
                              <AvatarImage src={developer.avatar || undefined} alt={developer.username} />
                              <AvatarFallback className={`font-black text-lg ${
                                position === 1 ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white' :
                                position === 2 ? 'bg-gradient-to-br from-slate-400 to-gray-600 text-white' :
                                position === 3 ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white' :
                                'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                              }`}>
                                {developer.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {position <= 3 && (
                              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                position === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg' :
                                position === 2 ? 'bg-gradient-to-br from-slate-400 to-gray-500 text-white shadow-md' :
                                position === 3 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md' : ''
                              }`}>
                                {position}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 relative z-10">
                          <div className="flex items-center space-x-2 mb-2 relative">
                            {/* Extra sparkles for champion username */}
                            {position === 1 && (
                              <>
                                <div className="absolute -top-1 -left-4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping opacity-70" style={{animationDelay: '0.7s'}}></div>
                                <div className="absolute -bottom-2 -right-3 w-1 h-1 bg-amber-300 rounded-full animate-ping opacity-80" style={{animationDelay: '1.2s'}}></div>
                              </>
                            )}
                            <h3 className={`font-black text-xl tracking-tight ${
                              position === 1 ? 'text-yellow-400 drop-shadow-lg' :
                              position === 2 ? 'text-slate-300 drop-shadow-md' :
                              position === 3 ? 'text-orange-400 drop-shadow-lg' : 'text-gray-900'
                            }`}>
                              {developer.username}
                            </h3>

                          </div>
                          <div className={`flex items-center space-x-4 text-sm font-bold ${
                            position === 1 ? 'text-yellow-300 drop-shadow-sm' :
                            position === 2 ? 'text-slate-200 drop-shadow-sm' :
                            position === 3 ? 'text-orange-300 drop-shadow-sm' : 'text-gray-600'
                          }`}>
                            <span className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${
                                position === 1 ? 'bg-yellow-500' :
                                position === 2 ? 'bg-slate-400' :
                                position === 3 ? 'bg-orange-500' : 'bg-blue-500'
                              }`}></div>
                              <span>{developer.challengeCount} challenges</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${
                                position === 1 ? 'bg-amber-500' :
                                position === 2 ? 'bg-gray-400' :
                                position === 3 ? 'bg-red-500' : 'bg-green-500'
                              }`}></div>
                              <span>{developer.badgeCount} badges</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-2 relative z-10">
                          {/* Champion sparkles for XP section */}
                          {position === 1 && (
                            <>
                              <div className="absolute -top-2 -left-3 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-75" style={{animationDelay: '0.8s'}}></div>
                              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping opacity-85" style={{animationDelay: '1.5s'}}></div>
                              <div className="absolute top-1/2 -left-2 w-1 h-1 bg-orange-300 rounded-full animate-ping opacity-80" style={{animationDelay: '0.4s'}}></div>
                            </>
                          )}
                          <div className={`font-black text-2xl tracking-tight drop-shadow-lg ${
                            position === 1 ? 'text-yellow-300' :
                            position === 2 ? 'text-slate-200' :
                            position === 3 ? 'text-orange-300' : 'text-purple-600'
                          }`}>
                            {developer.total_xp.toLocaleString()}
                            <span className={`text-sm font-bold ml-1 ${
                              position === 1 ? 'text-yellow-400 drop-shadow-sm' :
                              position === 2 ? 'text-slate-300 drop-shadow-sm' :
                              position === 3 ? 'text-orange-400 drop-shadow-sm' : 'opacity-80'
                            }`}>XP</span>
                          </div>
                          <div className="flex items-center justify-end space-x-2">
                            {getRankChangeIcon(developer.rankChange || 0, false, false)}
                            <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                              (developer.rankChange || 0) > 0 ? 'bg-green-100 text-green-700' :
                              (developer.rankChange || 0) < 0 ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {developer.rankChange === 0 ? '0' :
                               developer.rankChange! > 0 ? `+${developer.rankChange}` :
                               developer.rankChange}
                            </span>
                          </div>
                        </div>
                        </div>
                      ) : (
                      // Regular Link for positions 2-10
                      <Link
                        key={developer.id}
                        to={isCurrentUser ? '/profile' : `/profile/${developer.id}`}
                        className={getRankStyle(position, isCurrentUser) + ' cursor-pointer'}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center relative">
                            {getRankIcon(position)}
                            {/* Champion Sparkle Effects for 1st Place */}
                            {position === 1 && (
                              <>
                                <div className="absolute -top-3 -left-3 w-3 h-3 bg-yellow-300 rounded-full animate-ping opacity-80"></div>
                                <div className="absolute -bottom-2 -right-2 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping opacity-90" style={{animationDelay: '0.5s'}}></div>
                                <div className="absolute top-1/2 -right-4 w-2 h-2 bg-orange-400 rounded-full animate-ping opacity-70" style={{animationDelay: '1s'}}></div>
                                <div className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-ping opacity-85" style={{animationDelay: '0.3s'}}></div>
                                <div className="absolute -bottom-3 -left-1 w-1 h-1 bg-amber-300 rounded-full animate-ping opacity-75" style={{animationDelay: '0.8s'}}></div>
                              </>
                            )}
                          </div>
                          <div className="relative">
                            <Avatar className={`${getAvatarSize(position)} ring-4 ${
                              position === 1 ? 'ring-yellow-300/60 shadow-2xl shadow-yellow-500/30' :
                              position === 2 ? 'ring-slate-300/40 shadow-xl shadow-slate-500/20' :
                              position === 3 ? 'ring-orange-300/40 shadow-lg shadow-orange-500/20' :
                              'ring-gray-200 shadow-md'
                            }`}>
                              <AvatarImage src={developer.avatar || undefined} alt={developer.username} />
                              <AvatarFallback className={`font-black text-lg ${
                                position === 1 ? 'bg-gradient-to-br from-yellow-500 to-amber-600 text-white' :
                                position === 2 ? 'bg-gradient-to-br from-slate-400 to-gray-600 text-white' :
                                position === 3 ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white' :
                                'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                              }`}>
                                {developer.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {position <= 3 && (
                              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                position === 1 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-lg' :
                                position === 2 ? 'bg-gradient-to-br from-slate-400 to-gray-500 text-white shadow-md' :
                                position === 3 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md' : ''
                              }`}>
                                {position}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 relative z-10">
                          <div className="flex items-center space-x-2 mb-2 relative">
                            {/* Extra sparkles for champion username */}
                            {position === 1 && (
                              <>
                                <div className="absolute -top-1 -left-4 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-ping opacity-70" style={{animationDelay: '0.7s'}}></div>
                                <div className="absolute -bottom-2 -right-3 w-1 h-1 bg-amber-300 rounded-full animate-ping opacity-80" style={{animationDelay: '1.2s'}}></div>
                              </>
                            )}
                            <h3 className={`font-black text-xl tracking-tight ${
                              position === 1 ? 'text-yellow-400 drop-shadow-lg' :
                              position === 2 ? 'text-slate-300 drop-shadow-md' :
                              position === 3 ? 'text-orange-400 drop-shadow-lg' : 'text-gray-900'
                            }`}>
                              {developer.username}
                            </h3>

                          </div>
                          <div className={`flex items-center space-x-4 text-sm font-bold ${
                            position === 1 ? 'text-yellow-300 drop-shadow-sm' :
                            position === 2 ? 'text-slate-200 drop-shadow-sm' :
                            position === 3 ? 'text-orange-300 drop-shadow-sm' : 'text-gray-600'
                          }`}>
                            <span className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${
                                position === 1 ? 'bg-yellow-500' :
                                position === 2 ? 'bg-slate-400' :
                                position === 3 ? 'bg-orange-500' : 'bg-blue-500'
                              }`}></div>
                              <span>{developer.challengeCount} challenges</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${
                                position === 1 ? 'bg-amber-500' :
                                position === 2 ? 'bg-gray-400' :
                                position === 3 ? 'bg-red-500' : 'bg-green-500'
                              }`}></div>
                              <span>{developer.badgeCount} badges</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-2 relative z-10">
                          {/* Champion sparkles for XP section */}
                          {position === 1 && (
                            <>
                              <div className="absolute -top-2 -left-3 w-2 h-2 bg-yellow-500 rounded-full animate-ping opacity-75" style={{animationDelay: '0.8s'}}></div>
                              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping opacity-85" style={{animationDelay: '1.5s'}}></div>
                              <div className="absolute top-1/2 -left-2 w-1 h-1 bg-orange-300 rounded-full animate-ping opacity-80" style={{animationDelay: '0.4s'}}></div>
                            </>
                          )}
                          <div className={`font-black text-2xl tracking-tight drop-shadow-lg ${
                            position === 1 ? 'text-yellow-300' :
                            position === 2 ? 'text-slate-200' :
                            position === 3 ? 'text-orange-300' : 'text-purple-600'
                          }`}>
                            {developer.total_xp.toLocaleString()}
                            <span className={`text-sm font-bold ml-1 ${
                              position === 1 ? 'text-yellow-400 drop-shadow-sm' :
                              position === 2 ? 'text-slate-300 drop-shadow-sm' :
                              position === 3 ? 'text-orange-400 drop-shadow-sm' : 'opacity-80'
                            }`}>XP</span>
                          </div>
                          <div className="flex items-center justify-end space-x-2">
                            {getRankChangeIcon(developer.rankChange || 0, false, false)}
                            <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                              (developer.rankChange || 0) > 0 ? 'bg-green-100 text-green-700' :
                              (developer.rankChange || 0) < 0 ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {developer.rankChange === 0 ? '0' :
                               developer.rankChange! > 0 ? `+${developer.rankChange}` :
                               developer.rankChange}
                            </span>
                          </div>
                        </div>
                      </Link>
                      );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {leaderboard.reduce((sum, dev) => sum + (dev.total_xp || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-gray-600 font-medium">Total XP Earned</div>
                  <div className="text-sm text-gray-500 mt-1">Across all users</div>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {leaderboard.reduce((sum, dev) => sum + (dev.challengeCount || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-gray-600 font-medium">Challenges Completed</div>
                  <div className="text-sm text-gray-500 mt-1">Total submissions approved</div>
                </CardContent>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {leaderboard.reduce((sum, dev) => sum + (dev.badgeCount || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-gray-600 font-medium">Badges Earned</div>
                  <div className="text-sm text-gray-500 mt-1">Achievement unlocks</div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}