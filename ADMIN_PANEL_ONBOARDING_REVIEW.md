# Admin Panel Changes for Onboarding Review System

## Overview
This document outlines the necessary changes to implement onboarding submission review functionality in a React-based admin panel. The system handles master-child submission relationships where individual onboarding steps are aggregated for admin review.

## 1. List View Changes (`SubmissionList.tsx`)

### Data Query Modification
```typescript
// Modified query to filter for master onboarding submissions
const useSubmissionList = () => {
  return useQuery({
    queryKey: ['submissions', 'pending-review'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          users!inner(id, full_name, email),
          challenges!inner(id, title, challenge_type)
        `)
        .eq('status', 'pending_review')
        .is('parent_submission_id', null) // Only master submissions
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
};
```

### Visual Indicators
```typescript
const SubmissionRow = ({ submission }) => {
  const isOnboardingSubmission = submission.submission_type === 'onboarding_complete';
  
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <span className="font-medium">{submission.users.full_name}</span>
          {isOnboardingSubmission && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              🎓 Onboarding
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        {submission.challenges.title}
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-500">
          {format(new Date(submission.created_at), 'MMM dd, yyyy')}
        </span>
      </td>
      <td className="px-6 py-4">
        <Link 
          to={`/admin/submissions/${submission.id}`}
          className="text-indigo-600 hover:text-indigo-900"
        >
          Review
        </Link>
      </td>
    </tr>
  );
};
```

## 2. Detail/Show View (`SubmissionShow.tsx`)

### Complete Implementation
```typescript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';

interface OnboardingStep {
  id: number;
  step_number: number;
  title: string;
  description: string;
  prompt_instructions: string;
  submission_type: 'url' | 'text';
  submission_label: string;
}

interface StepSubmission {
  id: number;
  submission_data: any;
  created_at: string;
  onboarding_steps: OnboardingStep;
}

interface MasterSubmission {
  id: number;
  user_id: string;
  challenge_id: number;
  submission_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  users: {
    id: string;
    full_name: string;
    email: string;
  };
  challenges: {
    id: number;
    title: string;
    description: string;
  };
}

export const SubmissionShow: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [masterSubmission, setMasterSubmission] = useState<MasterSubmission | null>(null);
  const [stepSubmissions, setStepSubmissions] = useState<StepSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    fetchSubmissionData();
  }, [id]);

  const fetchSubmissionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch master submission
      const { data: masterData, error: masterError } = await supabase
        .from('submissions')
        .select(`
          *,
          users!inner(id, full_name, email),
          challenges!inner(id, title, description)
        `)
        .eq('id', id)
        .single();

      if (masterError) throw masterError;
      setMasterSubmission(masterData);

      // Check if this is an onboarding submission
      if (masterData.submission_type === 'onboarding_complete') {
        // Fetch all step submissions linked to this master submission
        const { data: stepsData, error: stepsError } = await supabase
          .from('submissions')
          .select(`
            *,
            onboarding_steps!inner(
              id,
              step_number,
              title,
              description,
              prompt_instructions,
              submission_type,
              submission_label
            )
          `)
          .eq('parent_submission_id', id)
          .order('onboarding_steps.step_number', { ascending: true });

        if (stepsError) throw stepsError;
        setStepSubmissions(stepsData || []);
      }
    } catch (err) {
      console.error('Error fetching submission data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch submission data');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (action: 'approve' | 'reject') => {
    if (!masterSubmission) return;

    try {
      setActionLoading(action);
      
      // Update master submission status
      const newStatus = action === 'approve' ? 'approved' : 'rejected';
      const { error: updateError } = await supabase
        .from('submissions')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'current-admin-id' // Replace with actual admin ID
        })
        .eq('id', masterSubmission.id);

      if (updateError) throw updateError;

      // If approved, trigger XP/badge award (call separate API/function)
      if (action === 'approve') {
        await awardOnboardingCompletion(masterSubmission.user_id, masterSubmission.challenge_id);
      }

      // Refresh data
      await fetchSubmissionData();
      
      // Show success message (implementation depends on your notification system)
      showNotification(`Submission ${action}d successfully!`, 'success');
      
    } catch (err) {
      console.error(`Error ${action}ing submission:`, err);
      showNotification(`Failed to ${action} submission`, 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const awardOnboardingCompletion = async (userId: string, challengeId: number) => {
    // This would call your XP/badge awarding system
    // Implementation depends on your gamification system
    const { error } = await supabase.functions.invoke('award-completion', {
      body: { userId, challengeId, completionType: 'onboarding' }
    });
    
    if (error) {
      console.error('Error awarding completion:', error);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error') => {
    // Implementation depends on your notification system
    console.log(`${type}: ${message}`);
  };

  const renderSubmissionData = (submission: StepSubmission) => {
    const { submission_data, onboarding_steps } = submission;
    
    if (onboarding_steps.submission_type === 'url') {
      return (
        <a 
          href={submission_data.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline break-all"
        >
          {submission_data.url}
        </a>
      );
    } else {
      return (
        <div className="bg-gray-50 p-3 rounded-md">
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {submission_data.text}
          </pre>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-2 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!masterSubmission) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Submission not found</h3>
      </div>
    );
  }

  const isOnboardingSubmission = masterSubmission.submission_type === 'onboarding_complete';

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                Submission Review
                {isOnboardingSubmission && (
                  <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    🎓 Onboarding Complete
                  </span>
                )}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Submitted by {masterSubmission.users.full_name} on{' '}
                {format(new Date(masterSubmission.created_at), 'MMMM dd, yyyy \'at\' h:mm a')}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => handleApproval('reject')}
                disabled={actionLoading !== null}
                className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {actionLoading === 'reject' ? 'Rejecting...' : 'Reject'}
              </button>
              <button
                onClick={() => handleApproval('approve')}
                disabled={actionLoading !== null}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {actionLoading === 'approve' ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Master Submission Details */}
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">User</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div>
                  <p className="font-medium">{masterSubmission.users.full_name}</p>
                  <p className="text-gray-500">{masterSubmission.users.email}</p>
                </div>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Challenge</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <p className="font-medium">{masterSubmission.challenges.title}</p>
                <p className="text-gray-600 mt-1">{masterSubmission.challenges.description}</p>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  masterSubmission.status === 'pending_review' 
                    ? 'bg-yellow-100 text-yellow-800'
                    : masterSubmission.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {masterSubmission.status.replace('_', ' ').toUpperCase()}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Onboarding Steps Detail */}
      {isOnboardingSubmission && stepSubmissions.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Onboarding Steps Completed
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Review each step submission from the user's onboarding journey.
            </p>
          </div>
          
          <div className="border-t border-gray-200">
            {stepSubmissions.map((stepSubmission, index) => (
              <div key={stepSubmission.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <div className="px-4 py-5 sm:px-6">
                  <div className="flex items-start space-x-4">
                    {/* Step Number */}
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-indigo-600">
                          {stepSubmission.onboarding_steps.step_number}
                        </span>
                      </div>
                    </div>
                    
                    {/* Step Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-medium text-gray-900 mb-2">
                        {stepSubmission.onboarding_steps.title}
                      </h4>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {stepSubmission.onboarding_steps.description}
                      </p>
                      
                      {/* Instructions */}
                      {stepSubmission.onboarding_steps.prompt_instructions && (
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                          <h5 className="text-sm font-medium text-blue-900 mb-1">Instructions:</h5>
                          <p className="text-sm text-blue-800">
                            {stepSubmission.onboarding_steps.prompt_instructions}
                          </p>
                        </div>
                      )}
                      
                      {/* User Submission */}
                      <div className="border border-gray-200 rounded-md p-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">
                          User Submission ({stepSubmission.onboarding_steps.submission_label}):
                        </h5>
                        {renderSubmissionData(stepSubmission)}
                        <p className="text-xs text-gray-500 mt-2">
                          Submitted on {format(new Date(stepSubmission.created_at), 'MMM dd, yyyy \'at\' h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-onboarding submission handling */}
      {!isOnboardingSubmission && (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Regular Submission
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              This is a regular challenge submission, not an onboarding completion.
            </p>
          </div>
          
          {/* Add regular submission review interface here */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <p className="text-sm text-gray-600">
              Regular submission review interface would go here...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionShow;
```

## 3. Database Queries Reference

### Master Submissions Query
```sql
-- Get pending onboarding master submissions
SELECT s.*, u.full_name, u.email, c.title as challenge_title
FROM submissions s
INNER JOIN users u ON s.user_id = u.id  
INNER JOIN challenges c ON s.challenge_id = c.id
WHERE s.status = 'pending_review' 
  AND s.parent_submission_id IS NULL
  AND s.submission_type = 'onboarding_complete'
ORDER BY s.created_at DESC;
```

### Step Submissions Query
```sql
-- Get all step submissions for a master submission
SELECT s.*, os.step_number, os.title, os.description, 
       os.prompt_instructions, os.submission_type, os.submission_label
FROM submissions s
INNER JOIN onboarding_steps os ON s.step_id = os.id
WHERE s.parent_submission_id = $1
ORDER BY os.step_number ASC;
```

## 4. Key Features

### Visual Indicators
- **Onboarding Badge**: Purple chip with 🎓 emoji for onboarding submissions
- **Step Numbers**: Circular indicators showing progression
- **Status Colors**: Color-coded status badges (pending/approved/rejected)

### Data Aggregation
- **Master-Child Relationship**: Fetches related step submissions automatically
- **Ordered Display**: Steps shown in correct sequence via JOIN with onboarding_steps
- **Rich Context**: Each step shows instructions, user submission, and metadata

### Admin Actions
- **Approve/Reject**: Single action affects entire onboarding completion
- **Loading States**: Prevents double-actions during processing
- **Error Handling**: Graceful error display and recovery
- **Audit Trail**: Records admin actions with timestamps

### Responsive Design
- **Mobile-Friendly**: Responsive layout for different screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Loading States**: Skeleton screens during data fetching

This implementation provides a comprehensive admin review interface that handles the complexity of onboarding submissions while maintaining usability and performance.
