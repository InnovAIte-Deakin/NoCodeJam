import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { mockSubmissions, mockChallenges } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { Trophy, Star, Calendar, ExternalLink, Github } from 'lucide-react';

export function Dashboard() {
  const { user } = useAuth();
  
  if (!user) return null;

  const userSubmissions = mockSubmissions.filter(s => s.userId === user.id);
  const completedChallenges = userSubmissions.filter(s => s.status === 'approved').length;
  const nextLevelXP = Math.ceil(user.xp / 1000) * 1000;
  const progressToNextLevel = (user.xp % 1000) / 10;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container-responsive py-6 sm:py-8">
        {/* Welcome Header */}
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user.username}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Ready to take on some new challenges today?
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column - Stats & Progress */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* XP and Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-lg sm:text-xl">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <span>Your Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm font-medium text-gray-600">Current XP</span>
                    <span className="text-xl sm:text-2xl font-bold text-purple-600">{user.xp}</span>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                      <span>Progress to next milestone</span>
                      <span>{nextLevelXP - user.xp} XP remaining</span>
                    </div>
                    <Progress value={progressToNextLevel} className="h-3" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-4">
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-purple-600">{completedChallenges}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Challenges Completed</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold text-orange-600">{user.badges.length}</div>
                      <div className="text-xs sm:text-sm text-gray-600">Badges Earned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Submissions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Recent Submissions</CardTitle>
                <CardDescription>
                  Your latest challenge submissions and their status
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {userSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {userSubmissions.slice(0, 3).map((submission) => {
                      const challenge = mockChallenges.find(c => c.id === submission.challengeId);
                      return (
                        <div key={submission.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm sm:text-base text-gray-900">{challenge?.title}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Submitted {submission.submittedAt.toLocaleDateString()}
                            </p>
                            {submission.feedback && (
                              <p className="text-xs sm:text-sm text-gray-500 mt-1">{submission.feedback}</p>
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
                              <a href={submission.solutionUrl} target="_blank" rel="noopener noreferrer">
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
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">No submissions yet</p>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Profile</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <Avatar className="w-16 h-16 sm:w-20 sm:h-20">
                    <AvatarImage src={user.avatar} alt={user.username} />
                    <AvatarFallback className="text-lg sm:text-xl">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">{user.username}</h3>
                    <p className="text-sm sm:text-base text-gray-600">{user.email}</p>
                    {user.bio && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-2">{user.bio}</p>
                    )}
                    {user.githubUsername && (
                      <div className="flex items-center justify-center space-x-1 mt-2 text-xs sm:text-sm text-gray-600">
                        <Github className="w-4 h-4" />
                        <span>{user.githubUsername}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500">
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Badges</CardTitle>
                <CardDescription>
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
                    <p className="text-xs sm:text-sm text-gray-600">No badges yet</p>
                    <p className="text-xs text-gray-500 mt-1">Complete challenges to earn your first badge!</p>
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