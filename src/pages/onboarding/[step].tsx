import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OnboardingProgressBar } from '@/components/OnboardingProgressBar';
import { OnboardingSubmissionForm } from '@/components/OnboardingSubmissionForm';
import { OnboardingCompleteScreen } from '@/components/OnboardingCompleteScreen';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface OnboardingStep {
  id: number;
  step_number: number;
  title: string;
  description: string;
  prompt_instructions: string;
  video_url: string | null;
  submission_type: 'url' | 'text' | null;
  submission_label: string | null;
  created_at: string;
  updated_at: string;
}

export default function OnboardingStepPage() {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  
  // State for data fetching
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for submission handling
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  
  // State for completion
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  
  // State for progress tracking
  const [userProgress, setUserProgress] = useState<{
    completedStepIds: number[];
    allSubmittedStepIds: number[];
    highestCompletedStep: number;
    currentStepNumber: number;
    challengeId: number;
  } | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  
  // Parse the step number from the URL
  const currentStep = parseInt(step || '1', 10);
  const totalSteps = steps.length;
  
  // Find the current step data
  const currentStepData = steps.find(s => s.step_number === currentStep);
  
  // Check if current step is already completed
  const isCurrentStepCompleted = userProgress?.completedStepIds.includes(currentStepData?.id || 0) || false;
  
  // Check if current step has been submitted (but may not be completed yet)
  const isCurrentStepSubmitted = userProgress?.allSubmittedStepIds.includes(currentStepData?.id || 0) || false;
  
  // Check if we're on the last step and all steps are completed
  const isLastStep = currentStep === totalSteps;
  const allStepsCompleted = userProgress?.completedStepIds.length === totalSteps;

  // Fetch onboarding steps data
  useEffect(() => {
    const fetchOnboardingData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the current user's session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error('Authentication required');
        }

        if (!session) {
          throw new Error('Please log in to access onboarding');
        }

        // Fetch both steps and progress in parallel
        const [stepsResponse, progressResponse] = await Promise.all([
          // Fetch onboarding steps
          supabase.functions.invoke('get-onboarding-steps', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }),
          // Fetch user progress
          supabase.functions.invoke('get-onboarding-progress', {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          })
        ]);

        // Handle steps response
        if (stepsResponse.error) {
          throw new Error(stepsResponse.error.message || 'Failed to fetch onboarding steps');
        }

        if (stepsResponse.data?.error) {
          throw new Error(stepsResponse.data.error);
        }

        const stepsData = stepsResponse.data?.steps || [];
        setSteps(stepsData);

        // Handle progress response
        if (progressResponse.error) {
          console.warn('Failed to fetch progress:', progressResponse.error);
          // Don't throw here - progress is optional
        } else if (progressResponse.data?.error) {
          console.warn('Progress error:', progressResponse.data.error);
        } else {
          const progressData = progressResponse.data;
          setUserProgress({
            completedStepIds: progressData.completedStepIds || [],
            allSubmittedStepIds: progressData.allSubmittedStepIds || [],
            highestCompletedStep: progressData.highestCompletedStep || 0,
            currentStepNumber: progressData.currentStepNumber || 1,
            challengeId: progressData.challengeId
          });

          // Auto-redirect logic: if user is on a step they should skip
          const urlStep = parseInt(step || '1', 10);
          const recommendedStep = progressData.currentStepNumber || 1;
          
          if (urlStep < recommendedStep && stepsData.length > 0) {
            // User is trying to access a step they've already completed
            // Redirect them to their current step
            navigate(`/onboarding/${recommendedStep}`, { replace: true });
            return; // Exit early since we're redirecting
          }

          // Check if current step is already completed for form state
          const currentStepInData = stepsData.find((s: any) => s.step_number === urlStep);
          if (currentStepInData && progressData.completedStepIds?.includes(currentStepInData.id)) {
            // Step is already completed - form should show as submitted
          }
        }

      } catch (err) {
        console.error('Error fetching onboarding data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
        setProgressLoading(false);
      }
    };

    fetchOnboardingData();
  }, [step, navigate]);

  // Navigation handlers
  const handlePrevious = () => {
    if (currentStep > 1) {
      navigate(`/onboarding/${currentStep - 1}`);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      navigate(`/onboarding/${currentStep + 1}`);
    }
  };

  // Submission handler
  const handleStepSubmission = async (submissionData: { url?: string; text?: string }) => {
    if (!currentStepData || !userProgress) return;
    
    try {
      setIsSubmitting(true);
      setSubmissionError(null);

      // Get the current user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Authentication required');
      }

      // Call the Edge Function to submit the step
      const { data, error: functionError } = await supabase.functions.invoke('submit-onboarding-step', {
        body: {
          challengeId: userProgress.challengeId,
          stepId: currentStepData.id,
          submissionData,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to submit step');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Update local progress state - add to submitted steps immediately
      setUserProgress(prev => prev ? {
        ...prev,
        // Add current step to submitted steps (if not already there)
        allSubmittedStepIds: prev.allSubmittedStepIds.includes(currentStepData.id) 
          ? prev.allSubmittedStepIds 
          : [...prev.allSubmittedStepIds, currentStepData.id],
        // Only update if this step moves us forward
        currentStepNumber: Math.max(prev.currentStepNumber, currentStep)
      } : null);
      
      console.log('Step submitted successfully:', data);
      
      // Check if this was the last step - trigger completion
      if (currentStep === totalSteps) {
        await handleOnboardingCompletion();
      }
      
    } catch (err) {
      console.error('Error submitting step:', err);
      setSubmissionError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Completion handler for when all steps are done
  const handleOnboardingCompletion = async () => {
    if (!userProgress) return;
    
    try {
      setIsCompleting(true);
      setCompletionError(null);

      // Get the current user's session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        throw new Error('Authentication required');
      }

      // Call the completion Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('complete-onboarding', {
        body: {
          challengeId: userProgress.challengeId,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (functionError) {
        throw new Error(functionError.message || 'Failed to complete onboarding');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      // Mark as completed
      setIsCompleted(true);
      
      console.log('Onboarding completed successfully:', data);
      
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setCompletionError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsCompleting(false);
    }
  };

  // Helper function to extract YouTube video ID from URL
  const getYouTubeVideoId = (url: string): string | null => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  return (
    <>
      {/* Show completion screen if onboarding is completed */}
      {isCompleted ? (
        <OnboardingCompleteScreen 
          challengeTitle="NoCodeJam Onboarding"
          totalSteps={totalSteps}
        />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              NoCodeJam Onboarding
            </h1>
            <p className="text-gray-600">
              Let's get you started with no-code development!
            </p>
          </div>
          
          {/* Progress Bar - only show when data is loaded */}
          {!loading && totalSteps > 0 && (
            <OnboardingProgressBar 
              currentStep={currentStep} 
              totalSteps={totalSteps} 
            />
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 mb-8">
          <Card className="max-w-4xl mx-auto shadow-lg">
            <CardContent className="p-8">
              {loading ? (
                // Loading State
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Loading Onboarding Steps...
                  </h2>
                  <p className="text-gray-600">
                    Please wait while we prepare your learning journey.
                  </p>
                </div>
              ) : error ? (
                // Error State
                <div className="text-center py-12">
                  <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-500" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Unable to Load Content
                  </h2>
                  <p className="text-gray-600 mb-4">
                    {error}
                  </p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              ) : !currentStepData ? (
                // Step Not Found
                <div className="text-center py-12">
                  <AlertCircle className="w-8 h-8 mx-auto mb-4 text-amber-500" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Step Not Found
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Step {currentStep} doesn't exist. Please check the URL or go back to step 1.
                  </p>
                  <Button 
                    onClick={() => navigate('/onboarding/1')} 
                    variant="outline"
                  >
                    Go to Step 1
                  </Button>
                </div>
              ) : (
                // Step Content
                <div>
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                      {currentStepData.title}
                    </h2>
                    <p className="text-gray-600 text-lg">
                      {currentStepData.description}
                    </p>
                  </div>

                  {/* Video Content */}
                  {currentStepData.video_url && (
                    <div className="mb-8">
                      {(() => {
                        const videoId = getYouTubeVideoId(currentStepData.video_url);
                        return videoId ? (
                          <div className="aspect-video w-full max-w-3xl mx-auto">
                            <iframe
                              className="w-full h-full rounded-lg shadow-lg"
                              src={`https://www.youtube.com/embed/${videoId}`}
                              title={currentStepData.title}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        ) : (
                          <div className="bg-gray-100 rounded-lg p-6 text-center max-w-3xl mx-auto">
                            <p className="text-gray-600">
                              Video URL format not supported. 
                              <a 
                                href={currentStepData.video_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-purple-600 hover:underline ml-1"
                              >
                                View video here
                              </a>
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Instructions Content */}
                  {currentStepData.prompt_instructions && (
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold text-white mb-3">
                        Instructions
                      </h3>
                      <div className="prose prose-white max-w-none">
                        <p className="text-white whitespace-pre-wrap font-medium">
                          {currentStepData.prompt_instructions}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Submission Form */}
                  {currentStepData.submission_type && currentStepData.submission_label && (
                    <div className="mb-6">
                      <OnboardingSubmissionForm
                        submissionType={currentStepData.submission_type}
                        submissionLabel={currentStepData.submission_label}
                        onSubmit={handleStepSubmission}
                        isSubmitting={isSubmitting || isCompleting}
                        isSubmitted={isCurrentStepSubmitted || isCurrentStepCompleted}
                      />
                      
                      {/* Submission Error Display */}
                      {submissionError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">Submission Error</span>
                          </div>
                          <p className="text-red-700 text-sm mt-1">{submissionError}</p>
                        </div>
                      )}
                      
                      {/* Completion Error Display */}
                      {completionError && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-red-600">
                            <AlertCircle className="w-5 h-5" />
                            <span className="font-medium">Completion Error</span>
                          </div>
                          <p className="text-red-700 text-sm mt-1">{completionError}</p>
                        </div>
                      )}
                      
                      {/* Completion Loading Display */}
                      {isCompleting && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center space-x-2 text-blue-600">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="font-medium">Completing Onboarding...</span>
                          </div>
                          <p className="text-blue-700 text-sm mt-1">
                            Please wait while we finalize your onboarding submission.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step Indicator */}
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                      <span className="text-2xl font-bold text-purple-600">
                        {currentStep}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Footer Navigation - only show when content is loaded */}
        {!loading && !error && currentStepData && (
          <footer className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              {/* Previous Button */}
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </Button>

              {/* Step Indicator */}
              <div className="text-sm text-gray-500">
                Step {currentStep} of {totalSteps}
              </div>

              {/* Next Button */}
              <Button
                onClick={handleNext}
                disabled={
                  currentStep === totalSteps || 
                  (currentStepData?.submission_type && !(isCurrentStepSubmitted || isCurrentStepCompleted))
                }
                className="flex items-center space-x-2"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Additional Footer Info */}
            <div className="text-center mt-6 text-sm text-gray-500">
              <p>
                Need help? Check out our{' '}
                <a href="/learn" className="text-purple-600 hover:underline">
                  learning resources
                </a>{' '}
                or{' '}
                <a href="/support" className="text-purple-600 hover:underline">
                  contact support
                </a>
                .
              </p>
            </div>
          </footer>
        )}
      </div>
    </div>
      )}
    </>
  );
}
