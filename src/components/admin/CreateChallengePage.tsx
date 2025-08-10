import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChallenges } from '@/hooks/useChallenges';
import { Plus, XCircle } from 'lucide-react';

export const CreateChallengePage = () => {
  const { createChallenge } = useChallenges();
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    difficulty: 'Beginner' as 'Beginner' | 'Intermediate' | 'Expert',
    xpReward: 200,
    imageUrl: '',
    requirements: ['']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChallenge.title || !newChallenge.description) {
      return;
    }

    const success = await createChallenge(newChallenge);
    if (success) {
      // Reset form
      setNewChallenge({
        title: '',
        description: '',
        difficulty: 'Beginner',
        xpReward: 200,
        imageUrl: '',
        requirements: ['']
      });
    }
  };

  const addRequirement = () => {
    setNewChallenge({
      ...newChallenge,
      requirements: [...newChallenge.requirements, '']
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...newChallenge.requirements];
    updated[index] = value;
    setNewChallenge({
      ...newChallenge,
      requirements: updated
    });
  };

  const removeRequirement = (index: number) => {
    if (newChallenge.requirements.length > 1) {
      const updated = newChallenge.requirements.filter((_, i) => i !== index);
      setNewChallenge({
        ...newChallenge,
        requirements: updated
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Challenge</h1>
        <p className="text-gray-600">Add a new challenge for users to complete</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Challenge Details</CardTitle>
          <CardDescription>Fill in the information for the new challenge</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Challenge Title</Label>
                <Input
                  id="title"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                  placeholder="Enter challenge title"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={newChallenge.imageUrl}
                  onChange={(e) => setNewChallenge({...newChallenge, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newChallenge.description}
                onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                placeholder="Describe the challenge and what users need to build"
                rows={4}
                required
                className="mt-1"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select 
                  value={newChallenge.difficulty} 
                  onValueChange={(value: 'Beginner' | 'Intermediate' | 'Expert') => 
                    setNewChallenge({...newChallenge, difficulty: value})
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="xpReward">XP Reward</Label>
                <Input
                  id="xpReward"
                  type="number"
                  min="50"
                  max="1000"
                  step="50"
                  value={newChallenge.xpReward}
                  onChange={(e) => setNewChallenge({...newChallenge, xpReward: parseInt(e.target.value)})}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Requirements</Label>
              <div className="space-y-2 mt-2">
                {newChallenge.requirements.map((req, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={req}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                      placeholder={`Requirement ${index + 1}`}
                    />
                    {newChallenge.requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeRequirement(index)}
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addRequirement}
                  className="mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Requirement
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-gradient-to-r from-purple-700 to-blue-700 text-white shadow-md hover:from-purple-600 hover:to-blue-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
