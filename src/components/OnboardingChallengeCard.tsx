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
  const [nextStep, setNextStep] = useState(1);

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
        setNextStep(1);
        return;
      }

      // Fetch onboarding progress
      const { data: progress, error: progressError } = await supabase.functions.invoke('get-onboarding-progress');
      // Fetch onboarding steps
      const { data: stepsData, error: stepsError } = await supabase.functions.invoke('get-onboarding-steps');
      const steps = stepsData?.steps || [];
      const maxStep = steps.length > 0 ? Math.max(...steps.map((s: any) => s.step_number)) : 1;
      const latestCompletedStep = progress?.latest_completed_step ?? 0;
      const next = latestCompletedStep + 1;
      setNextStep(next > maxStep ? maxStep : next);
      setIsCompleted(latestCompletedStep >= maxStep);
    } catch (error) {
      console.error('Error checking onboarding completion:', error);
      setIsCompleted(false);
      setNextStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonLink = isCompleted ? "/onboarding/complete" : `/onboarding/${nextStep}`;
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
              <CardDescription className="text-purple-100 text-base leading-relaxed text-left">
                {description
                  ? description.split(/\r?\n+/).map((para, idx) => (
                      para.trim() && <p key={idx} className="mb-2">{para}</p>
                    ))
                  : null}
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
              size="lg"
              className={`${isCompleted ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white text-purple-700 hover:bg-purple-50'} font-semibold shadow-lg hover:shadow-xl transition-all duration-200 border-0 min-w-[140px] h-12`}
              disabled={isLoading}
              onClick={() => {
                if (!isLoading) {
                  window.location.href = buttonLink;
                }
              }}
            >
              {isLoading ? 'Loading...' : buttonText}
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
