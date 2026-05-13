import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { BookOpen, ChevronLeft, ChevronRight, Map, Send, Sparkles, Trophy } from 'lucide-react';

interface StartHereOnboardingProps {
  starterChallenge?: {
    id: string;
    title: string;
  } | null;
  onSkip: () => void;
}

export function StartHereOnboarding({ starterChallenge, onSkip }: StartHereOnboardingProps) {
  const [open, setOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const challengeUrl = starterChallenge ? `/challenges/${starterChallenge.id}` : '/challenges';
  const submissionUrl = starterChallenge ? `/challenges/${starterChallenge.id}#submit-solution` : '/challenges';

  const steps = useMemo(
    () => [
      {
        title: 'Explore a Learning Pathway',
        description: 'Start by browsing the Learn area and choose a pathway that matches what you want to build.',
        href: '/learn',
        action: 'Open Pathways',
        icon: Map,
      },
      {
        title: 'Open a Challenge',
        description: starterChallenge
          ? `Try "${starterChallenge.title}" as a beginner-friendly first challenge.`
          : 'Browse the challenge library and pick a beginner-friendly challenge to start with.',
        href: challengeUrl,
        action: 'Open Challenge',
        icon: Trophy,
      },
      {
        title: 'Use AI Assist',
        description: 'Use AI Assist from the Challenges page when you need help choosing, understanding, or shaping a challenge.',
        href: '/challenges?aiAssist=true',
        action: 'Open AI Assist',
        icon: Sparkles,
      },
      {
        title: 'Submit Your First Challenge',
        description: 'When your work is ready, paste your solution URL into the submission form and send it for review.',
        href: submissionUrl,
        action: 'Go to Submission',
        icon: Send,
      },
    ],
    [challengeUrl, starterChallenge, submissionUrl]
  );

  const currentStep = steps[activeStep];
  const CurrentStepIcon = currentStep.icon;
  const progressValue = ((activeStep + 1) / steps.length) * 100;

  const handleSkip = () => {
    setOpen(false);
    onSkip();
  };

  return (
    <>
      <Card className="bg-gray-800 border-gray-700 mb-6 sm:mb-8 overflow-hidden">
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-purple-500/20">
                <BookOpen className="h-6 w-6 text-purple-300" />
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="text-xl sm:text-2xl font-semibold text-white">Start Here</span>
                  <Badge className="bg-cyan-100 text-cyan-900">New learner guide</Badge>
                </div>
                <p className="text-sm sm:text-base text-gray-300">
                  Follow these steps to begin your learning journey
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => {
                  setActiveStep(0);
                  setOpen(true);
                }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Get Started
              </Button>
              <Button
                variant="ghost"
                className="text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={handleSkip}
              >
                Skip
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-gray-700 bg-gray-800 text-white sm:max-w-2xl">
          <DialogHeader>
            <div className="mb-3 flex items-center justify-between gap-4 pr-8">
              <Badge className="bg-purple-100 text-purple-900">
                Step {activeStep + 1} of {steps.length}
              </Badge>
            </div>
            <DialogTitle className="text-2xl text-white">Start Here</DialogTitle>
            <DialogDescription className="text-gray-300">
              Follow these steps to begin your learning journey
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <Progress value={progressValue} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-cyan-400 [&>div]:to-purple-500" />

            <div className="grid grid-cols-4 gap-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === activeStep;
                const isComplete = index < activeStep;

                return (
                  <button
                    key={step.title}
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={`flex h-12 items-center justify-center rounded-lg border transition-colors ${
                      isActive
                        ? 'border-purple-400 bg-purple-500/20 text-purple-200'
                        : isComplete
                          ? 'border-cyan-500/40 bg-cyan-500/10 text-cyan-200'
                          : 'border-gray-700 bg-gray-900/70 text-gray-400 hover:border-gray-500'
                    }`}
                    aria-label={step.title}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                );
              })}
            </div>

            <div className="rounded-lg border border-gray-700 bg-gray-900/70 p-5">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/20">
                  <CurrentStepIcon className="h-5 w-5 text-purple-300" />
                </div>
                <span className="text-lg font-semibold text-white">{currentStep.title}</span>
              </div>
              <p className="text-sm leading-6 text-gray-300">{currentStep.description}</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between sm:space-x-0">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setActiveStep((step) => Math.max(step - 1, 0))}
                disabled={activeStep === 0}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                variant="ghost"
                className="text-gray-300 hover:bg-gray-700 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Resume Later
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="border-gray-600"
                asChild
              >
                <Link to={currentStep.href}>{currentStep.action}</Link>
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button onClick={() => setActiveStep((step) => Math.min(step + 1, steps.length - 1))}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button asChild>
                  <Link to={currentStep.href}>Finish</Link>
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
