import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useChallenges } from '@/hooks/useChallenges';
import { Clock, Eye, Trash2, Edit, CheckCircle, XCircle } from 'lucide-react';
import { ChallengeEditModal } from './ChallengeEditModal';

export const ManageChallengesPage = () => {
  const { challenges, challengeRequests, loading, updateChallenge, deleteChallenge, approveRequest, rejectRequest } = useChallenges();
  const [editingChallenge, setEditingChallenge] = useState<any | null>(null);
  const [viewingChallenge, setViewingChallenge] = useState<any | null>(null);

  const handleEdit = (challenge: any) => {
    setEditingChallenge({
      ...challenge,
      requirements: Array.isArray(challenge.requirements)
        ? challenge.requirements
        : (challenge.requirements || '').split(';').map((r: string) => r.trim()).filter(Boolean),
    });
  };

  const handleEditSubmit = async (updatedChallenge: any) => {
    const success = await updateChallenge(editingChallenge.id, updatedChallenge);
    if (success) {
      setEditingChallenge(null);
    }
  };

  const handleDelete = async (challengeId: string) => {
    if (window.confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) {
      await deleteChallenge(challengeId);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
        <p className="text-gray-600">Loading challenges...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Challenge Requests Section */}
      {challengeRequests.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Challenge Requests</h2>
          <div className="space-y-4">
            {challengeRequests.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-orange-400">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{request.title}</CardTitle>
                      <CardDescription className="mt-2">{request.description}</CardDescription>
                    </div>
                    <Badge className={getDifficultyColor(request.difficulty)}>
                      {request.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="font-medium">XP Reward:</span> {request.xp_reward}
                    </div>
                    <div>
                      <span className="font-medium">Requirements:</span> {request.requirements || 'None specified'}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={() => approveRequest(request.id)} 
                      className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button 
                      onClick={() => rejectRequest(request.id)} 
                      variant="destructive"
                      className="shadow-sm"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Published Challenges Section */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Published Challenges</h2>
        {challenges.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-600">No challenges available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg line-clamp-2">{challenge.title}</CardTitle>
                    <Badge className={getDifficultyColor(challenge.difficulty)}>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {challenge.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="font-medium text-purple-600">{challenge.xp_reward} XP</span>
                    <span className="text-gray-500">
                      {challenge.requirements ? challenge.requirements.split(';').length : 0} requirements
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setViewingChallenge(challenge)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(challenge)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(challenge.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <ChallengeEditModal
        challenge={editingChallenge}
        isOpen={!!editingChallenge}
        onClose={() => setEditingChallenge(null)}
        onSave={handleEditSubmit}
      />

      {/* View Modal */}
      {viewingChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{viewingChallenge.title}</h2>
                <Button variant="outline" onClick={() => setViewingChallenge(null)}>
                  ✕
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description:</h3>
                  <p className="text-gray-700">{viewingChallenge.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-1">Difficulty:</h3>
                    <Badge className={getDifficultyColor(viewingChallenge.difficulty)}>
                      {viewingChallenge.difficulty}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">XP Reward:</h3>
                    <p>{viewingChallenge.xp_reward}</p>
                  </div>
                </div>
                {viewingChallenge.requirements && (
                  <div>
                    <h3 className="font-semibold mb-2">Requirements:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {viewingChallenge.requirements.split(';').map((req: string, index: number) => (
                        <li key={index} className="text-gray-700">{req.trim()}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {viewingChallenge.image && (
                  <div>
                    <h3 className="font-semibold mb-2">Image:</h3>
                    <img 
                      src={viewingChallenge.image} 
                      alt={viewingChallenge.title}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
