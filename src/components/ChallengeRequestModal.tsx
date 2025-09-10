import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, XCircle } from 'lucide-react';

interface ChallengeRequestModalProps {
  children: React.ReactNode;
}

export function ChallengeRequestModal({ children }: ChallengeRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    requirements: ['']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to request a challenge.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Submitting challenge request:', formData);
      console.log('User ID:', user.id);
      
      const { data, error } = await supabase
        .from('challenge_requests')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty.toLowerCase(),
          category: 'general', // Default category
          requirements: formData.requirements.join('; '),
          expected_outcome: '', // Empty string for removed field
          estimated_time: '', // Empty string for removed field
          additional_notes: '', // Empty string for removed field
          status: 'pending',
          created_at: new Date().toISOString()
        })
        .select();

      console.log('Insert result:', { data, error });

      if (error) {
        console.error('Database error:', error);
        
        // Check if it's a table not found error
        if (error.message?.includes('relation "challenge_requests" does not exist') || 
            error.message?.includes('404') ||
            error.code === 'PGRST116') {
          toast({
            title: "Table Not Found",
            description: "The challenge_requests table doesn't exist yet. Please run the database migration first.",
            variant: "destructive",
          });
          return;
        }
        
        throw error;
      }

      toast({
        title: "Success",
        description: "Your challenge request has been submitted for review!",
      });

      setOpen(false);
      setFormData({
        title: '',
        description: '',
        difficulty: '',
        requirements: ''
      });
    } catch (error) {
      console.error('Error submitting challenge request:', error);
      toast({
        title: "Error",
        description: "Failed to submit challenge request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
          <DialogTitle className="text-white">Request a New Challenge</DialogTitle>
          <DialogDescription className="text-gray-300">
            Suggest a new challenge idea for the NoCodeJam community. Our admins will review and potentially add it to the platform.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Challenge Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Build a Todo App with Airtable"
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
              placeholder="Describe what the challenge should involve..."
              className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="difficulty" className="text-white">Difficulty Level *</Label>
            <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="Beginner" className="text-white">Beginner</SelectItem>
                <SelectItem value="Intermediate" className="text-white">Intermediate</SelectItem>
                <SelectItem value="Expert" className="text-white">Expert</SelectItem>
              </SelectContent>
            </Select>
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
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
