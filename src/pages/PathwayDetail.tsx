import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, ArrowLeft, Clock, Trophy, CheckCircle2, Circle, BookOpen, Target } from 'lucide-react';
import { PathwayDetailSkeleton } from '@/components/skeletons/PathwayDetailSkeleton';
import { handleError } from '@/lib/errorHandling';
import type { Pathway, PathwayModule, Challenge, PathwayEnrollment, ChallengeCompletion } from '@/types';

interface PathwayWithModules extends Pathway {
  modules: Array<PathwayModule & {
    challenges: Challenge[];
  }>;
}

interface EnrollmentWithProgress extends PathwayEnrollment {
  completed_challenges: number;
  total_challenges: number;
}

export function PathwayDetail() {
  const { pathwayId } = useParams<{ pathwayId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [pathway, setPathway] = useState<PathwayWithModules | null>(null);
  const [enrollment, setEnrollment] = useState<EnrollmentWithProgress | null>(null);
  const [completedChallenges, setCompletedChallenges] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    fetchPathwayDetails();
  }, [pathwayId, user]);

  const fetchPathwayDetails = async () => {
    if (!pathwayId) return;

    try {
      setLoading(true);

      // Fetch pathway
      const { data: pathwayData, error: pathwayError } = await supabase
        .from('pathways')
        .select('*')
        .eq('id', pathwayId)
        .single();

      if (pathwayError) throw pathwayError;

      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('pathway_modules')
        .select('*')
        .eq('pathway_id', pathwayId)
        .order('sequence_order', { ascending: true });

      if (modulesError) throw modulesError;

      // Fetch challenges for each module
      const modulesWithChallenges = await Promise.all(
        (modulesData || []).map(async (module) => {
          const { data: challenges, error: challengesError } = await supabase
            .from('challenges')
            .select('*')
            .eq('module_id', module.id)
            .eq('status', 'published');

          if (challengesError) {
            console.error('Error fetching challenges:', challengesError);
            return { ...module, challenges: [] };
          }

          return { ...module, challenges: challenges || [] };
        })
      );

      setPathway({
        ...pathwayData,
        modules: modulesWithChallenges,
      });

      // If user is logged in, fetch enrollment and progress
      if (user) {
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('pathway_enrollments')
          .select('*')
          .eq('user_id', user.id)
          .eq('pathway_id', pathwayId)
          .maybeSingle();

        if (enrollmentError && enrollmentError.code !== 'PGRST116') {
          console.error('Error fetching enrollment:', enrollmentError);
        }

        if (enrollmentData) {
          // Fetch completed challenges
          const allChallengeIds = modulesWithChallenges.flatMap(m => m.challenges.map((c: Challenge) => c.id));

          const { data: completions, error: completionsError } = await supabase
            .from('challenge_completions')
            .select('challenge_id')
            .eq('user_id', user.id)
            .in('challenge_id', allChallengeIds);

          if (completionsError) {
            console.error('Error fetching completions:', completionsError);
          }

          const completedIds = new Set(completions?.map(c => c.challenge_id) || []);
          setCompletedChallenges(completedIds);

          setEnrollment({
            ...enrollmentData,
            completed_challenges: completedIds.size,
            total_challenges: allChallengeIds.length,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching pathway details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pathway details.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to enroll in this pathway.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    if (!pathwayId) return;

    setEnrolling(true);

    try {
      const { error } = await supabase
        .from('pathway_enrollments')
        .insert({
          user_id: user.id,
          pathway_id: pathwayId,
          status: 'active',
          progress: 0,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: 'Already Enrolled',
            description: 'You are already enrolled in this pathway.',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: 'Enrolled!',
          description: 'You have successfully enrolled in this pathway.',
        });
        await fetchPathwayDetails();
      }
    } catch (error) {
      console.error('Error enrolling:', error);
      toast({
        title: 'Error',
        description: 'Failed to enroll. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setEnrolling(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-orange-500';
      case 'expert':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (loading) {
    return <PathwayDetailSkeleton />;
  }

  if (!pathway) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Pathway not found</h2>
          <Button onClick={() => navigate('/pathways')} className="bg-purple-600 hover:bg-purple-700">
            Browse Pathways
          </Button>
        </div>
      </div>
    );
  }

  const totalChallenges = pathway.modules.reduce((sum, m) => sum + m.challenges.length, 0);
  const progressPercentage = enrollment
    ? (enrollment.completed_challenges / enrollment.total_challenges) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/pathways')}
          className="text-gray-300 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pathways
        </Button>

        {/* Header Card */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <Badge className={`${getDifficultyColor(pathway.difficulty)} text-white`}>
                {pathway.difficulty}
              </Badge>
              {enrollment && (
                <Badge className="bg-blue-500 text-white">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Enrolled
                </Badge>
              )}
            </div>

            <CardTitle className="text-3xl text-white mb-4">{pathway.title}</CardTitle>
            <CardDescription className="text-gray-300 text-base">
              {pathway.description}
            </CardDescription>

            <div className="flex items-center gap-6 mt-6 text-gray-400">
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                <span>
                  {Math.floor((pathway.estimated_time || 0) / 60)}h {(pathway.estimated_time || 0) % 60}m
                </span>
              </div>
              <div className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                <span>{pathway.total_xp} XP</span>
              </div>
              <div className="flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                <span>{totalChallenges} Challenges</span>
              </div>
            </div>

            {/* Progress Bar (if enrolled) */}
            {enrollment && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-400">Your Progress</span>
                  <span className="text-sm font-semibold text-white">
                    {enrollment.completed_challenges} / {enrollment.total_challenges} completed
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-3" />
              </div>
            )}

            {/* Enroll Button (if not enrolled) */}
            {!enrollment && (
              <Button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-lg py-6"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    <Target className="w-5 h-5 mr-2" />
                    Enroll in Pathway
                  </>
                )}
              </Button>
            )}
          </CardHeader>
        </Card>

        {/* Modules & Challenges */}
        <div className="space-y-6">
          {pathway.modules.map((module, moduleIndex) => (
            <Card key={module.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center">
                  <span className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-sm">
                    {moduleIndex + 1}
                  </span>
                  {module.title}
                </CardTitle>
                <CardDescription className="text-gray-300 ml-11">
                  {module.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="ml-11 space-y-3">
                {module.challenges.length === 0 ? (
                  <p className="text-gray-500 italic">No challenges in this module yet.</p>
                ) : (
                  module.challenges.map((challenge) => {
                    const isCompleted = completedChallenges.has(challenge.id);

                    return (
                      <div
                        key={challenge.id}
                        className="flex items-center justify-between p-4 bg-gray-700 rounded-lg hover:bg-gray-650 transition-colors cursor-pointer"
                        onClick={() => navigate(`/challenge/${challenge.id}`)}
                      >
                        <div className="flex items-center flex-1">
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5 text-green-400 mr-3" />
                          ) : (
                            <Circle className="w-5 h-5 text-gray-500 mr-3" />
                          )}

                          <div className="flex-1">
                            <h4 className="text-white font-medium">{challenge.title}</h4>
                            <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
                              <Badge className={`${getDifficultyColor(challenge.difficulty)} text-white text-xs`}>
                                {challenge.difficulty}
                              </Badge>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {challenge.estimated_time}m
                              </span>
                              <span className="flex items-center">
                                <Trophy className="w-3 h-3 mr-1" />
                                {challenge.xp_reward} XP
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          className={
                            isCompleted
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-purple-600 hover:bg-purple-700'
                          }
                        >
                          {isCompleted ? 'Review' : 'Start'}
                        </Button>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
