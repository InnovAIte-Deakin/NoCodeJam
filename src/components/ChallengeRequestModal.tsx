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
import { Plus, XCircle, Sparkles } from 'lucide-react';

interface ChallengeRequestModalProps {
  children: React.ReactNode;
}

type DraftResponse =
  | { ok: true; draft: Draft }
  | { ok?: false; error: string };

type Draft = {
  title: string;
  difficulty: string;
  estimatedMinutes?: number;
  context?: string;
  objective?: string;
  acceptanceCriteria?: string[];
  deliverables?: string[];
  reflectionPrompt?: string;
};

export function ChallengeRequestModal({ children }: ChallengeRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false); // submit loading
  const [aiLoading, setAiLoading] = useState(false); // AI assist loading

  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    requirements: [''],
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
      const { data, error } = await supabase
        .from('challenge_requests')
        .insert({
          user_id: user.id,
          title: formData.title,
          description: formData.description,
          difficulty: formData.difficulty.toLowerCase(),
          category: 'general', // Default category
          requirements: formData.requirements.filter(Boolean).join('; '),
          expected_outcome: '',
          estimated_time: '',
          additional_notes: '',
          status: 'pending',
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        // Check if it's a table not found error
        if (
          error.message?.includes('relation "challenge_requests" does not exist') ||
          error.message?.includes('404') ||
          error.code === 'PGRST116'
        ) {
          toast({
            title: "Table Not Found",
            description: "The challenge_requests table doesn't exist yet. Please run the database migration first.",
            variant: "destructive",
          });
          return;
        }

        throw error;
      }

      // Optional: you can keep these logs if you want
      console.log('Insert result:', { data, error });

      toast({
        title: "Success",
        description: "Your challenge request has been submitted for review!",
      });

      setOpen(false);

      // FIX: requirements must reset to array, not string
      setFormData({
        title: '',
        description: '',
        difficulty: '',
        requirements: [''],
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

  const handleInputChange = (field: 'title' | 'description' | 'difficulty', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, ''],
    }));
  };

  const updateRequirement = (index: number, value: string) => {
    const updated = [...formData.requirements];
    updated[index] = value;
    setFormData(prev => ({
      ...prev,
      requirements: updated,
    }));
  };

  const removeRequirement = (index: number) => {
    if (formData.requirements.length > 1) {
      const updated = formData.requirements.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        requirements: updated,
      }));
    }
  };

  const handleAiAssist = async () => {
    setAiLoading(true);

    try {
      // Send minimal context to the function (extend later if needed)
      const payload = {
        title: formData.title || undefined,
        description: formData.description || undefined,
        difficulty: formData.difficulty || undefined,
      };

      const { data, error } = await supabase.functions.invoke<DraftResponse>('generate-challenge', {
        body: payload,
      });

      if (error) {
        throw new Error(error.message || 'Failed to invoke AI function');
      }
      if (!data || ('error' in data && data.error)) {
        throw new Error((data as { error: string }).error || 'Invalid AI response');
      }

      const draft = (data as { ok: true; draft: Draft }).draft;

      const mappedDescription = [
        draft.context?.trim() ?? '',
        '',
        draft.objective ? `Objective: ${draft.objective.trim()}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const mappedRequirements: string[] = [
        ...(draft.acceptanceCriteria ?? []),
        ...(draft.deliverables ?? []),
        ...(draft.reflectionPrompt ? [draft.reflectionPrompt] : []),
      ].filter(Boolean);

      setFormData(prev => ({
        ...prev,
        title: draft.title ?? prev.title,
        difficulty: draft.difficulty ?? prev.difficulty,
        description: mappedDescription || prev.description,
        requirements: mappedRequirements.length ? mappedRequirements : prev.requirements,
      }));

      toast({
        title: "AI Draft Generated",
        description: "Fields have been populated with a draft. Review and edit before submitting.",
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'AI Assist failed unexpectedly';
      toast({
        title: "AI Assist Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div>
              <DialogTitle className="text-white">Request a New Challenge</DialogTitle>
              <DialogDescription className="text-gray-300">
                Suggest a new challenge idea for the NoCodeJam community. Our admins will review and potentially add it to the platform.
              </DialogDescription>
            </div>

          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-white">Challenge Title *</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleAiAssist}
                disabled={aiLoading}
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 h-6 px-2 text-xs"
                title="Generate a draft using AI"
              >
                <Sparkles className="w-3 h-3 mr-1.5" />
                {aiLoading ? 'Generating...' : 'AI Assist'}
              </Button>
            </div>
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
