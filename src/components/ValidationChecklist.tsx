import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabaseClient';
import { normalizeRequirements } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, AlertTriangle, Loader2 } from 'lucide-react';
import type { Challenge, Pathway } from '@/types';

interface ValidationCheck {
  id: string;
  category: string;
  description: string;
  passed: boolean;
  notes: string;
}

interface ValidationChecklistProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  content: Challenge | Pathway;
  contentType: 'challenge' | 'pathway';
  onComplete: () => void;
}

export function ValidationChecklist({
  open,
  onOpenChange,
  content,
  contentType,
  onComplete,
}: ValidationChecklistProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [checks, setChecks] = useState<ValidationCheck[]>([]);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      performValidation();
    }
  }, [open, content, contentType]);

  const performValidation = () => {
    const validationChecks: ValidationCheck[] = [];

    if (contentType === 'challenge') {
      const challenge = content as Challenge;

      // Template Compliance
      validationChecks.push({
        id: 'has-title',
        category: 'Template Compliance',
        description: 'Has clear, descriptive title',
        passed: !!challenge.title && challenge.title.length > 5,
        notes: '',
      });

      validationChecks.push({
        id: 'has-description',
        category: 'Template Compliance',
        description: 'Has detailed description with instructions',
        passed: !!challenge.description && challenge.description.length > 50,
        notes: '',
      });

      validationChecks.push({
        id: 'has-requirements',
        category: 'Template Compliance',
        description: 'Has specific, measurable requirements',
        passed: normalizeRequirements(challenge.requirements).length > 0,
        notes: '',
      });

      // XP Compliance
      validationChecks.push({
        id: 'xp-system-calculated',
        category: 'XP Compliance',
        description: 'XP is system-calculated (not manually set)',
        passed: challenge.xp_reward !== null && challenge.xp_reward > 0,
        notes: challenge.xp_reward ? `Calculated: ${challenge.xp_reward} XP` : 'XP not calculated',
      });

      const descriptionText = challenge.description?.toLowerCase() || '';
      const hasManualXP = /xp:\s*\d+/.test(descriptionText) && !/\(calculated by system\)/.test(descriptionText);

      validationChecks.push({
        id: 'no-manual-xp',
        category: 'XP Compliance',
        description: 'Description doesn\'t contain manual XP values',
        passed: !hasManualXP,
        notes: hasManualXP ? 'Found manual XP value in description' : '',
      });

      // Tool Compliance
      const restrictedTerms = ['must use', 'required', 'mandatory', 'have to use', 'only works with'];
      const contentText = (challenge.description + ' ' + (challenge.recommended_tools?.join(' ') || '')).toLowerCase();
      const hasRestrictiveLanguage = restrictedTerms.some(term => contentText.includes(term));

      validationChecks.push({
        id: 'tools-recommended',
        category: 'Tool Compliance',
        description: 'Tools are recommended, not required',
        passed: !hasRestrictiveLanguage,
        notes: hasRestrictiveLanguage ? 'Found restrictive language about tools' : '',
      });

      validationChecks.push({
        id: 'has-tool-alternatives',
        category: 'Tool Compliance',
        description: 'Suggests alternatives or equivalents',
        passed: contentText.includes('or') || contentText.includes('similar') || contentText.includes('equivalent'),
        notes: '',
      });

      // Quality Checks
      validationChecks.push({
        id: 'difficulty-matches',
        category: 'Quality',
        description: 'Difficulty level matches content complexity',
        passed: true, // Manual check
        notes: 'Review manually',
      });

      validationChecks.push({
        id: 'time-realistic',
        category: 'Quality',
        description: 'Time estimate is realistic (10-240 minutes)',
        passed: challenge.estimated_time >= 10 && challenge.estimated_time <= 240,
        notes: `Estimated: ${challenge.estimated_time} minutes`,
      });

      validationChecks.push({
        id: 'no-jargon',
        category: 'Quality',
        description: 'Beginner content avoids unexplained jargon',
        passed: challenge.difficulty !== 'Beginner' || !contentText.includes('api') || contentText.includes('api ('),
        notes: 'Check if technical terms are explained',
      });

    } else {
      // Pathway validation
      const pathway = content as Pathway;

      validationChecks.push({
        id: 'has-title',
        category: 'Template Compliance',
        description: 'Has clear pathway title',
        passed: !!pathway.title && pathway.title.length > 5,
        notes: '',
      });

      validationChecks.push({
        id: 'has-description',
        category: 'Template Compliance',
        description: 'Has detailed learning objectives',
        passed: !!pathway.description && pathway.description.length > 50,
        notes: '',
      });

      validationChecks.push({
        id: 'has-time-estimate',
        category: 'Quality',
        description: 'Has realistic total time estimate',
        passed: pathway.estimated_time !== null && pathway.estimated_time > 0,
        notes: pathway.estimated_time ? `${pathway.estimated_time} minutes` : '',
      });

      validationChecks.push({
        id: 'xp-calculated',
        category: 'XP Compliance',
        description: 'Total XP is calculated from challenges',
        passed: pathway.total_xp !== null && pathway.total_xp > 0,
        notes: pathway.total_xp ? `${pathway.total_xp} XP` : '',
      });
    }

    setChecks(validationChecks);
  };

  const toggleCheck = (checkId: string) => {
    setChecks(prev =>
      prev.map(check =>
        check.id === checkId ? { ...check, passed: !check.passed } : check
      )
    );
  };

  const updateNotes = (checkId: string, notes: string) => {
    setChecks(prev =>
      prev.map(check =>
        check.id === checkId ? { ...check, notes } : check
      )
    );
  };

  const handleApprove = async () => {
    const allPassed = checks.every(check => check.passed);

    if (!allPassed) {
      const confirm = window.confirm(
        'Not all checks passed. Are you sure you want to approve this content?'
      );
      if (!confirm) return;
    }

    setSubmitting(true);

    try {
      const table = contentType === 'challenge' ? 'challenges' : 'pathways';
      const { error } = await supabase
        .from(table)
        .update({
          status: 'published',
          updated_at: new Date().toISOString(),
        })
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: 'Approved!',
        description: `${contentType === 'challenge' ? 'Challenge' : 'Pathway'} has been published.`,
      });

      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error approving:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve content.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes) {
      toast({
        title: 'Notes Required',
        description: 'Please add notes explaining why this content is being rejected.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const table = contentType === 'challenge' ? 'challenges' : 'pathways';
      const { error } = await supabase
        .from(table)
        .update({
          status: 'draft',
          updated_at: new Date().toISOString(),
        })
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: 'Rejected',
        description: 'Content returned to draft. Creator will be notified.',
      });

      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error rejecting:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject content.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!reviewNotes) {
      toast({
        title: 'Notes Required',
        description: 'Please specify what changes are needed.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const table = contentType === 'challenge' ? 'challenges' : 'pathways';
      const { error } = await supabase
        .from(table)
        .update({
          status: 'draft',
          updated_at: new Date().toISOString(),
        })
        .eq('id', content.id);

      if (error) throw error;

      toast({
        title: 'Changes Requested',
        description: 'Author will be notified of required changes.',
      });

      onComplete();
      onOpenChange(false);
    } catch (error) {
      console.error('Error requesting changes:', error);
      toast({
        title: 'Error',
        description: 'Failed to request changes.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const passedCount = checks.filter(c => c.passed).length;
  const totalCount = checks.length;
  const passPercentage = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  const groupedChecks = checks.reduce((acc, check) => {
    if (!acc[check.category]) {
      acc[check.category] = [];
    }
    acc[check.category].push(check);
    return acc;
  }, {} as Record<string, ValidationCheck[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">Validation Checklist</DialogTitle>
          <DialogDescription className="text-gray-300">
            Review {contentType} for compliance with NoCodeJam governance rules
          </DialogDescription>
        </DialogHeader>

        {/* Progress Summary */}
        <Card className="bg-gray-700 border-gray-600">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Validation Progress</span>
              <span className="text-white">
                {passedCount} / {totalCount} checks passed
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  passPercentage === 100 ? 'bg-green-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${passPercentage}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedChecks).map(([category, categoryChecks]) => (
              <Card key={category} className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white text-lg">{category}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {categoryChecks.map(check => (
                    <div key={check.id} className="space-y-2">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id={check.id}
                          checked={check.passed}
                          onCheckedChange={() => toggleCheck(check.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor={check.id}
                            className="text-white cursor-pointer flex items-center"
                          >
                            {check.passed ? (
                              <CheckCircle2 className="w-4 h-4 mr-2 text-green-400" />
                            ) : (
                              <XCircle className="w-4 h-4 mr-2 text-red-400" />
                            )}
                            {check.description}
                          </Label>
                          {check.notes && (
                            <p className="text-sm text-gray-400 mt-1 ml-6">{check.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>

        {/* Review Notes */}
        <div className="space-y-2">
          <Label htmlFor="review-notes" className="text-white">
            Review Notes
          </Label>
          <Textarea
            id="review-notes"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Add any comments or feedback for the author..."
            className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Button
            onClick={handleRequestChanges}
            disabled={submitting}
            variant="outline"
            className="border-yellow-600 text-yellow-400 hover:bg-yellow-900"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Request Changes
          </Button>

          <div className="flex gap-3">
            <Button
              onClick={handleReject}
              disabled={submitting}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-900"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4 mr-2" />
              )}
              Approve & Publish
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
