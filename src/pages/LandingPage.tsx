import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Zap, Users, Target, Star, Award } from 'lucide-react';

export function LandingPage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 responsive-transition">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container-responsive py-16 sm:py-20 md:py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight responsive-transition">
              Master No-Code Development
              <span className="block mt-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                Through Challenges
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-purple-100 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
              Join the ultimate platform for no-code developers. Complete challenges, earn XP, 
              unlock badges, and climb the leaderboards while building real-world applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold responsive-transition" asChild>
                <Link to="/challenges">Browse Challenges</Link>
              </Button>
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold responsive-transition" asChild>
                <Link to="/register">Start Your Journey</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Choose NoCodeJam?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4 sm:px-0">
              Level up your no-code skills with our gamified learning platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl responsive-transition">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Earn XP Points</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Complete challenges and earn experience points. Track your progress 
                  and see your skills grow with every project you build.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl responsive-transition">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Award className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Unlock Badges</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Showcase your achievements with unique badges. From first steps 
                  to mastery milestones, collect them all!
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl responsive-transition md:col-span-2 lg:col-span-1">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Climb Leaderboards</h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  Compete with developers worldwide. See where you rank and 
                  challenge yourself to reach the top.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="container-responsive">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-600 mb-1 sm:mb-2">1,000+</div>
              <div className="text-sm sm:text-base text-gray-600">Active Developers</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600 mb-1 sm:mb-2">50+</div>
              <div className="text-sm sm:text-base text-gray-600">Challenges Available</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-600 mb-1 sm:mb-2">10,000+</div>
              <div className="text-sm sm:text-base text-gray-600">Solutions Submitted</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-600 mb-1 sm:mb-2">25</div>
              <div className="text-sm sm:text-base text-gray-600">Unique Badges</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container-responsive max-w-4xl text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 px-4 sm:px-0">
            Ready to Start Your No-Code Journey?
          </h2>
          <p className="text-lg sm:text-xl text-purple-100 mb-6 sm:mb-8 px-4 sm:px-0">
            Join thousands of developers already improving their skills on NoCodeJam
          </p>
          <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 px-6 sm:px-8 py-3 text-base sm:text-lg font-semibold responsive-transition" asChild>
            <Link to="/register">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}