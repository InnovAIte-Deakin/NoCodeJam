import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

export const useChallenges = () => {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [challengeRequests, setChallengeRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChallenges = async () => {
    setLoading(true);
    const { data: challengesData, error } = await supabase
      .from('challenges')
      .select('*');
    
    if (!error && challengesData) {
      // Separate regular challenges from requests
      const regularChallenges = challengesData.filter(c => c.challenge_type !== 'user_requested');
      const requests = challengesData.filter(c => c.challenge_type === 'user_requested' && c.status === 'pending');
      
      setChallenges(regularChallenges);
      setChallengeRequests(requests);
    } else {
      console.error('Error fetching challenges:', error);
    }
    setLoading(false);
  };

  const createChallenge = async (challengeData: any) => {
    const { error } = await supabase.from('challenges').insert([
      {
        title: challengeData.title,
        description: challengeData.description,
        difficulty: challengeData.difficulty.toLowerCase(),
        xp_reward: challengeData.xpReward,
        image: challengeData.imageUrl,
        requirements: challengeData.requirements.join('; '),
        status: 'approved', // Admin-created challenges are auto-approved
      }
    ]);

    if (error) {
      toast({
        title: "Failed to create challenge",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Challenge created",
      description: "New challenge has been successfully created and published.",
    });

    fetchChallenges(); // Refresh list
    return true;
  };

  const updateChallenge = async (challengeId: string, updatedData: any) => {
    const { error } = await supabase
      .from('challenges')
      .update({
        title: updatedData.title,
        description: updatedData.description,
        difficulty: updatedData.difficulty,
        xp_reward: updatedData.xp_reward,
        requirements: Array.isArray(updatedData.requirements) 
          ? updatedData.requirements.join('; ')
          : updatedData.requirements,
      })
      .eq('id', challengeId);

    if (error) {
      toast({
        title: 'Failed to update challenge',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Challenge updated',
      description: 'The challenge has been successfully updated.',
    });

    fetchChallenges(); // Refresh list
    return true;
  };

  const deleteChallenge = async (challengeId: string) => {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', challengeId);

    if (error) {
      toast({
        title: 'Failed to delete challenge',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Challenge deleted',
      description: 'The challenge has been successfully deleted.',
    });

    fetchChallenges(); // Refresh list
    return true;
  };

  const approveRequest = async (challengeId: string) => {
    const { error } = await supabase
      .from('challenges')
      .update({ status: 'approved' })
      .eq('id', challengeId);

    if (error) {
      toast({
        title: 'Failed to approve challenge request',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Challenge request approved',
      description: 'The challenge request has been approved successfully.',
    });

    fetchChallenges(); // Refresh list
    return true;
  };

  const rejectRequest = async (challengeId: string) => {
    const { error } = await supabase
      .from('challenges')
      .update({ status: 'rejected' })
      .eq('id', challengeId);

    if (error) {
      toast({
        title: 'Failed to reject challenge request',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    }

    toast({
      title: 'Challenge request rejected',
      description: 'The challenge request has been rejected.',
    });

    fetchChallenges(); // Refresh list
    return true;
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  return {
    challenges,
    challengeRequests,
    loading,
    refreshChallenges: fetchChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    approveRequest,
    rejectRequest,
  };
};
