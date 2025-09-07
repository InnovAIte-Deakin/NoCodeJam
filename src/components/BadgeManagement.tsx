import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Plus, Edit, Trash2, Users, Target, RefreshCw, Play, Bug } from 'lucide-react';
import { BadgeDefinition } from '../types';
import { BadgeService } from '../services/badgeService';
import { supabase } from '../lib/supabaseClient';
import BadgeForm from './BadgeForm';
import { toast } from '../hooks/use-toast';

export default function BadgeManagement() {
  const [badges, setBadges] = useState<BadgeDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<BadgeDefinition | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [userCounts, setUserCounts] = useState<Record<string, number>>({});
  const [badgeProcessing, setBadgeProcessing] = useState(false);
  const [badgeResults, setBadgeResults] = useState<{ userId: string; newBadges: { name: string }[] }[]>([]);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const allBadges = await BadgeService.getAllBadges();
      setBadges(allBadges);

      // Load user counts for each badge
      const counts: Record<string, number> = {};
      for (const badge of allBadges) {
        try {
          const count = await BadgeService.getBadgeUserCount(badge.id);
          counts[badge.id] = count;
        } catch (error) {
          console.error(`Error loading user count for badge ${badge.id}:`, error);
          counts[badge.id] = 0;
        }
      }
      setUserCounts(counts);
    } catch (error) {
      console.error('Error loading badges:', error);
      toast({
        title: "Error",
        description: "Failed to load badges",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBadge = async (badgeData: Omit<BadgeDefinition, 'id'>) => {
    try {
      setFormLoading(true);
      await BadgeService.createBadge(badgeData);
      await loadBadges();
      setIsFormOpen(false);
      toast({
        title: "Success",
        description: "Badge created successfully",
      });
    } catch (error) {
      console.error('Error creating badge:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create badge",
        variant: "destructive",
      });
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateBadge = async (badgeData: Omit<BadgeDefinition, 'id'> | BadgeDefinition) => {
    try {
      setFormLoading(true);
      
      // Ensure we have an id for updates
      if (!('id' in badgeData)) {
        throw new Error('Badge ID is required for updates');
      }
      
      await BadgeService.updateBadge(badgeData.id, badgeData);
      await loadBadges();
      setEditingBadge(null);
      toast({
        title: "Success",
        description: "Badge updated successfully",
      });
    } catch (error) {
      console.error('Error updating badge:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update badge",
        variant: "destructive",
      });
      throw error;
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    try {
      await BadgeService.deleteBadge(badgeId);
      await loadBadges();
      toast({
        title: "Success",
        description: "Badge deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting badge:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete badge",
        variant: "destructive",
      });
    }
  };

  const getCriteriaDisplayText = (badge: BadgeDefinition): string => {
    const { criteria } = badge;
    switch (criteria.type) {
      case 'challenges_completed':
        return `Complete ${criteria.value} challenges`;
      case 'xp_earned':
        return `Earn ${criteria.value} XP`;
      case 'first_challenge':
        return 'Complete first challenge';
      case 'difficulty_master':
        return `Complete ${criteria.value} ${criteria.additional?.difficulty?.join(', ')} challenges`;
      case 'leaderboard_position':
        return `Reach position ${criteria.value} on leaderboard`;
      case 'streak':
        return `Maintain ${criteria.value}-day streak`;
      case 'expert_challenges':
        return `Complete ${criteria.value} expert challenges`;
      default:
        return 'Custom criteria';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Badge Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded-md mb-4"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Badge Management</h2>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Badge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Badge</DialogTitle>
            </DialogHeader>
            <BadgeForm
              onSave={handleCreateBadge}
              onCancel={() => setIsFormOpen(false)}
              isLoading={formLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Badge Processing Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Process All Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Check all users and award badges based on their current progress. Run this after creating new badges.
            </p>
            <Button 
              onClick={async () => {
                setBadgeProcessing(true);
                try {
                  const results = await BadgeService.processAllUsers();
                  setBadgeResults(results);
                  
                  // Reload badges and user counts after processing
                  await loadBadges();
                  
                  toast({
                    title: "Badge processing complete",
                    description: `${results.reduce((acc, r) => acc + r.newBadges.length, 0)} badges awarded to ${results.length} users`,
                  });
                } catch (error) {
                  console.error('Error processing badges:', error);
                  toast({
                    title: "Error processing badges",
                    description: "Failed to process badges for all users",
                    variant: "destructive",
                  });
                } finally {
                  setBadgeProcessing(false);
                }
              }}
              disabled={badgeProcessing}
              className="w-full"
            >
              {badgeProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Process All Users
                </>
              )}
            </Button>
            
            {/* Debug Test Button */}
            <Button 
              onClick={async () => {
                try {
                  // Get the first user for testing
                  const { data: users } = await supabase.from('users').select('id').limit(1);
                  if (users && users.length > 0) {
                    await BadgeService.testBadgeAward(users[0].id);
                    toast({
                      title: "Test completed",
                      description: "Check console for debug information",
                    });
                  }
                } catch (error) {
                  console.error('Test failed:', error);
                  toast({
                    title: "Test failed",
                    description: "Check console for error details",
                    variant: "destructive",
                  });
                }
              }}
              variant="outline"
              className="w-full mt-2"
            >
              <Bug className="w-4 h-4 mr-2" />
              Test Badge Award
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Badge Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            {badgeProcessing ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating statistics...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Total Badges Available:</span>
                  <span className="font-medium">{badges.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Processing:</span>
                  <span className="font-medium">
                    {badgeResults.length > 0 ? 'Just completed' : 'Not yet run'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Users Processed:</span>
                  <span className="font-medium">{badgeResults.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Badges Awarded:</span>
                  <span className="font-medium">
                    {badgeResults.reduce((acc, r) => acc + r.newBadges.length, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Earned Badges:</span>
                  <span className="font-medium">
                    {Object.values(userCounts).reduce((acc, count) => acc + count, 0)}
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Processing Results */}
      {badgeResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Processing Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {badgeResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <span className="font-medium">User: {result.userId}</span>
                    <div className="text-sm text-muted-foreground">
                      {result.newBadges.length > 0 
                        ? `Awarded: ${result.newBadges.map(b => b.name).join(', ')}`
                        : 'No new badges'
                      }
                    </div>
                  </div>
                  <Badge variant={result.newBadges.length > 0 ? "default" : "secondary"}>
                    {result.newBadges.length} badges
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <Card key={badge.id} className="relative group">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{badge.icon_url}</div>
                  <div>
                    <CardTitle className="text-lg">{badge.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {badge.description}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Dialog open={editingBadge?.id === badge.id} onOpenChange={(open) => !open && setEditingBadge(null)}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingBadge(badge)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Badge</DialogTitle>
                      </DialogHeader>
                      <BadgeForm
                        initialBadge={editingBadge || undefined}
                        onSave={handleUpdateBadge}
                        onCancel={() => setEditingBadge(null)}
                        isLoading={formLoading}
                      />
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Badge</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{badge.name}"? This action cannot be undone.
                          {userCounts[badge.id] > 0 && (
                            <span className="block mt-2 text-red-600 font-medium">
                              Warning: {userCounts[badge.id]} users have earned this badge. Deletion will fail.
                            </span>
                          )}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteBadge(badge.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span>{getCriteriaDisplayText(badge)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {userCounts[badge.id] || 0} user{userCounts[badge.id] !== 1 ? 's' : ''} earned
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-xs">
                    {badge.criteria.type.replace('_', ' ')}
                  </Badge>
                  {badge.criteria.additional?.difficulty && (
                    <Badge variant="secondary" className="text-xs">
                      {badge.criteria.additional.difficulty.join(', ')}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {badges.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-lg font-semibold mb-2">No badges created yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first badge to start rewarding users for their achievements.
            </p>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Badge
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
