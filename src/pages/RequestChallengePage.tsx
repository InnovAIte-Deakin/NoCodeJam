import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabaseClient';

export function RequestChallengePage() {
  const navigate = useNavigate();
  const [challengeRequest, setChallengeRequest] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner',
    xpReward: 200,
    imageUrl: '',
    requirements: [''],
  });

  const addRequirement = () => {
    setChallengeRequest({
      ...challengeRequest,
      requirements: [...challengeRequest.requirements, ''],
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...challengeRequest.requirements];
    updated[index] = value;
    setChallengeRequest({
      ...challengeRequest,
      requirements: updated,
    });
  };

  const removeRequirement = (index: number) => {
    if (challengeRequest.requirements.length > 1) {
      const updated = challengeRequest.requirements.filter((_, i) => i !== index);
      setChallengeRequest({
        ...challengeRequest,
        requirements: updated,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeRequest.title || !challengeRequest.description) {
      alert('Please fill in all required fields.');
      return;
    }

    const { error } = await supabase.from('challenges').insert([
      {
        title: challengeRequest.title,
        description: challengeRequest.description,
        difficulty: challengeRequest.difficulty.toLowerCase(),
        xp_reward: challengeRequest.xpReward,
        image: challengeRequest.imageUrl,
        requirements: challengeRequest.requirements.join('; '),
        challenge_type: 'user_requested',
        status: 'pending',
      },
    ]);

    if (error) {
      console.error('Error requesting challenge:', error);
      alert('Failed to request challenge. Please try again later.');
      return;
    }

    alert('Challenge request submitted successfully!');
    navigate('/challenges');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Request a Challenge</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <Input
                  value={challengeRequest.title}
                  onChange={(e) => setChallengeRequest({ ...challengeRequest, title: e.target.value })}
                  placeholder="Enter challenge title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <Input
                  value={challengeRequest.description}
                  onChange={(e) => setChallengeRequest({ ...challengeRequest, description: e.target.value })}
                  placeholder="Enter challenge description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                <Select
                  value={challengeRequest.difficulty}
                  onValueChange={(value) => setChallengeRequest({ ...challengeRequest, difficulty: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">XP Reward</label>
                <Input
                  type="number"
                  value={challengeRequest.xpReward}
                  onChange={(e) => setChallengeRequest({ ...challengeRequest, xpReward: Number(e.target.value) })}
                  placeholder="Enter XP reward"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Image URL</label>
                <Input
                  value={challengeRequest.imageUrl}
                  onChange={(e) => setChallengeRequest({ ...challengeRequest, imageUrl: e.target.value })}
                  placeholder="Enter image URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Requirements</label>
                {challengeRequest.requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <Input
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder="Enter requirement"
                    />
                    <Button type="button" variant="destructive" onClick={() => removeRequirement(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
                <Button type="button" onClick={addRequirement}>
                  Add Requirement
                </Button>
              </div>

              <Button type="submit" className="w-full">
                Submit Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
