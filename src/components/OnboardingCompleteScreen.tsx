import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Trophy, Rocket, ArrowRight } from 'lucide-react';

interface OnboardingCompleteScreenProps {
  challengeTitle?: string;
  totalSteps?: number;
}

export function OnboardingCompleteScreen({ 
  challengeTitle = 'NoCodeJam Onboarding',
  totalSteps = 3 
}: OnboardingCompleteScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardContent className="p-12">
            {/* Success Icon */}
            <div className="text-center mb-8">
              <div className="relative inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full mb-6">
                <CheckCircle className="w-16 h-16 text-green-600" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-800" />
                </div>
              </div>
              
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                🎉 Congratulations!
              </h1>
              
              <h2 className="text-2xl font-semibold text-purple-700 mb-2">
                You've completed the onboarding!
              </h2>
              
              <p className="text-gray-600 text-lg">
                You've successfully finished all {totalSteps} steps of the {challengeTitle}
              </p>
            </div>

            {/* Achievement Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Rocket className="w-5 h-5 mr-2 text-purple-600" />
                What You've Accomplished
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Completed {totalSteps} tutorial steps</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Submitted all required work</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Learned no-code fundamentals</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-gray-700">Ready for challenges</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-3">
                What's Next?
              </h3>
              <p className="text-blue-800 text-sm">
                Your submission has been sent for admin review. While you wait, explore more challenges 
                to continue building your no-code skills and earn XP points!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1 h-12" size="lg">
                <Link to="/dashboard" className="flex items-center justify-center space-x-2">
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="flex-1 h-12" size="lg">
                <Link to="/challenges" className="flex items-center justify-center space-x-2">
                  <Rocket className="w-5 h-5" />
                  <span>Browse More Challenges</span>
                </Link>
              </Button>
            </div>

            {/* Footer Message */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Welcome to the NoCodeJam community! 🚀
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
