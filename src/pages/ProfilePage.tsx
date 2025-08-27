import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { User, Github, Mail, Calendar, ExternalLink, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

export function ProfilePage() {
  const { user: currentUser, setUser } = useAuth();
  const { id } = useParams();
  const [user, setProfileUser] = useState<any>(currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    bio: currentUser?.bio || '',
    githubUsername: currentUser?.githubUsername || '',
    avatar: currentUser?.avatar || ''
  });
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      if (id && id !== currentUser?.id) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();
        if (!error && data) {
          setProfileUser(data);
          setFormData({
            username: data.username || '',
            bio: data.bio || '',
            githubUsername: data.githubUsername || '',
            avatar: data.avatar || ''
          });
        }
      } else {
        setProfileUser(currentUser);
        setFormData({
          username: currentUser?.username || '',
          bio: currentUser?.bio || '',
          githubUsername: currentUser?.githubUsername || '',
          avatar: currentUser?.avatar || ''
        });
      }
    };
    fetchUser();
  }, [id, currentUser]);

  useEffect(() => {
    const fetchCompleted = async () => {
      if (user) {
        const { data: submissionsData } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', user.id);
        setSubmissions(submissionsData || []);
        setCompletedChallenges(submissionsData ? submissionsData.filter((s: any) => s.status === 'approved').length : 0);
      }
    };
    const fetchChallenges = async () => {
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('id, title');
      setChallenges(challengesData || []);
    };
    fetchCompleted();
    fetchChallenges();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase
      .from('users')
      .update({
        username: formData.username,
        bio: formData.bio,
        github_username: formData.githubUsername,
        avatar: formData.avatar
      })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setUser({
      ...user,
      username: formData.username,
      bio: formData.bio,
      githubUsername: formData.githubUsername,
      avatar: formData.avatar
    });

    toast({
      title: "Profile updated",
      description: "Your profile has been successfully updated.",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      bio: user?.bio || '',
      githubUsername: user?.githubUsername || '',
      avatar: user?.avatar || ''
    });
    setIsEditing(false);
  };

  // Only allow editing if viewing own profile
  const isOwnProfile = !id || id === currentUser?.id;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Info & Stats */}
          <div className="space-y-6 lg:col-span-1">
            {/* Profile Card */}
            <Card>
              <CardHeader className="text-center">
                <Avatar className="w-24 h-24 mx-auto mb-4">
                  <AvatarImage src={isEditing ? formData.avatar : user?.avatar} alt={user?.username} />
                  <AvatarFallback className="text-2xl">
                    {(isEditing ? formData.username : user?.username)?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                      <Input
                        id="username"
                        value={formData.username}
                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="avatar" className="text-sm font-medium">Avatar URL</Label>
                      <Input
                        id="avatar"
                        type="url"
                        value={formData.avatar}
                        onChange={(e) => setFormData({...formData, avatar: e.target.value})}
                        placeholder="https://example.com/avatar.jpg"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                      <Textarea
                        id="bio"
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="Tell us about yourself..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="github" className="text-sm font-medium">GitHub Username</Label>
                      <Input
                        id="github"
                        value={formData.githubUsername}
                        onChange={(e) => setFormData({...formData, githubUsername: e.target.value})}
                        placeholder="your-github-username"
                        className="mt-1"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-2xl font-bold">{user?.username}</CardTitle>
                    <CardDescription className="mb-2">{user?.email}</CardDescription>
                    {user?.bio && <p className="text-gray-600 text-sm mb-2">{user.bio}</p>}
                    {user?.githubUsername && (
                      <a
                        href={`https://github.com/${user.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:underline text-sm mb-2"
                      >
                        <Github className="w-4 h-4 mr-1" />
                        {user.githubUsername}
                      </a>
                    )}
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {user?.joinedAt?.toLocaleDateString()}</span>
                    </div>
                  </>
                )}

                {isOwnProfile && !isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                )}

                {isEditing && (
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                    >
                      Save Changes
                    </Button>
                  </div>
                )}
              </CardHeader>
            </Card>
            {/* Account Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Account Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total XP</span>
                    <span className="font-bold text-purple-600">{user.xp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Badges Earned</span>
                    <span className="font-bold text-yellow-600">{(user?.badges?.length ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Account Type</span>
                    <span className="font-medium capitalize">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Challenges Completed</span>
                    <span className="font-bold text-green-600">{completedChallenges}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Submissions & Badges */}
          <div className="space-y-8 lg:col-span-2">
            {/* Submissions Section */}
            <Card>
              <CardHeader>
                <CardTitle>Your Submissions</CardTitle>
                <CardDescription>All your challenge submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.map((submission: any) => {
                      const challenge = challenges.find((c: any) => c.id === submission.challenge_id);
                      return (
                        <div key={submission.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm sm:text-base text-gray-900">{challenge?.title || 'Unknown Challenge'}</h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              Submitted {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : ''}
                            </p>
                            {submission.admin_feedback && (
                              <p className="text-xs sm:text-sm text-gray-500 mt-1">{submission.admin_feedback}</p>
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
                    <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">No submissions yet</p>
                    <Button asChild>
                      <Link to="/challenges">Start Your First Challenge</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Badges Section */}
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Your achievements and milestones</CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {(user?.badges?.length ?? 0) > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {(user.badges || []).map((badge: any) => (
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
    </div>
  );
}