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
import { AIChallengeChat } from './AIChallengeChat';
import type { CreateChallengeInput, ChallengeType } from '@/types';

interface ChallengeRequestModalProps {
  children: React.ReactNode;
}

export function ChallengeRequestModal({ children }: ChallengeRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiChatOpen, setAiChatOpen] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: '',
    requirements: [''],
    estimatedTime: '', // User wants mandatory time box
    challengeType: '', // Build / Modify / Analyse / Deploy / Reflect
    recommendedTools: '', // Comma separated string for input
    coverImageDescription: '',
    versionNumber: '1.0',
    xpReward: '', // System calculated
  });

  const [showSuccess, setShowSuccess] = useState(false);

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
      // Parse recommended tools from comma-separated string to array
      const toolsArray = formData.recommendedTools
        .split(',')
        .map(tool => tool.trim())
        .filter(Boolean);

      // Create the challenge input matching the new schema
      const challengeInput: CreateChallengeInput = {
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements.filter(Boolean),
        difficulty: formData.difficulty as CreateChallengeInput['difficulty'],
        challenge_type: (formData.challengeType || 'Build') as ChallengeType,
        estimated_time: parseInt(formData.estimatedTime) || 60,
        recommended_tools: toolsArray,
        status: 'draft', // Start as draft for review
        ai_generated: false, // User-created challenge
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from('challenges')
        .insert(challengeInput)
        .select();

      if (error) {
        if (
          error.message?.includes('relation "challenges" does not exist') ||
          error.message?.includes('404') ||
          error.code === 'PGRST116'
        ) {
          toast({
            title: "Table Not Found",
            description: "The challenges table doesn't exist yet. Please run the database migration first.",
            variant: "destructive",
          });
          return;
        }

        throw error;
      }

      console.log('Insert result:', { data, error });

      setLoading(false);
      setShowSuccess(true);
      // Don't close open yet, show success screen instead

      setFormData({
        title: '',
        description: '',
        difficulty: '',
        requirements: [''],
        estimatedTime: '',
        challengeType: '',
        recommendedTools: '',
        coverImageDescription: '',
        versionNumber: '1.0',
        xpReward: '',
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
      [field]: value,
    }));
  };

  const handleReturnToChallenges = () => {
    setOpen(false);
    setShowSuccess(false);
    // Navigate logic or just close modal as "Challenges" is likely the dashboard
  };

  const handleGoHome = () => {
    setOpen(false);
    setShowSuccess(false);
    window.location.href = '/'; // Simple redirection to home
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

  const handleAiAssist = () => {
    setAiChatOpen(true);
  };

  const handleChallengeGenerated = (challengeData: any) => {
    setFormData({
      title: challengeData.title || '',
      description: challengeData.fullDescription || '',
      difficulty: challengeData.difficulty || '',
      requirements: challengeData.requirements || [''],
      estimatedTime: challengeData.estimatedTime ? String(challengeData.estimatedTime) : '',
      challengeType: challengeData.challengeType || '',
      recommendedTools: challengeData.recommendedTools ? challengeData.recommendedTools.join(', ') : '',
      coverImageDescription: challengeData.coverImageDescription || '',
      versionNumber: challengeData.versionNumber || '1.0',
      xpReward: challengeData.xp || '(calculated by system)',
    });

    toast({
      title: "Challenge Generated!",
      description: "Form populated with AI-generated challenge. Review and submit when ready.",
    });
  };

  return (
    <>
      <AIChallengeChat
        open={aiChatOpen}
        onOpenChange={setAiChatOpen}
        onChallengeGenerated={handleChallengeGenerated}
      />

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

          {!showSuccess && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title" className="text-white">Challenge Title *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAiAssist}
                    className="text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 h-6 px-2 text-xs"
                    title="Chat with AI to generate a challenge"
                  >
                    <Sparkles className="w-3 h-3 mr-1.5" />
                    AI Assist
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="estimatedTime" className="text-white">Estimated Time (mins) *</Label>
                  <Input
                    id="estimatedTime"
                    type="number"
                    value={formData.estimatedTime}
                    onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                    placeholder="e.g. 60"
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="challengeType" className="text-white">Challenge Type</Label>
                  <Select value={formData.challengeType} onValueChange={(value) => handleInputChange('challengeType', value)}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="Build" className="text-white">Build</SelectItem>
                      <SelectItem value="Modify" className="text-white">Modify</SelectItem>
                      <SelectItem value="Analyse" className="text-white">Analyse</SelectItem>
                      <SelectItem value="Deploy" className="text-white">Deploy</SelectItem>
                      <SelectItem value="Reflect" className="text-white">Reflect</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendedTools" className="text-white">Recommended Tools</Label>
                <Input
                  id="recommendedTools"
                  value={formData.recommendedTools}
                  onChange={(e) => handleInputChange('recommendedTools', e.target.value)}
                  placeholder="e.g. React, Supabase, Tailwind (comma separated)"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="versionNumber" className="text-white">Version</Label>
                  <Input
                    id="versionNumber"
                    value={formData.versionNumber}
                    onChange={(e) => handleInputChange('versionNumber', e.target.value)}
                    placeholder="1.0"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="xpReward" className="text-white">XP Reward</Label>
                  <Input
                    id="xpReward"
                    value={formData.xpReward}
                    readOnly
                    placeholder="(System Calculated)"
                    className="bg-gray-800 border-gray-600 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverImage" className="text-white">Cover Image Description</Label>
                <Input
                  id="coverImage"
                  value={formData.coverImageDescription}
                  onChange={(e) => handleInputChange('coverImageDescription', e.target.value)}
                  placeholder="AI suggestion for cover image..."
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
                  {loading ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          )}

          {/* Success View */}
          {showSuccess && (
            <div className="flex flex-col items-center justify-center space-y-6 py-10 text-center">
              <div className="bg-green-500/20 p-4 rounded-full">
                <Sparkles className="w-12 h-12 text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">Challenge Submitted!</h3>
                <p className="text-gray-300 max-w-md">
                  Your challenge request has been successfully created. Our team will review it shortly.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={handleGoHome}
                  className="border-gray-600 text-gray-200 hover:bg-gray-700 min-w-[120px]"
                >
                  Home
                </Button>
                <Button
                  onClick={handleReturnToChallenges}
                  className="bg-purple-600 hover:bg-purple-700 text-white min-w-[160px]"
                >
                  Return to Challenges
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
