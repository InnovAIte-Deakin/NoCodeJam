import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Trophy, Medal, Award, Crown, Star } from 'lucide-react';

// Mock leaderboard data
const leaderboardData = [
  {
    id: '1',
    username: 'john_doe',
    xp: 1250,
    badges: 3,
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    completedChallenges: 8
  },
  {
    id: '2',
    username: 'admin',
    xp: 2500,
    badges: 5,
    avatar: null,
    completedChallenges: 15
  },
  {
    id: '3',
    username: 'sarah_dev',
    xp: 980,
    badges: 2,
    avatar: 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    completedChallenges: 6
  },
  {
    id: '4',
    username: 'mike_builder',
    xp: 875,
    badges: 4,
    avatar: 'https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    completedChallenges: 5
  },
  {
    id: '5',
    username: 'alex_coder',
    xp: 750,
    badges: 1,
    avatar: null,
    completedChallenges: 4
  },
  {
    id: '6',
    username: 'jenny_create',
    xp: 650,
    badges: 2,
    avatar: 'https://images.pexels.com/photos/3686769/pexels-photo-3686769.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    completedChallenges: 3
  },
  {
    id: '7',
    username: 'david_flow',
    xp: 540,
    badges: 1,
    avatar: null,
    completedChallenges: 3
  },
  {
    id: '8',
    username: 'lisa_app',
    xp: 425,
    badges: 1,
    avatar: 'https://images.pexels.com/photos/3756679/pexels-photo-3756679.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    completedChallenges: 2
  },
  {
    id: '9',
    username: 'tom_build',
    xp: 380,
    badges: 0,
    avatar: null,
    completedChallenges: 2
  },
  {
    id: '10',
    username: 'emma_code',
    xp: 290,
    badges: 1,
    avatar: 'https://images.pexels.com/photos/3767392/pexels-photo-3767392.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
    completedChallenges: 1
  }
];

export function LeaderboardPage() {
  const { user } = useAuth();
  
  // Sort by XP in descending order
  const sortedLeaderboard = [...leaderboardData].sort((a, b) => b.xp - a.xp);
  
  // Find current user's rank
  const currentUserRank = sortedLeaderboard.findIndex(u => u.id === user?.id) + 1;
  
  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-500">#{position}</div>;
    }
  };

  const getRankStyle = (position: number, isCurrentUser: boolean) => {
    let baseStyle = "flex items-center space-x-4 p-4 rounded-lg transition-all duration-200";
    
    if (isCurrentUser) {
      baseStyle += " bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 shadow-md";
    } else if (position <= 3) {
      baseStyle += " bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200";
    } else {
      baseStyle += " bg-white border border-gray-200 hover:bg-gray-50";
    }
    
    return baseStyle;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🏆 Leaderboard</h1>
          <p className="text-gray-600">
            See how you rank against other no-code developers in the community
          </p>
        </div>

        {/* Current User Rank (if not in top 10) */}
        {user && currentUserRank > 10 && (
          <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-purple-600" />
                <span>Your Rank</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full">
                  <span className="font-bold text-purple-600">#{currentUserRank}</span>
                </div>
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar} alt={user.username} />
                  <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold">{user.username}</h3>
                  <p className="text-sm text-gray-600">{user.xp} XP</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{user.badges.length} badges</div>
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
            <div className="space-y-3">
              {sortedLeaderboard.slice(0, 10).map((developer, index) => {
                const position = index + 1;
                const isCurrentUser = developer.id === user?.id;
                
                return (
                  <div
                    key={developer.id}
                    className={getRankStyle(position, isCurrentUser)}
                  >
                    <div className="flex items-center space-x-3">
                      {getRankIcon(position)}
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={developer.avatar || undefined} alt={developer.username} />
                        <AvatarFallback>{developer.username.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">{developer.username}</h3>
                        {isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {developer.completedChallenges} challenges completed
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-purple-600 text-lg">{developer.xp} XP</div>
                      <div className="text-sm text-gray-600">{developer.badges} badges</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {sortedLeaderboard.reduce((sum, dev) => sum + dev.xp, 0).toLocaleString()}
              </div>
              <div className="text-gray-600">Total XP Earned</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {sortedLeaderboard.reduce((sum, dev) => sum + dev.completedChallenges, 0)}
              </div>
              <div className="text-gray-600">Challenges Completed</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {sortedLeaderboard.reduce((sum, dev) => sum + dev.badges, 0)}
              </div>
              <div className="text-gray-600">Badges Earned</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}