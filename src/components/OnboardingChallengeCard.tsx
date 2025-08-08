import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OnboardingVisibilityToggle } from './OnboardingVisibilityToggle';
import { PlayCircle, Sparkles, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface OnboardingChallengeCardProps {
  title: string;
  description: string;
  onHide: () => void;
}

export function OnboardingChallengeCard({ title, description, onHide }: OnboardingChallengeCardProps) {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkOnboardingCompletion();
  }, []);

  const checkOnboardingCompletion = async () => {
    try {
      setIsLoading(true);
      
      // Get user's current session to check auth status
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        setIsCompleted(false);
        return;
      }

      // Direct query to check user's onboarding submissions
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .select('id')
        .eq('challenge_type', 'onboarding')
        .single();

      if (challengeError || !challengeData) {
        setIsCompleted(false);
        return;
      }

      // Check user's submissions for this challenge
      const { data: submissions, error: submissionsError } = await supabase
        .from('submissions')
        .select('id, onboarding_step_id, status')
        .eq('user_id', session.user.id)
        .eq('challenge_id', challengeData.id)
        .in('status', ['pending', 'approved'])
        .not('onboarding_step_id', 'is', null);

      if (submissionsError) {
        console.error('Error checking submissions:', submissionsError);
        setIsCompleted(false);
        return;
      }

      // Count unique onboarding steps submitted (regardless of status)
      const uniqueSteps = new Set(submissions?.map(sub => sub.onboarding_step_id) || []);
      const completedStepsCount = uniqueSteps.size;
      
      // Check if user has completed all 3 steps
      setIsCompleted(completedStepsCount >= 3);
    } catch (error) {
      console.error('Error checking onboarding completion:', error);
      setIsCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonLink = isCompleted ? "/onboarding/complete" : "/onboarding/1";
  const buttonText = isCompleted ? "View Completion" : "Start Tutorial";
  const badgeText = isCompleted ? "Completed" : "Start Here";
  const badgeIcon = isCompleted ? CheckCircle : Sparkles;

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] group">
      
      {/* Start Here Banner */}
      <div className="absolute top-4 right-4 z-20">
        <Badge className={`${isCompleted ? 'bg-gradient-to-r from-green-400 to-emerald-400' : 'bg-gradient-to-r from-yellow-400 to-orange-400'} text-black font-bold px-3 py-1.5 shadow-lg ${isCompleted ? '' : 'animate-bounce'} border-0`}>
          {React.createElement(badgeIcon, { className: "w-3 h-3 mr-1" })}
          {badgeText}
        </Badge>
      </div>

      {/* Enhanced Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-black/20"></div>
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/15 transition-all duration-300"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-xl group-hover:bg-white/10 transition-all duration-300"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between space-x-4">
            {/* Hide Button - positioned on the left */}
            <div className="flex-shrink-0 pt-1">
              <OnboardingVisibilityToggle onHide={onHide} />
            </div>
            
            {/* Title and Description - positioned on the right with more space */}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl font-bold mb-3 text-white leading-tight">
                {title}
              </CardTitle>
              <CardDescription className="text-purple-100 text-base leading-relaxed">
                {description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-purple-100">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <PlayCircle className="w-4 h-4" />
                <span className="font-medium">3 Interactive Steps</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">500 XP Reward</span>
              </div>
            </div>
            
            <Button 
              asChild 
              size="lg" 
              className={`${isCompleted ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white text-purple-700 hover:bg-purple-50'} font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0 min-w-[140px] h-12`}
              disabled={isLoading}
            >
              <Link to={buttonLink} className="flex items-center justify-center">
                {isLoading ? 'Loading...' : buttonText}
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
