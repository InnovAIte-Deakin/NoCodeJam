import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Star, CheckCircle, Clock, User, ExternalLink, Send } from 'lucide-react';

export function ChallengeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [solutionUrl, setSolutionUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [challenge, setChallenge] = useState<any>(null);
  const [userSubmission, setUserSubmission] = useState<any>(null);
  const [approvedSubmissions, setApprovedSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch challenge
      const { data: challengeData } = await supabase
        .from('challenges')
        .select('*')
        .eq('id', id)
        .single();
      setChallenge(challengeData);
      // Fetch submissions for this challenge
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select('*')
        .eq('challenge_id', id);
      if (user && submissionsData) {
        setUserSubmission(submissionsData.find((s: any) => s.user_id === user.id) || null);
      } else {
        setUserSubmission(null);
      }
      setApprovedSubmissions(submissionsData ? submissionsData.filter((s: any) => s.status === 'approved') : []);
      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-lg text-gray-500">Loading challenge...</div>;
  }

  if (!challenge) {
    return <Navigate to="/challenges" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!solutionUrl.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid solution URL.",
        variant: "destructive",
      });
      return;
    }
    // Basic URL validation
    try {
      new URL(solutionUrl);
    } catch {
      toast({
        title: "Invalid URL",
        description: "Please provide a valid URL starting with http:// or https://",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    // Insert submission into Supabase
    const { error } = await supabase.from('submissions').insert([
      {
        user_id: user.id,
        challenge_id: id,
        submission_url: solutionUrl,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      }
    ]);
    setIsSubmitting(false);
    if (error) {
      toast({
        title: "Submission failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Solution submitted!",
      description: "Your solution has been submitted for review. You'll be notified once it's reviewed.",
    });
    setSolutionUrl('');
    // Refresh submissions
    const { data: submissionsData } = await supabase
      .from('submissions')
      .select('*')
      .eq('challenge_id', id);
    if (user && submissionsData) {
      setUserSubmission(submissionsData.find(s => s.user_id === user.id) || null);
    }
    setApprovedSubmissions(submissionsData ? submissionsData.filter(s => s.status === 'approved') : []);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Parse requirements string to array
  const requirementsArr = challenge.requirements ? (challenge.requirements as string).split(';').map((r: string) => r.trim()).filter((r: string) => Boolean(r)) : [];

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Challenge Header */}
        <Card className="mb-8 overflow-hidden">
          <div className="relative">
            <img
              src={challenge.image}
              alt={challenge.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-end">
              <div className="p-6 text-white">
                <div className="flex items-center space-x-3 mb-2">
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium">{challenge.xp_reward} XP</span>
                  </div>
                </div>
                <h1 className="text-3xl font-bold">{challenge.title}</h1>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Challenge Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {challenge.description}
                </p>
                <h3 className="font-semibold text-gray-900 mb-3">Requirements:</h3>
                <ul className="space-y-2">
                  {requirementsArr.map((req: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            {/* Submit Solution */}
            {!userSubmission && (
              <Card>
                <CardHeader>
                  <CardTitle>Submit Your Solution</CardTitle>
                  <CardDescription>
                    Share the URL of your completed solution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="solutionUrl">Solution URL</Label>
                      <Input
                        id="solutionUrl"
                        type="url"
                        value={solutionUrl}
                        onChange={(e) => setSolutionUrl(e.target.value)}
                        placeholder="https://your-solution.com"
                        required
                        className="mt-1"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Provide a live URL where your solution can be viewed and tested
                      </p>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Solution
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
            {/* User's Submission Status */}
            {userSubmission && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {userSubmission.status === 'approved' ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                    <span>Your Submission</span>
                  </CardTitle>
                  <CardDescription>
                    Submitted on {userSubmission.submitted_at ? new Date(userSubmission.submitted_at).toLocaleDateString() : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge
                        variant={userSubmission.status === 'approved' ? 'default' : 
                               userSubmission.status === 'pending' ? 'secondary' : 'destructive'}
                      >
                        {userSubmission.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Solution URL:</span>
                      <Button variant="outline" size="sm" asChild>
                        <a href={userSubmission.submission_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </a>
                      </Button>
                    </div>
                    {userSubmission.admin_feedback && (
                      <div>
                        <span className="font-medium">Feedback:</span>
                        <p className="text-gray-700 mt-1 p-3 bg-gray-50 rounded-lg">
                          {userSubmission.admin_feedback}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Challenge Info */}
            <Card>
              <CardHeader>
                <CardTitle>Challenge Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <Badge className={getDifficultyColor(challenge.difficulty)}>
                    {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">XP Reward:</span>
                  <span className="font-medium text-purple-600">{challenge.xp_reward} XP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span>{challenge.created_at ? new Date(challenge.created_at).toLocaleDateString() : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Submissions:</span>
                  <span>{approvedSubmissions.length} approved</span>
                </div>
              </CardContent>
            </Card>
            {/* Approved Solutions */}
            {approvedSubmissions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Community Solutions</CardTitle>
                  <CardDescription>
                    Approved submissions from other developers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {approvedSubmissions.slice(0, 5).map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium">User Solution</span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={submission.submission_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}