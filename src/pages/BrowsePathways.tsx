import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, BookOpen, Clock, Trophy, CheckCircle2 } from 'lucide-react';
import { PathwayCardSkeleton } from '@/components/skeletons/PathwayCardSkeleton';
import { handleError, SCENARIO_ERRORS } from '@/lib/errorHandling';
import type { Pathway, PathwayEnrollment } from '@/types';

interface PathwayWithEnrollment extends Pathway {
  is_enrolled?: boolean;
  enrollment_status?: string;
}

export function BrowsePathways() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [pathways, setPathways] = useState<PathwayWithEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  useEffect(() => {
    fetchPathways();
  }, [user]);

  const fetchPathways = async () => {
    try {
      setLoading(true);

      // Fetch published pathways
      let query = supabase
        .from('pathways')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      const { data: pathwaysData, error: pathwaysError } = await query;

      if (pathwaysError) throw pathwaysError;

      // If user is logged in, check enrollment status
      if (user && pathwaysData) {
        const pathwayIds = pathwaysData.map(p => p.id);

        const { data: enrollments, error: enrollError } = await supabase
          .from('pathway_enrollments')
          .select('pathway_id, status')
          .eq('user_id', user.id)
          .in('pathway_id', pathwayIds);

        if (enrollError) {
          console.error('Error fetching enrollments:', enrollError);
        }

        // Merge enrollment data
        const enrollmentMap = new Map(
          enrollments?.map(e => [e.pathway_id, e.status]) || []
        );

        const pathwaysWithEnrollment = pathwaysData.map(pathway => ({
          ...pathway,
          is_enrolled: enrollmentMap.has(pathway.id),
          enrollment_status: enrollmentMap.get(pathway.id),
        }));

        setPathways(pathwaysWithEnrollment);
      } else {
        setPathways(pathwaysData || []);
      }
    } catch (error) {
      const errorMessage = handleError(error, 'fetchPathways');
      toast({
        title: 'Unable to Load Pathways',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (pathwayId: string) => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to enroll in a pathway.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setEnrolling(pathwayId);

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
        // Check if already enrolled
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

        // Refresh pathways to update enrollment status
        await fetchPathways();
      }
    } catch (error) {
      const errorMessage = handleError(error, 'handleEnroll');
      toast({
        title: 'Enrollment Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally{
      setEnrolling(null);
    }
  };

  const handleViewPathway = (pathwayId: string) => {
    navigate(`/pathway/${pathwayId}`);
  };

  // Apply filters
  const filteredPathways = pathways.filter(pathway => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = pathway.title.toLowerCase().includes(query);
      const matchesDescription = pathway.description?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription) return false;
    }

    // Difficulty filter
    if (difficultyFilter !== 'all' && pathway.difficulty !== difficultyFilter) {
      return false;
    }

    // Time filter
    if (timeFilter !== 'all') {
      const time = pathway.estimated_time || 0;
      if (timeFilter === 'short' && time > 120) return false;
      if (timeFilter === 'medium' && (time <= 120 || time > 480)) return false;
      if (timeFilter === 'long' && time <= 480) return false;
    }

    return true;
  });

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Learning Pathways</h1>
            <p className="text-xl text-gray-300">
              Structured learning journeys to master no-code development
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <PathwayCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Learning Pathways</h1>
          <p className="text-xl text-gray-300">
            Structured learning journeys to master no-code development
          </p>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search pathways..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {/* Difficulty Filter */}
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-white">All Difficulties</SelectItem>
                <SelectItem value="Beginner" className="text-white">Beginner</SelectItem>
                <SelectItem value="Intermediate" className="text-white">Intermediate</SelectItem>
                <SelectItem value="Advanced" className="text-white">Advanced</SelectItem>
                <SelectItem value="Expert" className="text-white">Expert</SelectItem>
              </SelectContent>
            </Select>

            {/* Time Filter */}
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="All Durations" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-white">All Durations</SelectItem>
                <SelectItem value="short" className="text-white">Short (&lt; 2 hours)</SelectItem>
                <SelectItem value="medium" className="text-white">Medium (2-8 hours)</SelectItem>
                <SelectItem value="long" className="text-white">Long (8+ hours)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pathways Grid */}
        {filteredPathways.length === 0 ? (
          <div className="bg-gray-800 rounded-lg p-12 border border-gray-700 text-center">
            <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No pathways found</h3>
            <p className="text-gray-400">
              {searchQuery || difficultyFilter !== 'all' || timeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Check back soon for new learning pathways!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPathways.map(pathway => (
              <Card
                key={pathway.id}
                className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors cursor-pointer"
                onClick={() => handleViewPathway(pathway.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={`${getDifficultyColor(pathway.difficulty)} text-white`}>
                      {pathway.difficulty}
                    </Badge>
                    {pathway.is_enrolled && (
                      <Badge className="bg-blue-500 text-white">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Enrolled
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-white text-xl">{pathway.title}</CardTitle>
                  <CardDescription className="text-gray-300 line-clamp-2">
                    {pathway.description}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {Math.floor((pathway.estimated_time || 0) / 60)}h {(pathway.estimated_time || 0) % 60}m
                    </div>
                    <div className="flex items-center">
                      <Trophy className="w-4 h-4 mr-1" />
                      {pathway.total_xp} XP
                    </div>
                  </div>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (pathway.is_enrolled) {
                        handleViewPathway(pathway.id);
                      } else {
                        handleEnroll(pathway.id);
                      }
                    }}
                    disabled={enrolling === pathway.id}
                    className={`w-full ${
                      pathway.is_enrolled
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {enrolling === pathway.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enrolling...
                      </>
                    ) : pathway.is_enrolled ? (
                      'Continue Learning'
                    ) : (
                      'Enroll Now'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
