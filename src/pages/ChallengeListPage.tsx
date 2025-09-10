import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { OnboardingChallengeCard } from '@/components/OnboardingChallengeCard';
import { Search, Filter, Star, Clock, CheckCircle, Circle, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ChallengeListPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [onboardingChallenge, setOnboardingChallenge] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [isOnboardingHidden, setIsOnboardingHidden] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch all challenges
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*');
      
      if (challengesData) {
        // Separate onboarding challenge from regular challenges
        const onboarding = challengesData.find(c => c.challenge_type === 'onboarding');
        const regularChallenges = challengesData.filter(c => c.challenge_type !== 'onboarding');
        
        setOnboardingChallenge(onboarding);
        setChallenges(regularChallenges);
      }

      // Fetch user-specific data
      if (user) {
        // Fetch submissions
        const { data: submissionsData } = await supabase
          .from('submissions')
          .select('*')
          .eq('user_id', user.id);
        setSubmissions(submissionsData || []);

        // Fetch user's onboarding visibility preference
        const { data: userData } = await supabase
          .from('users')
          .select('onboarding_hidden')
          .eq('id', user.id)
          .single();
        
        if (userData) {
          setIsOnboardingHidden(userData.onboarding_hidden || false);
        }
      } else {
        setSubmissions([]);
        setIsOnboardingHidden(false);
      }
      setLoading(false);
    };
    fetchData();
  }, [user]);

  const getChallengeStatus = (challengeId: string) => {
    const submission = submissions.find(s => s.challenge_id === challengeId);
    return submission?.status || 'not-attempted';
  };

  const handleHideOnboarding = async () => {
    setIsOnboardingHidden(true);
  };

  const handleShowOnboarding = async () => {
    if (!user) return;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return;
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/set-onboarding-visibility`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isHidden: false }),
      });

      if (response.ok) {
        setIsOnboardingHidden(false);
      }
    } catch (error) {
      console.error('Error showing onboarding:', error);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' ||
      challenge.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    return matchesSearch && matchesDifficulty;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-600" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Challenges</h1>
          <p className="text-gray-600">
            Explore and complete no-code development challenges to earn XP and badges
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search challenges..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by difficulty" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Difficulties</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Challenge Grid */}
        {loading ? (
          <div className="text-center py-12 text-lg text-gray-500">Loading challenges...</div>
        ) : (
        <>
          {/* Onboarding Challenge Card or Show Button */}
          {onboardingChallenge && !isOnboardingHidden && (
            <div className="mb-8">
              <OnboardingChallengeCard 
                title={onboardingChallenge.title}
                description={onboardingChallenge.description}
                onHide={handleHideOnboarding}
              />
            </div>
          )}
          
          {/* Show Onboarding Button */}
          {onboardingChallenge && isOnboardingHidden && (
            <div className="mb-8">
              <Button 
                onClick={handleShowOnboarding}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Eye className="w-4 h-4 mr-2" />
                Show Onboarding Tutorial
              </Button>
            </div>
          )}
          
          {/* Regular Challenges Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge) => {
            const status = getChallengeStatus(challenge.id);
            // Parse requirements string to array for display
            const requirementsArr = challenge.requirements ? challenge.requirements.split(';').map((r: string) => r.trim()).filter(Boolean) : [];
            return (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                <div className="relative">
                  <img
                    src={challenge.image}
                    alt={challenge.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    {getStatusIcon(status)}
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-2">{challenge.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {challenge.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-1 text-purple-600">
                      <Star className="w-4 h-4" />
                      <span className="font-medium">{challenge.xp_reward} XP</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {requirementsArr.length} requirements
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {status === 'approved' ? (
                      <Button asChild className="flex-1" variant="secondary">
                        <Link to={`/challenges/${challenge.id}`}>View Details</Link>
                      </Button>
                    ) : (
                      <Button asChild className="flex-1">
                        <Link to={`/challenges/${challenge.id}`}>Start Challenge</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          </div>
          
          {filteredChallenges.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No challenges found</h3>
              <p className="text-gray-600">
                Try adjusting your search terms or filters
              </p>
            </div>
          )}
        </>
        )}
      </div>
    </div>
  );
}