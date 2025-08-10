import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useSubmissions } from '@/hooks/useSubmissions';
import { useChallenges } from '@/hooks/useChallenges';
import { CheckCircle, XCircle, Clock, ExternalLink } from 'lucide-react';

export const PendingSubmissionsPage = () => {
  const { pendingSubmissions, loading, approveSubmission, rejectSubmission } = useSubmissions();
  const { challenges } = useChallenges();

  const handleApprove = async (submissionId: string) => {
    const submission = pendingSubmissions.find((s: any) => s.id === submissionId);
    if (!submission) return;
    
    const challenge = challenges.find((c: any) => c.id === submission.challenge_id);
    if (!challenge) return;
    
    await approveSubmission(submissionId, challenge);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Loading pending submissions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pending Submissions</h1>
        <p className="text-gray-600">Review and approve or reject user submissions</p>
      </div>

      {pendingSubmissions.length > 0 ? (
        <div className="space-y-4">
          {pendingSubmissions.map((submission) => {
            const challenge = challenges.find(c => c.id === submission.challenge_id);
            return (
              <Card key={submission.id} className="border border-gray-200 rounded-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{challenge?.title || 'Unknown Challenge'}</h3>
                      <p className="text-gray-600">
                        From {submission.users?.username || 'Unknown User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {challenge?.difficulty || 'Unknown'}
                    </Badge>
                  </div>
                  
                  <div className="mb-4">
                    <Label className="text-sm font-medium">Solution URL:</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Input value={submission.submission_url} readOnly />
                      <Button variant="outline" size="sm" asChild>
                        <a href={submission.submission_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => handleApprove(submission.id)}
                      className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      variant="destructive"
                      onClick={() => rejectSubmission(submission.id)}
                      className="shadow-sm"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No pending submissions</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
