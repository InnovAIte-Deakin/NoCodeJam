import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AvatarUploadCropper } from '@/components/ui/AvatarUploadCropper';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Github, Calendar, ExternalLink, Trophy } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Link, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { BadgeService } from '@/services/badgeService';
import type { Badge as BadgeType } from '@/types';

interface SubmissionRow { id: string; challenge_id: string; status: string; submitted_at?: string; admin_feedback?: string; submission_url: string; }
interface ChallengeRow { id: string; title: string; }
// Removed unused BadgesCard import (badge list rendered inline below)

export function ProfilePage() {
  const { user: currentUser, setUser } = useAuth();
  const { id } = useParams();
  const [user, setProfileUser] = useState<typeof currentUser>(currentUser);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    bio: currentUser?.bio || '',
    githubUsername: currentUser?.githubUsername || '',
    avatar: currentUser?.avatar || ''
  });
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [challenges, setChallenges] = useState<ChallengeRow[]>([]);

  // Helper function to delete old avatar from storage
  const deleteOldAvatar = async (avatarUrl: string) => {
    if (!avatarUrl || !avatarUrl.includes('avatars/')) {
      return;
    }
    
    try {
      let filePath: string;
      
      // Handle different URL formats
      if (avatarUrl.includes('storage/v1/object/public/avatars/')) {
        // Supabase public URL format: https://project.supabase.co/storage/v1/object/public/avatars/filename.jpg
        const url = new URL(avatarUrl);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        
        // Check if this is the old format with double avatars
        if (avatarUrl.includes('/avatars/avatars/')) {
          filePath = `avatars/${fileName}`;
        } else {
          filePath = fileName;
        }
      } else if (avatarUrl.includes('avatars/')) {
        // Direct path format or other formats
        const url = new URL(avatarUrl);
        const pathParts = url.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        
        // Check if this is the old format with double avatars
        if (avatarUrl.includes('/avatars/avatars/')) {
          filePath = `avatars/${fileName}`;
        } else {
          filePath = fileName;
        }
      } else {
        return;
      }
      
      // Try multiple deletion approaches
      const deletionPaths = [
        filePath,
        `/${filePath}`,
        filePath.replace(/^\/+/, ''), // Remove leading slashes
        `avatars/${filePath}`,
        `avatars/${filePath.replace(/^avatars\//, '')}` // Remove duplicate avatars prefix
      ];
      
      for (const path of deletionPaths) {
        const { error } = await supabase.storage
          .from('avatars')
          .remove([path]);
        
        if (!error) {
          break; // Successfully deleted
        }
      }
      
    } catch (error) {
      console.error('Error deleting old avatar:', error);
    }
  };

  // Helper function to upload new avatar
  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user?.id) throw new Error('No user available for avatar upload');
    const filePath = `${user.id}_${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });
    
    if (error) throw new Error(error.message);
    
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    return urlData?.publicUrl || '';
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  const [userBadges, setUserBadges] = useState<BadgeType[]>([]);
  const [badgesLoading, setBadgesLoading] = useState(false);
  const [badgesError, setBadgesError] = useState<string | null>(null);

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
  setCompletedChallenges(submissionsData ? submissionsData.filter((s: SubmissionRow) => s.status === 'approved').length : 0);
      }
    };
    const fetchChallenges = async () => {
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('id, title');
      setChallenges(challengesData || []);
    };
    const fetchBadges = async () => {
      if (!user?.id) return;
      try {
        setBadgesLoading(true);
        setBadgesError(null);
        const badges = await BadgeService.getUserBadges(user.id);
        setUserBadges(badges);
      } catch (error) {
        console.error('Error fetching user badges:', error);
        setBadgesError('Failed to load badges');
      } finally {
        setBadgesLoading(false);
      }
    };
    fetchCompleted();
    fetchChallenges();
    fetchBadges();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      let newAvatarUrl = formData.avatar;
      
      // If there's a cropped file, upload it and delete the old avatar
      if (croppedFile) {
        // Store the old avatar URL for cleanup
        const oldAvatarUrl = formData.avatar;
        
        // Upload the new avatar
        newAvatarUrl = await uploadAvatar(croppedFile);
        
        // Delete the old avatar if it exists and is different
        if (oldAvatarUrl && oldAvatarUrl !== newAvatarUrl) {
          await deleteOldAvatar(oldAvatarUrl);
        }
      }
      
      const { error } = await supabase
        .from('users')
        .update({
          username: formData.username,
          bio: formData.bio,
          github_username: formData.githubUsername,
          avatar: newAvatarUrl
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
        avatar: newAvatarUrl
      });

      // Update form data with the new avatar URL
      setFormData(prev => ({ ...prev, avatar: newAvatarUrl }));
      
      // Clear the cropped file and preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setCroppedFile(null);
      setPreviewUrl(null);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      bio: user?.bio || '',
      githubUsername: user?.githubUsername || '',
      avatar: user?.avatar || ''
    });
    // Clear any cropped file and preview when canceling
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCroppedFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
  };

  // Handle cropped file from the cropper
  const handleCropComplete = (file: File) => {
    setCroppedFile(file);
    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    // Create a preview URL for the cropped image
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };


  // Only allow editing if viewing own profile
  const isOwnProfile = !id || id === currentUser?.id;

  const refreshBadges = async () => {
    if (!user?.id) return;
    await BadgeService.processUserBadges?.(user.id); // optional if method exists; safe optional chaining
    // Re-fetch after processing
    try {
      setBadgesLoading(true);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile Info & Stats */}
          <div className="space-y-6 lg:col-span-1">
            {/* Profile Card */}
            <Card className="bg-gray-800 border-gray-700">
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
                      <Label className="text-sm font-medium">Avatar Image</Label>
                      <AvatarUploadCropper
                        onCropComplete={handleCropComplete}
                        initialImage={formData.avatar}
                      />
                      {(previewUrl || formData.avatar) && (
                        <div className="mt-2">
                          <img 
                            src={previewUrl || formData.avatar} 
                            alt="Avatar preview" 
                            className="w-20 h-20 rounded-full mx-auto" 
                          />
                          {previewUrl && (
                            <p className="text-sm text-gray-400 text-center mt-1">
                              Preview - Click "Save Changes" to apply
                            </p>
                          )}
                        </div>
                      )}
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
                    <CardTitle className="text-2xl font-bold text-white">{user?.username}</CardTitle>
                    <CardDescription className="mb-2 text-gray-300">{user?.email}</CardDescription>
                    {user?.bio && <p className="text-gray-300 text-sm mb-2">{user.bio}</p>}
                    {user?.githubUsername && (
                      <a
                        href={`https://github.com/${user.githubUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-400 hover:underline text-sm mb-2"
                      >
                        <Github className="w-4 h-4 mr-1" />
                        {user.githubUsername}
                      </a>
                    )}
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 mb-2">
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
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Account Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total XP</span>
                    <span className="font-bold text-purple-400">{user.xp}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Badges Earned</span>
                    <span className="font-bold text-yellow-400">{userBadges.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Account Type</span>
                    <span className="font-medium capitalize text-white">{user.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Challenges Completed</span>
                    <span className="font-bold text-green-400">{completedChallenges}</span>
                  </div>
                  
                  {/* Badges Preview */}
                  {userBadges.length > 0 && (
                    <div className="pt-2">
                      <span className="text-muted-foreground text-sm">Recent Badges</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {userBadges.slice(0, 5).map((badge) => (
                          <div
                            key={badge.id}
                            className="flex items-center gap-1 bg-card border border-border px-2 py-1 rounded-md hover:border-primary/50 transition-colors"
                            title={badge.description}
                          >
                            <span className="text-lg">{badge.icon}</span>
                            <span className="text-xs font-medium text-foreground">{badge.name}</span>
                          </div>
                        ))}
                        {userBadges.length > 5 && (
                          <span className="text-xs text-muted-foreground flex items-center">
                            +{userBadges.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Submissions & Badges */}
          <div className="space-y-8 lg:col-span-2">
            {/* Submissions Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Your Submissions</CardTitle>
                <CardDescription className="text-gray-300">All your challenge submissions</CardDescription>
              </CardHeader>
              <CardContent>
                {submissions.length > 0 ? (
                  <div className="space-y-4">
                    {submissions.map((submission) => {
                      const challenge = challenges.find((c) => c.id === submission.challenge_id);
                      return (
                        <div key={submission.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-700 rounded-lg space-y-2 sm:space-y-0">
                          <div className="flex-1">
                            <h4 className="font-medium text-sm sm:text-base text-white">{challenge?.title || 'Unknown Challenge'}</h4>
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
            {/* Badges Section */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 space-x-4">
                <div>
                  <CardTitle className="text-white">Badges</CardTitle>
                  <CardDescription className="text-gray-300">Your achievements and milestones</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={refreshBadges} disabled={badgesLoading}>
                  {badgesLoading ? 'Refreshing...' : 'Refresh'}
                </Button>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {badgesError && (
                  <div className="mb-4 text-xs text-red-400">{badgesError}</div>
                )}
                {badgesLoading && userBadges.length === 0 ? (
                  <div className="text-center py-4 sm:py-6 text-gray-400 text-sm">Loading badges...</div>
                ) : userBadges.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {userBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className="relative rounded-lg p-4 bg-gray-900/70 border border-gray-700 hover:border-gray-500 hover:bg-gray-900 shadow-sm transition-colors group"
                      >
                        <div className="text-center flex flex-col h-full">
                          <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200 drop-shadow-sm">{badge.icon}</div>
                          <h4 className="font-medium text-gray-100 text-sm mb-1 line-clamp-1">{badge.name}</h4>
                          <p className="text-[11px] text-gray-400 mb-3 line-clamp-2 flex-1">{badge.description}</p>
                          <p className="text-[10px] uppercase tracking-wide font-medium text-indigo-300/80 mt-auto">
                            Earned {badge.unlockedAt.toLocaleDateString?.() || ''}
                          </p>
                        </div>
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
    </div>
  );
}