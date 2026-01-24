import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, XCircle } from 'lucide-react';

interface EditChallengeRequestModalProps {
  children: React.ReactNode;
  request: any;
  onSuccess: () => void;
}

export function EditChallengeRequestModal({ children, request, onSuccess }: EditChallengeRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: request?.title || '',
    description: request?.description || '',
    difficulty: request?.difficulty || '',
    requirements: request?.requirements
      ? (Array.isArray(request.requirements)
          ? request.requirements
          : request.requirements.split(';').map(r => r.trim()).filter(r => r))
      : [''],
    imageUrl: '',
    xpReward: request?.difficulty === 'beginner' ? 200 :
              request?.difficulty === 'intermediate' ? 500 : 1000
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Creating challenge from request:', formData);
      
      // Create the challenge
      const { data: challengeData, error: challengeError } = await supabase
        .from('challenges')
        .insert({
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty.toLowerCase(),
          xp_reward: formData.xpReward,
          image: formData.imageUrl,
          requirements: formData.requirements.join('; '),
          created_at: new Date().toISOString()
        })
        .select();

      if (challengeError) {
        console.error('Challenge creation error:', challengeError);
        throw challengeError;
      }

      console.log('Challenge created:', challengeData);

      // Update the request status to approved
      const { error: updateError } = await supabase
        .from('challenge_requests')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (updateError) {
        console.error('Request update error:', updateError);
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Challenge created successfully and request approved!",
      });

      setOpen(false);
      onSuccess();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Error",
        description: "Failed to create challenge. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (field === 'difficulty') {
      setFormData(prev => ({
        ...prev,
        xpReward: value === 'beginner' ? 200 : value === 'intermediate' ? 500 : 1000,
      }));
    }
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...formData.requirements];
    updated[index] = value;
    setFormData(prev => ({
      ...prev,
      requirements: updated
    }));
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      const updated = formData.requirements.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        requirements: updated
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">Create Challenge from Request</DialogTitle>
          <DialogDescription className="text-gray-300">
            Edit the challenge details and add additional information before creating it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Challenge Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty" className="text-white">Difficulty Level *</Label>
              <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="beginner" className="text-white">Beginner</SelectItem>
                  <SelectItem value="intermediate" className="text-white">Intermediate</SelectItem>
                  <SelectItem value="advanced" className="text-white">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="xpReward" className="text-white">XP Reward *</Label>
              <Input
                id="xpReward"
                type="number"
                value={formData.xpReward}
                onChange={(e) => handleInputChange('xpReward', parseInt(e.target.value) || 0)}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl" className="text-white">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleInputChange('imageUrl', e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Requirements *</Label>
            <div className="space-y-2">
              {formData.requirements.map((req, index) => (
                <div key={index} className="flex space-x-2">
                  <Input
                    value={req}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder={`Requirement ${index + 1}`}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  {formData.requirements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeRequirement(index)}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addRequirement}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Requirement
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? 'Creating...' : 'Create Challenge'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
