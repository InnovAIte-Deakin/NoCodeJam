import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import BadgeManagement from '@/components/BadgeManagement';
import {
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Users,
  FileText,
  ExternalLink,
  Trash2,
  Edit
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function AdminDashboard() {
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Expert',
    xpReward: 200,
    imageUrl: '',
    requirements: ['']
  });

  // Step 1: Fetch real pending submissions and challenges
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingSubmissions(true);
      // Fetch pending submissions with user information
      const { data: submissions, error: subError } = await supabase
        .from('submissions')
        .select(`
          *,
          users!submissions_user_id_fkey (
            id,
            username
          )
        `)
        .eq('status', 'pending');
      
      // Add debugging
      console.log('Admin Dashboard - Submissions query result:', { submissions, subError });
      
      // Fetch all challenges (for lookup)
      const { data: challengesData, error: chalError } = await supabase
        .from('challenges')
        .select('*');
      
      console.log('Admin Dashboard - Challenges query result:', { challengesData, chalError });
      
      if (!subError && !chalError && submissions && challengesData) {
        setPendingSubmissions(submissions);
        setChallenges(challengesData);
      } else {
        console.error('Query errors:', { subError, chalError });
      }
      setLoadingSubmissions(false);
    };
    fetchData();
  }, []);

  const handleApproveSubmission = async (submissionId: string) => {
    // Find the submission and its challenge
    const submission = pendingSubmissions.find((s: any) => s.id === submissionId);
    if (!submission) return;
    const challenge = challenges.find((c: any) => c.id === submission.challenge_id);
    if (!challenge) return;
    // Update submission status to approved
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('id', submissionId);
    if (updateError) {
      toast({
        title: "Failed to approve submission",
        description: updateError.message,
        variant: "destructive",
      });
      return;
    }
    // Add XP to user (two-step process)
    // 1. Fetch user
    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('total_xp')
      .eq('id', submission.user_id)
      .single();
    if (userFetchError || !userData) {
      toast({
        title: "Failed to fetch user XP",
        description: userFetchError?.message || 'User not found',
        variant: "destructive",
      });
      return;
    }
    // 2. Update total_xp = user.total_xp + challenge.xp_reward
    const newXP = (userData.total_xp || 0) + (challenge.xp_reward || 0);
    const { error: xpError } = await supabase
      .from('users')
      .update({ total_xp: newXP })
      .eq('id', submission.user_id);
    if (xpError) {
      toast({
        title: "Failed to award XP",
        description: xpError.message,
        variant: "destructive",
      });
      return;
    }

    // Badge awarding logic
    try {
      const { BadgeService } = await import('@/services/badgeService');
      const newBadges = await BadgeService.processUserAction(submission.user_id);
      if (newBadges && newBadges.length > 0) {
        toast({
          title: `User earned ${newBadges.length} badge${newBadges.length > 1 ? 's' : ''}!`,
          description: newBadges.map(b => b.name).join(', '),
        });
      }
    } catch (err) {
      // Ignore badge errors for admin
      console.error('Badge awarding error:', err);
    }

    toast({
      title: "Submission approved",
      description: "The submission has been approved and the user has been awarded XP.",
    });
    // Refresh pending submissions
    refreshPendingSubmissions();
  };

  const handleRejectSubmission = async (submissionId: string) => {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'denied' })
      .eq('id', submissionId);
    if (error) {
      toast({
        title: "Failed to reject submission",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Submission rejected",
      description: "The submission has been rejected.",
      variant: "destructive",
    });
    // Refresh pending submissions
    refreshPendingSubmissions();
  };

  // Helper to refresh pending submissions
  const refreshPendingSubmissions = async () => {
    setLoadingSubmissions(true);
    const { data: submissions, error: subError } = await supabase
      .from('submissions')
      .select(`
        *,
        users!submissions_user_id_fkey (
          id,
          username
        )
      `)
      .eq('status', 'pending');
    if (!subError && submissions) {
      setPendingSubmissions(submissions);
    }
    setLoadingSubmissions(false);
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChallenge.title || !newChallenge.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    // Insert new challenge into Supabase (requirements as string, difficulty lowercase)
    const { error } = await supabase.from('challenges').insert([
      {
        title: newChallenge.title,
        description: newChallenge.description,
        difficulty: newChallenge.difficulty.toLowerCase(),
        xp_reward: newChallenge.xpReward,
        image: newChallenge.imageUrl,
        requirements: newChallenge.requirements.join('; '),
        // created_by: user?.id, // if you want to track the creator
      }
    ]);
    if (error) {
      console.error('Create challenge error:', error);
      toast({
        title: "Failed to create challenge",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Challenge created",
      description: "New challenge has been successfully created and published.",
    });
    // Refresh challenges list
    refreshChallenges();
    // Reset form
    setNewChallenge({
      title: '',
      description: '',
      difficulty: 'Beginner',
      xpReward: 200,
      imageUrl: '',
      requirements: ['']
    });
  };

  // Helper to refresh challenges
  const refreshChallenges = async () => {
    const { data: challengesData, error: chalError } = await supabase
      .from('challenges')
      .select('*');
    if (!chalError && challengesData) {
      setChallenges(challengesData);
    }
  };

  const addRequirement = () => {
    setNewChallenge({
      ...newChallenge,
      requirements: [...newChallenge.requirements, '']
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...newChallenge.requirements];
    updated[index] = value;
    setNewChallenge({
      ...newChallenge,
      requirements: updated
    });
  };

  const removeRequirement = (index: number) => {
    if (newChallenge.requirements.length > 1) {
      const updated = newChallenge.requirements.filter((_, i) => i !== index);
      setNewChallenge({
        ...newChallenge,
        requirements: updated
      });
    }
  };

  // Step 4: Fetch real users for Manage Users tab
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Step 5: Challenge management state
  const [deletingChallengeId, setDeletingChallengeId] = useState<string | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      const { data: usersData, error } = await supabase
        .from('users')
        .select('id, username, email, role, total_xp');
      if (!error && usersData) {
        setUsers(usersData);
      }
      setLoadingUsers(false);
    };
    fetchUsers();
  }, []);

  // Helper to refresh users
  const refreshUsers = async () => {
    setLoadingUsers(true);
    const { data: usersData, error } = await supabase
      .from('users')
      .select('id, username, email, role, total_xp');
    if (!error && usersData) {
      setUsers(usersData);
    }
    setLoadingUsers(false);
  };

  // Admin action: Change user role
  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    setUpdatingUserId(userId);
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);
    setUpdatingUserId(null);
    if (error) {
      toast({
        title: 'Failed to update role',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Role updated',
      description: `User role changed to ${newRole}.`,
    });
    refreshUsers();
  };

  // Admin action: Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    setDeletingUserId(userId);
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    setDeletingUserId(null);
    if (error) {
      toast({
        title: 'Failed to delete user',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'User deleted',
      description: 'The user has been deleted.',
    });
    refreshUsers();
  };

  // Admin action: Delete challenge
  const handleDeleteChallenge = async (challengeId: string) => {
    // First check if challenge has submissions
    const { data: submissions, error: subError } = await supabase
      .from('submissions')
      .select('id')
      .eq('challenge_id', challengeId);

    if (subError) {
      toast({
        title: 'Error checking submissions',
        description: subError.message,
        variant: 'destructive',
      });
      return;
    }

    if (submissions && submissions.length > 0) {
      const confirmMessage = `This challenge has ${submissions.length} submission(s). Deleting it will also delete all related submissions. Are you sure you want to continue?`;
      if (!window.confirm(confirmMessage)) return;
    } else {
      if (!window.confirm('Are you sure you want to delete this challenge? This cannot be undone.')) return;
    }

    setDeletingChallengeId(challengeId);

    // Delete the challenge (submissions will be cascade deleted if foreign key is set up)
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', challengeId);

    setDeletingChallengeId(null);

    if (error) {
      toast({
        title: 'Failed to delete challenge',
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Challenge deleted',
      description: 'The challenge has been deleted successfully.',
    });

    // Refresh challenges list
    refreshChallenges();
  };

  // Edit challenge functions
  const handleEditChallenge = (challenge: any) => {
    setEditingChallenge({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      difficulty: challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1),
      xpReward: challenge.xp_reward,
      imageUrl: challenge.image || '',
      requirements: challenge.requirements ? challenge.requirements.split('; ').filter((r: string) => r.trim()) : ['']
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChallenge.title || !editingChallenge.description) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase
      .from('challenges')
      .update({
        title: editingChallenge.title,
        description: editingChallenge.description,
        difficulty: editingChallenge.difficulty.toLowerCase(),
        xp_reward: editingChallenge.xpReward,
        image: editingChallenge.imageUrl,
        requirements: editingChallenge.requirements.join('; ')
      })
      .eq('id', editingChallenge.id);

    if (error) {
      console.error('Update challenge error:', error);
      toast({
        title: "Failed to update challenge",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Challenge updated",
      description: "The challenge has been successfully updated.",
    });

    setIsEditDialogOpen(false);
    setEditingChallenge(null);
    refreshChallenges();
  };

  const updateEditingRequirement = (index: number, value: string) => {
    const updated = [...editingChallenge.requirements];
    updated[index] = value;
    setEditingChallenge({
      ...editingChallenge,
      requirements: updated
    });
  };

  const addEditingRequirement = () => {
    setEditingChallenge({
      ...editingChallenge,
      requirements: [...editingChallenge.requirements, '']
    });
  };

  const removeEditingRequirement = (index: number) => {
    if (editingChallenge.requirements.length > 1) {
      const updated = editingChallenge.requirements.filter((_: string, i: number) => i !== index);
      setEditingChallenge({
        ...editingChallenge,
        requirements: updated
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Manage challenges, submissions, and users
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <Clock className="w-8 h-8 text-yellow-500" />
              <p className="text-gray-600 mt-1 mb-0">Pending Reviews</p>
              <p className="text-2xl font-bold mt-0 mb-0">{pendingSubmissions.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <FileText className="w-8 h-8 text-blue-500" />
              <p className="text-gray-600 mt-1 mb-0">Total Challenges</p>
              <p className="text-2xl font-bold mt-0 mb-0">{challenges.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <Users className="w-8 h-8 text-green-500" />
              <p className="text-gray-600 mt-1 mb-0">Active Users</p>
              <p className="text-2xl font-bold mt-0 mb-0">{users.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex flex-col items-center">
              <CheckCircle className="w-8 h-8 text-purple-500" />
              <p className="text-gray-600 mt-1 mb-0">Admin Users</p>
              <p className="text-2xl font-bold mt-0 mb-0">{users.filter(u => u.role === 'admin').length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="submissions" className="space-y-4">
          <TabsList className="flex gap-3 bg-transparent p-0 mb-4">
            <TabsTrigger value="submissions" className="admin-tabs-trigger">
              Pending Submissions
            </TabsTrigger>
            <TabsTrigger value="create-challenge" className="admin-tabs-trigger">
              Create Challenge
            </TabsTrigger>
            <TabsTrigger value="manage-challenges" className="admin-tabs-trigger">
              Manage Challenges
            </TabsTrigger>
            <TabsTrigger value="badges" className="admin-tabs-trigger">
              Badge Management
            </TabsTrigger>
            <TabsTrigger value="users" className="admin-tabs-trigger">
              Manage Users
            </TabsTrigger>
          </TabsList>

          {/* Pending Submissions */}
          <TabsContent value="submissions">
            <Card>
              <CardHeader>
                <CardTitle>Pending Submissions</CardTitle>
                <CardDescription>
                  Review and approve or reject user submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSubmissions ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Loading pending submissions...</p>
                  </div>
                ) : pendingSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {pendingSubmissions.map((submission) => {
                      const challenge = challenges.find(c => c.id === submission.challenge_id);
                      return (
                        <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-semibold text-lg">{challenge?.title || 'Unknown Challenge'}</h3>
                              <p className="text-gray-600">
                                From {submission.users?.username || 'Unknown User'} - {submission.user_id}
                              </p>
                              <p className="text-sm text-gray-500">
                                {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : ''}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {challenge?.difficulty || 'Unknown'}
                            </Badge>
                          </div>
                          <div className="mb-4">
                            <Label className="text-sm font-medium">Solution URL:</Label>
                            <div className="flex items-center space-x-2 mt-1">
                              <Input value={submission.submission_url} readOnly />
                              <Button variant="outline" size="sm" asChild>
                                <a href={submission.submission_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </Button>
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4">
                            <Button 
                              onClick={() => handleApproveSubmission(submission.id)}
                              className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              variant="destructive"
                              onClick={() => handleRejectSubmission(submission.id)}
                              className="shadow-sm"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No pending submissions</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Create Challenge */}
          <TabsContent value="create-challenge">
            <Card>
              <CardHeader>
                <CardTitle>Create New Challenge</CardTitle>
                <CardDescription>
                  Add a new challenge for users to complete
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateChallenge} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Challenge Title</Label>
                      <Input
                        id="title"
                        value={newChallenge.title}
                        onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                        placeholder="Enter challenge title"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">Image URL</Label>
                      <Input
                        id="imageUrl"
                        type="url"
                        value={newChallenge.imageUrl}
                        onChange={(e) => setNewChallenge({...newChallenge, imageUrl: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newChallenge.description}
                      onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                      placeholder="Describe the challenge and what users need to build"
                      rows={4}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select 
                        value={newChallenge.difficulty} 
                        onValueChange={(value: 'Beginner' | 'Intermediate' | 'Expert') => 
                          setNewChallenge({...newChallenge, difficulty: value})
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="xpReward">XP Reward</Label>
                      <Input
                        id="xpReward"
                        type="number"
                        min="50"
                        max="1000"
                        step="50"
                        value={newChallenge.xpReward}
                        onChange={(e) => setNewChallenge({...newChallenge, xpReward: parseInt(e.target.value)})}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Requirements</Label>
                    <div className="space-y-2 mt-2">
                      {newChallenge.requirements.map((req, index) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            value={req}
                            onChange={(e) => updateRequirement(index, e.target.value)}
                            placeholder={`Requirement ${index + 1}`}
                          />
                          {newChallenge.requirements.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeRequirement(index)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addRequirement}
                        className="mt-2 text-sm border-[#30363d] bg-[#161b22] hover:bg-[#23272e] text-[#c9d1d9]"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Requirement
                      </Button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full mt-4 bg-gradient-to-r from-purple-700 to-blue-700 text-white shadow-md hover:from-purple-600 hover:to-blue-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Challenge
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Challenges */}
          <TabsContent value="manage-challenges">
            <Card>
              <CardHeader>
                <CardTitle>Manage Challenges</CardTitle>
                <CardDescription>
                  View, edit, and delete existing challenges
                </CardDescription>
              </CardHeader>
              <CardContent>
                {challenges.length > 0 ? (
                  <div className="space-y-4">
                    {challenges.map((challenge) => (
                      <div key={challenge.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{challenge.title}</h3>
                            <p className="text-gray-600 text-sm mb-2">
                              {challenge.description?.length > 100
                                ? `${challenge.description.substring(0, 100)}...`
                                : challenge.description}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <Badge variant="secondary">
                                {challenge.difficulty || 'Unknown'}
                              </Badge>
                              <span>{challenge.xp_reward || 0} XP</span>
                              <span>
                                Created: {challenge.created_at ? new Date(challenge.created_at).toLocaleDateString() : 'Unknown'}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditChallenge(challenge)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteChallenge(challenge.id)}
                              disabled={deletingChallengeId === challenge.id}
                            >
                              {deletingChallengeId === challenge.id ? (
                                <>
                                  <Clock className="w-4 h-4 mr-1 animate-spin" />
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No challenges found</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Edit Challenge Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Challenge</DialogTitle>
                <DialogDescription>
                  Update the challenge details below
                </DialogDescription>
              </DialogHeader>
              {editingChallenge && (
                <form onSubmit={handleUpdateChallenge} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-title">Challenge Title</Label>
                      <Input
                        id="edit-title"
                        value={editingChallenge.title}
                        onChange={(e) => setEditingChallenge({...editingChallenge, title: e.target.value})}
                        placeholder="Enter challenge title"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-imageUrl">Image URL</Label>
                      <Input
                        id="edit-imageUrl"
                        type="url"
                        value={editingChallenge.imageUrl}
                        onChange={(e) => setEditingChallenge({...editingChallenge, imageUrl: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={editingChallenge.description}
                      onChange={(e) => setEditingChallenge({...editingChallenge, description: e.target.value})}
                      placeholder="Describe the challenge and what users need to build"
                      rows={4}
                      required
                      className="mt-1"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-difficulty">Difficulty</Label>
                      <Select
                        value={editingChallenge.difficulty}
                        onValueChange={(value: 'Beginner' | 'Intermediate' | 'Expert') =>
                          setEditingChallenge({...editingChallenge, difficulty: value})
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="Expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-xpReward">XP Reward</Label>
                      <Input
                        id="edit-xpReward"
                        type="number"
                        min="50"
                        max="1000"
                        step="50"
                        value={editingChallenge.xpReward}
                        onChange={(e) => setEditingChallenge({...editingChallenge, xpReward: parseInt(e.target.value)})}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Requirements</Label>
                    <div className="space-y-2 mt-2">
                      {editingChallenge.requirements.map((req: string, index: number) => (
                        <div key={index} className="flex space-x-2">
                          <Input
                            value={req}
                            onChange={(e) => updateEditingRequirement(index, e.target.value)}
                            placeholder={`Requirement ${index + 1}`}
                          />
                          {editingChallenge.requirements.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeEditingRequirement(index)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addEditingRequirement}
                        className="mt-2 text-sm border-[#30363d] bg-[#161b22] hover:bg-[#23272e] text-[#c9d1d9]"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Requirement
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsEditDialogOpen(false);
                        setEditingChallenge(null);
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-700 to-blue-700 text-white shadow-md hover:from-purple-600 hover:to-blue-600"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Update Challenge
                    </Button>
                  </div>
                </form>
              )}
            </DialogContent>
          </Dialog>

          {/* Manage Users */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  View and manage user accounts and roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingUsers ? (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Loading users...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h3 className="font-semibold">{user.username}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-purple-600 font-medium">{user.total_xp} XP</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(user.id, value as 'user' | 'admin')}
                            disabled={updatingUserId === user.id}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deletingUserId === user.id}
                          >
                            {deletingUserId === user.id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Badge Management */}
          <TabsContent value="badges">
            <BadgeManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}