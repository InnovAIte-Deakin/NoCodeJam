import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, FileCheck, AlertCircle, CheckCircle2, XCircle, Clock, Filter } from 'lucide-react';
import { ValidationChecklist } from '@/components/ValidationChecklist';
import { ReviewItemSkeleton } from '@/components/skeletons/ReviewItemSkeleton';
import type { Challenge, Pathway } from '@/types';

interface ReviewItem {
  id: string;
  title: string;
  type: 'challenge' | 'pathway';
  difficulty: string;
  status: string;
  ai_generated: boolean;
  created_by: string;
  created_at: string;
  validation_passed?: boolean;
  content: Challenge | Pathway;
}

export function ReviewDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<ReviewItem | null>(null);
  const [showChecklist, setShowChecklist] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('pending_review');
  const [aiGeneratedFilter, setAiGeneratedFilter] = useState<string>('all');

  useEffect(() => {
    fetchReviewItems();
  }, [statusFilter, typeFilter, aiGeneratedFilter]);

  const fetchReviewItems = async () => {
    try {
      setLoading(true);

      // Fetch challenges
      let challengesQuery = supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        challengesQuery = challengesQuery.eq('status', statusFilter);
      }
      if (aiGeneratedFilter === 'ai-only') {
        challengesQuery = challengesQuery.eq('ai_generated', true);
      }

      const { data: challenges, error: challengesError } = await challengesQuery;
      if (challengesError) throw challengesError;

      // Fetch pathways
      let pathwaysQuery = supabase
        .from('pathways')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        pathwaysQuery = pathwaysQuery.eq('status', statusFilter);
      }

      const { data: pathways, error: pathwaysError } = await pathwaysQuery;
      if (pathwaysError) throw pathwaysError;

      // Combine and format items
      const reviewItems: ReviewItem[] = [
        ...(challenges || []).map(c => ({
          id: c.id,
          title: c.title,
          type: 'challenge' as const,
          difficulty: c.difficulty,
          status: c.status,
          ai_generated: c.ai_generated,
          created_by: c.created_by || 'unknown',
          created_at: c.created_at,
          content: c,
        })),
        ...(pathways || []).map(p => ({
          id: p.id,
          title: p.title,
          type: 'pathway' as const,
          difficulty: p.difficulty,
          status: p.status,
          ai_generated: false, // Pathways don't have this flag yet
          created_by: p.created_by || 'unknown',
          created_at: p.created_at,
          content: p,
        })),
      ];

      // Apply type filter
      let filtered = reviewItems;
      if (typeFilter !== 'all') {
        filtered = filtered.filter(item => item.type === typeFilter);
      }

      setItems(filtered);
    } catch (error) {
      console.error('Error fetching review items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load items for review.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (item: ReviewItem) => {
    try {
      const table = item.type === 'challenge' ? 'challenges' : 'pathways';
      const { error } = await supabase
        .from(table)
        .update({ status: 'published' })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Approved!',
        description: `${item.type === 'challenge' ? 'Challenge' : 'Pathway'} has been published.`,
      });

      await fetchReviewItems();
    } catch (error) {
      console.error('Error approving:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve item.',
        variant: 'destructive',
      });
    }
  };

  const handleQuickReject = async (item: ReviewItem) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      const table = item.type === 'challenge' ? 'challenges' : 'pathways';
      const { error } = await supabase
        .from(table)
        .update({ status: 'draft' })
        .eq('id', item.id);

      if (error) throw error;

      toast({
        title: 'Rejected',
        description: 'Item returned to draft status.',
      });

      await fetchReviewItems();
    } catch (error) {
      console.error('Error rejecting:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject item.',
        variant: 'destructive',
      });
    }
  };

  const handleOpenChecklist = (item: ReviewItem) => {
    setSelectedItem(item);
    setShowChecklist(true);
  };

  const handleChecklistComplete = async () => {
    setShowChecklist(false);
    setSelectedItem(null);
    await fetchReviewItems();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-500';
      case 'pending_review':
        return 'bg-yellow-500';
      case 'draft':
        return 'bg-gray-500';
      case 'archived':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

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

  // Apply search filter
  const filteredItems = items.filter(item => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(query);
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white flex items-center">
              <FileCheck className="w-10 h-10 mr-3 text-purple-400" />
              Content Review Dashboard
            </h1>
            <p className="text-gray-300 mt-2">
              Review and approve AI-generated challenges and pathways
            </p>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <ReviewItemSkeleton key={i} />
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <FileCheck className="w-10 h-10 mr-3 text-purple-400" />
                Content Review Dashboard
              </h1>
              <p className="text-gray-300 mt-2">
                Review and approve AI-generated challenges and pathways
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-white">{filteredItems.length}</p>
              <p className="text-sm text-gray-400">Items to review</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Content Type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white">All Types</SelectItem>
                  <SelectItem value="challenge" className="text-white">Challenges</SelectItem>
                  <SelectItem value="pathway" className="text-white">Pathways</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white">All Status</SelectItem>
                  <SelectItem value="pending_review" className="text-white">Pending Review</SelectItem>
                  <SelectItem value="draft" className="text-white">Draft</SelectItem>
                  <SelectItem value="published" className="text-white">Published</SelectItem>
                  <SelectItem value="archived" className="text-white">Archived</SelectItem>
                </SelectContent>
              </Select>

              {/* AI Generated Filter */}
              <Select value={aiGeneratedFilter} onValueChange={setAiGeneratedFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="AI Generated" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all" className="text-white">All Sources</SelectItem>
                  <SelectItem value="ai-only" className="text-white">AI Generated Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Items List */}
        {filteredItems.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">All caught up!</h3>
              <p className="text-gray-400">No items to review at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredItems.map(item => (
              <Card key={item.id} className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`${getStatusColor(item.status)} text-white`}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={`${getDifficultyColor(item.difficulty)} text-white`}>
                          {item.difficulty}
                        </Badge>
                        <Badge className="bg-purple-600 text-white">
                          {item.type}
                        </Badge>
                        {item.ai_generated && (
                          <Badge className="bg-blue-600 text-white">
                            AI Generated
                          </Badge>
                        )}
                      </div>

                      <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        onClick={() => handleOpenChecklist(item)}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <FileCheck className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                      <Button
                        onClick={() => handleQuickApprove(item)}
                        variant="outline"
                        className="border-green-600 text-green-400 hover:bg-green-900"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Quick Approve
                      </Button>
                      <Button
                        onClick={() => handleQuickReject(item)}
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-900"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Validation Checklist Modal */}
        {selectedItem && (
          <ValidationChecklist
            open={showChecklist}
            onOpenChange={setShowChecklist}
            content={selectedItem.content}
            contentType={selectedItem.type}
            onComplete={handleChecklistComplete}
          />
        )}
      </div>
    </div>
  );
}
