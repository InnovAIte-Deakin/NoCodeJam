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
          <Crown className="w-10 h-10 text-cyan-600 drop-shadow-2xl" />
          <div className="absolute inset-0 w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full opacity-20 animate-pulse"></div>
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
    let baseStyle = "flex items-center space-x-4 p-6 rounded-2xl transition-all duration-500 transform hover:scale-[1.02] relative overflow-hidden";

    if (isCurrentUser) {
      baseStyle += " bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-300 shadow-lg ring-2 ring-purple-200";
    } else if (position === 1) {
      // 1st Place - Glass morphism with holographic effect
      baseStyle += " bg-gradient-to-br from-emerald-500/20 via-cyan-500/30 to-blue-600/20 backdrop-blur-xl border border-white/20 shadow-2xl ring-4 ring-cyan-400/30 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:animate-pulse";
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 relative overflow-hidden">
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-cyan-200/20 to-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-orange-200/20 to-red-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-slate-200/10 to-gray-200/10 rounded-full blur-2xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-600">
            See how you rank against other no-code developers in the community
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12 text-lg text-gray-500">Loading leaderboard...</div>
        ) : (
          <>
            {/* Current User Rank (if not in top 10) */}
            {user && currentUserRank > 10 && (
              <Card className="mb-6 border-purple-300 shadow-lg bg-gradient-to-r from-purple-50 to-blue-50">
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  <span>Top 10 Developers</span>
                </CardTitle>
                <CardDescription>
                  The highest-ranking no-code developers in our community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.slice(0, 10).map((developer, index) => {
                    const position = index + 1;
                    const isCurrentUser = developer.id === user?.id;
                    return (
                      <Link
                        key={developer.id}
                        to={isCurrentUser ? '/profile' : `/profile/${developer.id}`}
                        className={getRankStyle(position, isCurrentUser) + ' cursor-pointer'}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center">
                            {getRankIcon(position)}
                          </div>
                          <div className="relative">
                            <Avatar className={`${getAvatarSize(position)} ring-4 ${
                              position === 1 ? 'ring-cyan-300/50 shadow-2xl shadow-cyan-500/25' :
                              position === 2 ? 'ring-slate-300/40 shadow-xl shadow-slate-500/20' :
                              position === 3 ? 'ring-orange-300/40 shadow-lg shadow-orange-500/20' :
                              'ring-gray-200 shadow-md'
                            }`}>
                              <AvatarImage src={developer.avatar || undefined} alt={developer.username} />
                              <AvatarFallback className={`font-black text-lg ${
                                position === 1 ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white' :
                                position === 2 ? 'bg-gradient-to-br from-slate-400 to-gray-600 text-white' :
                                position === 3 ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white' :
                                'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700'
                              }`}>
                                {developer.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {position <= 3 && (
                              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                                position === 1 ? 'bg-gradient-to-br from-emerald-400 to-cyan-500 text-white shadow-lg' :
                                position === 2 ? 'bg-gradient-to-br from-slate-400 to-gray-500 text-white shadow-md' :
                                position === 3 ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-md' : ''
                              }`}>
                                {position}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 relative z-10">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`font-black text-xl tracking-tight ${
                              position === 1 ? 'text-slate-800' :
                              position === 2 ? 'text-slate-700' :
                              position === 3 ? 'text-slate-800' : 'text-gray-900'
                            }`}>
                              {developer.username}
                            </h3>
                            {isCurrentUser && (
                              <Badge variant="secondary" className={`text-xs font-semibold px-2 py-1 ${
                                position === 1 ? 'bg-cyan-500/20 text-cyan-700 border-cyan-400/30' :
                                position === 2 ? 'bg-slate-400/20 text-slate-700 border-slate-300/30' :
                                position === 3 ? 'bg-orange-500/20 text-orange-700 border-orange-400/30' :
                                'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              }`}>
                                You
                              </Badge>
                            )}
                          </div>
                          <div className={`flex items-center space-x-4 text-sm font-medium ${
                            position === 1 ? 'text-slate-600' :
                            position === 2 ? 'text-slate-500' :
                            position === 3 ? 'text-slate-600' : 'text-gray-600'
                          }`}>
                            <span className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${
                                position === 1 ? 'bg-cyan-500' :
                                position === 2 ? 'bg-slate-400' :
                                position === 3 ? 'bg-orange-500' : 'bg-blue-500'
                              }`}></div>
                              <span>{developer.challengeCount} challenges</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <div className={`w-2 h-2 rounded-full ${
                                position === 1 ? 'bg-emerald-500' :
                                position === 2 ? 'bg-gray-400' :
                                position === 3 ? 'bg-red-500' : 'bg-green-500'
                              }`}></div>
                              <span>{developer.badgeCount} badges</span>
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-2 relative z-10">
                          <div className={`font-black text-2xl tracking-tight ${
                            position === 1 ? 'text-cyan-700' :
                            position === 2 ? 'text-slate-600' :
                            position === 3 ? 'text-orange-700' : 'text-purple-600'
                          }`}>
                            {developer.total_xp.toLocaleString()}
                            <span className="text-sm font-bold ml-1 opacity-80">XP</span>
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