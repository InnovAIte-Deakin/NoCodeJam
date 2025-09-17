import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Trophy, Rocket, ArrowRight, ArrowLeft } from 'lucide-react';

interface OnboardingCompleteScreenProps {
  challengeTitle?: string;
  totalSteps?: number;
}

export function OnboardingCompleteScreen({ 
  challengeTitle = 'NoCodeJam Onboarding',
  totalSteps = 3 
}: OnboardingCompleteScreenProps) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-2xl border-0 bg-gray-800 border-gray-700">
          <CardContent className="p-12">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-16 h-16 text-green-600" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-800" />
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-white mb-4">
                🎉 Congratulations!
              </h1>
              
              <h2 className="text-2xl font-semibold text-purple-300 mb-2">
                You've completed the onboarding!
              </h2>
              
              <p className="text-gray-300 text-lg">
                You've successfully finished all {totalSteps} steps of the {challengeTitle}
              </p>
            </div>

            {/* Achievement Summary */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-white mb-4 flex items-center">
                <Rocket className="w-5 h-5 mr-2 text-white" />
                What You've Accomplished
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white">Completed {totalSteps} tutorial steps</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white">Submitted all required work</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white">Learned no-code fundamentals</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-white">Ready for challenges</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-white mb-3">
                What's Next?
              </h3>
              <p className="text-white text-sm">
                Your submission has been sent for admin review. While you wait, explore more challenges 
                to continue building your no-code skills and earn XP points!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button 
                onClick={() => navigate('/onboarding/1?review=true')}
                className="w-full sm:w-44 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center justify-center space-x-2"
                size="lg"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Review Steps</span>
              </Button>
              
              <Button 
                onClick={() => navigate('/challenges')}
                className="w-full sm:w-48 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center justify-center space-x-2"
                size="lg"
              >
                <Rocket className="w-5 h-5" />
                <span>Browse More Challenges</span>
              </Button>
              
              <Button 
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-44 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center justify-center space-x-2"
                size="lg"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Footer Message */}
            <div className="text-center mt-4 pt-4 border-t border-gray-600">
              <p className="text-sm text-gray-400">
                Welcome to the NoCodeJam community! 🚀
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
