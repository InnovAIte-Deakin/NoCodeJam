import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface OnboardingSubmissionFormProps {
  submissionType: 'url' | 'text';
  submissionLabel: string;
  onSubmit: (submissionData: { url?: string; text?: string }) => Promise<void>;
  isSubmitting?: boolean;
  isSubmitted?: boolean;
}

export function OnboardingSubmissionForm({
  submissionType,
  submissionLabel,
  onSubmit,
  isSubmitting = false,
  isSubmitted = false,
}: OnboardingSubmissionFormProps) {
  const [inputValue, setInputValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  // URL validation regex
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate input based on submission type
  const validateInput = (value: string): string | null => {
    if (!value.trim()) {
      return `${submissionLabel} is required`;
    }

    if (submissionType === 'url') {
      if (!isValidUrl(value)) {
        return 'Please enter a valid URL (e.g., https://example.com)';
      }
    }

    if (submissionType === 'text' && value.trim().length < 5) {
      return 'Please provide at least 5 characters';
    }

    return null;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const error = validateInput(inputValue);
    if (error) {
      setValidationError(error);
      return;
    }

    setValidationError(null);

    // Prepare submission data based on type
    const submissionData = submissionType === 'url' 
      ? { url: inputValue.trim() }
      : { text: inputValue.trim() };

    try {
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Submission error:', error);
      setValidationError('Failed to submit. Please try again.');
    }
  };

  // Handle input change
  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (validationError) {
      setValidationError(null);
    }
  };

  // If already submitted, show success state
  if (isSubmitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Step Submitted!</h3>
              <p className="text-green-700 text-sm">
                Your submission has been saved and is pending review.
              </p>
            </div>
          </div>
          
          {/* Show submitted value */}
          <div className="mt-4 p-3 bg-green-100 rounded-lg">
            <Label className="text-sm font-medium text-green-900">
              Submitted {submissionType === 'url' ? 'URL' : 'Text'}:
            </Label>
            <p className="text-green-800 text-sm mt-1 break-all">
              {inputValue || 'No data to display'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="submission-input" className="text-sm font-medium">
              {submissionLabel}
            </Label>
            
            {submissionType === 'url' ? (
              <Input
                id="submission-input"
                type="url"
                placeholder="https://example.com"
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                disabled={isSubmitting}
                className={validationError ? 'border-red-300 focus:border-red-500' : ''}
                aria-describedby={validationError ? 'validation-error' : undefined}
              />
            ) : (
              <Textarea
                id="submission-input"
                placeholder="Enter your response here..."
                value={inputValue}
                onChange={(e) => handleInputChange(e.target.value)}
                disabled={isSubmitting}
                rows={4}
                className={validationError ? 'border-red-300 focus:border-red-500' : ''}
                aria-describedby={validationError ? 'validation-error' : undefined}
              />
            )}

            {/* Validation Error */}
            {validationError && (
              <div 
                id="validation-error"
                className="flex items-center space-x-2 text-red-600 text-sm"
                role="alert"
              >
                <AlertCircle className="w-4 h-4" />
                <span>{validationError}</span>
              </div>
            )}

            {/* Helper Text */}
            <p className="text-sm text-gray-500">
              {submissionType === 'url' 
                ? 'Please enter a valid URL starting with http:// or https://'
                : 'Provide your response or explanation for this step'
              }
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !inputValue.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Step'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
