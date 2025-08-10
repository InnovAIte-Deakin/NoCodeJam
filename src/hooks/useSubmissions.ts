import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

export const useSubmissions = () => {
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = async () => {
    setLoading(true);
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select(`
        *,
        users!submissions_user_id_fkey (
          id,
          username
        )
      `)
      .eq('status', 'pending');
    
    if (!error && submissions) {
      setPendingSubmissions(submissions);
    } else {
      console.error('Error fetching submissions:', error);
    }
    setLoading(false);
  };

  const approveSubmission = async (submissionId: string, challenge: any) => {
    const submission = pendingSubmissions.find((s: any) => s.id === submissionId);
    if (!submission) return false;

    // Update submission status
    const { error: updateError } = await supabase
      .from('submissions')
      .update({ status: 'approved' })
      .eq('id', submissionId);

    if (updateError) {
      toast({
        title: "Failed to approve submission",
        description: updateError.message,
        variant: "destructive",
      });
      return false;
    }

    // Award XP to user
    const { data: userData, error: userFetchError } = await supabase
      .from('users')
      .select('total_xp')
      .eq('id', submission.user_id)
      .single();

    if (userFetchError || !userData) {
      toast({
        title: "Failed to fetch user XP",
        description: userFetchError?.message || 'User not found',
        variant: "destructive",
      });
      return false;
    }

    const newXP = (userData.total_xp || 0) + (challenge.xp_reward || 0);
    const { error: xpError } = await supabase
      .from('users')
      .update({ total_xp: newXP })
      .eq('id', submission.user_id);

    if (xpError) {
      toast({
        title: "Failed to award XP",
        description: xpError.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Submission approved",
      description: "The submission has been approved and the user has been awarded XP.",
    });

    fetchSubmissions(); // Refresh list
    return true;
  };

  const rejectSubmission = async (submissionId: string) => {
    const { error } = await supabase
      .from('submissions')
      .update({ status: 'denied' })
      .eq('id', submissionId);

    if (error) {
      toast({
        title: "Failed to reject submission",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Submission rejected",
      description: "The submission has been rejected.",
      variant: "destructive",
    });

    fetchSubmissions(); // Refresh list
    return true;
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  return {
    pendingSubmissions,
    loading,
    refreshSubmissions: fetchSubmissions,
    approveSubmission,
    rejectSubmission,
  };
};
