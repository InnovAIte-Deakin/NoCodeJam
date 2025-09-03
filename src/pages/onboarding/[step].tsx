import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { OnboardingProgressBar } from '@/components/OnboardingProgressBar';
import { OnboardingCompleteScreen } from '@/components/OnboardingCompleteScreen';
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, Download } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { getOnboardingProgress, updateOnboardingProgress, verifyOnboardingStep } from '@/services/onboardingService';

interface OnboardingStep {
  id: number;
  step_number: number;
  title: string;
  description: string;
  prompt_instructions: string;
  video_url: string | null;
  submission_type: 'url' | 'text' | null;
  submission_label: string | null;
  download_url: string | null;
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
  
  // State for completion
  const [isCompleting, setIsCompleting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  
  // State for progress tracking
  const [latestCompletedStep, setLatestCompletedStep] = useState<number>(0);
  const [progressLoading, setProgressLoading] = useState(true);
  
  // State for verification
  const [verificationCode, setVerificationCode] = useState<string>('');
  const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(false);
  
  // Parse the step number from the URL
  const currentStep = parseInt(step || '1', 10);
  const totalSteps = steps.length;
  
  // Find the current step data
  const currentStepData = steps.find(s => s.step_number === currentStep);
  
  // Calculate current step number based on latest completed step
  const currentStepNumber = latestCompletedStep + 1;
  
  // Check if current step is already completed
  const isCurrentStepCompleted = currentStep <= latestCompletedStep;
  
  // Check if we're on the last step and all steps are completed
  const isLastStep = currentStep === totalSteps;
  const allStepsCompleted = latestCompletedStep >= totalSteps;

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
          // Fetch user progress using new service
          getOnboardingProgress()
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
        if (progressResponse) {
          setLatestCompletedStep(progressResponse.latest_completed_step);

          // Check if user has completed all steps
          const totalStepsFromData = stepsData.length;
          if (progressResponse.latest_completed_step >= totalStepsFromData) {
            // User has completed all steps, show completion screen
            setIsCompleted(true);
            setProgressLoading(false);
            return;
          }

          // Auto-redirect logic: if user is on a step they should skip
          const urlStep = parseInt(step || '1', 10);
          const recommendedStep = progressResponse.latest_completed_step + 1;

          if (urlStep <= progressResponse.latest_completed_step && stepsData.length > 0) {
            // User is trying to access a step they've already completed
            // Redirect them to their current step
            navigate(`/onboarding/${recommendedStep}`, { replace: true });
            return; // Exit early since we're redirecting
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

  // Check for completion after data is loaded
  useEffect(() => {
    if (!loading && !progressLoading && steps.length > 0 && latestCompletedStep >= steps.length) {
      setIsCompleted(true);
    }
  }, [loading, progressLoading, steps, latestCompletedStep]);

  // Navigation handlers
  const handlePrevious = () => {
    if (currentStep > 1) {
      navigate(`/onboarding/${currentStep - 1}`);
    }
  };

  const handleNextOrVerify = async () => {
    // If step requires verification and isn't completed yet
    if (currentStepData?.submission_type === 'text' && !isCurrentStepCompleted && !verificationSuccess) {
      await handleVerify();
      return;
    }
    
    // Otherwise, navigate to next step
    if (currentStep < totalSteps) {
      navigate(`/onboarding/${currentStep + 1}`);
    }
  };

  // Verification handler
  const handleVerify = async () => {
    if (!verificationCode.trim()) return;
    
    try {
      setVerificationLoading(true);
      setVerificationError(null);
      
      // Call the actual verification API
      const verificationResult = await verifyOnboardingStep(verificationCode);
      
      if (verificationResult.success) {
        setVerificationSuccess(true);
        
        // Update progress to mark this step as completed
        await updateOnboardingProgress(currentStep);
        setLatestCompletedStep(currentStep);
      } else {
        throw new Error(verificationResult.message || 'Verification failed');
      }
      
    } catch (err) {
      console.error('Verification error:', err);
      setVerificationError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerificationLoading(false);
    }
  };

  // Completion handler for when all steps are done
  const handleOnboardingCompletion = async () => {
    try {
      setIsCompleting(true);
      setCompletionError(null);

      // Mark as completed
      setIsCompleted(true);
      
      console.log('Onboarding completed successfully');
      
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
              latestCompletedStep={latestCompletedStep} 
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

                  {/* New structure for submission/verification */}
                  {currentStepData.submission_type === 'text' && (
                    <div className="mb-6">
                      {/* Download Button */}
                      {currentStepData.download_url && (
                        <div className="mb-4">
                          <a
                            href={currentStepData.download_url}
                            download
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors duration-200"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download Challenge Files
                          </a>
                        </div>
                      )}

                      {/* Verification Form */}
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
                            Verification Code
                          </label>
                          <Input
                            id="verification-code"
                            type="text"
                            placeholder="Enter your verification code"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            onFocus={() => setVerificationError(null)}
                            className={`w-full ${verificationError ? 'border-red-500 focus:border-red-500' : ''}`}
                            disabled={verificationLoading}
                          />
                          {verificationError && (
                            <p className="mt-1 text-sm text-red-600">{verificationError}</p>
                          )}
                        </div>

                        {/* Success State */}
                        {verificationSuccess && (
                          <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center space-x-2 text-green-700">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className="font-medium">Verification Successful!</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Note: We don't need a special case for submission_type === null, 
                      because the main "Next" button in the footer already handles navigation for view-only steps. */}

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

              {/* Next/Verify Button */}
              <Button
                onClick={handleNextOrVerify}
                disabled={
                  currentStep === totalSteps || 
                  (currentStepData?.submission_type === 'text' && !isCurrentStepCompleted && !verificationCode.trim() && !verificationSuccess) ||
                  verificationLoading
                }
                className="flex items-center space-x-2"
              >
                {verificationLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : currentStepData?.submission_type === 'text' && !isCurrentStepCompleted && !verificationSuccess ? (
                  <>
                    <span>Verify</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
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
