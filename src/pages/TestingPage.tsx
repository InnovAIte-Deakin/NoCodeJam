import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, TestTube } from 'lucide-react';
import { getOnboardingProgress, updateOnboardingProgress, verifyOnboardingStep } from '@/services/onboardingService';
import { useToast } from '@/hooks/use-toast';

export default function TestingPage() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, any>>({});
  const [verifyCode, setVerifyCode] = useState('');
  const [updateStep, setUpdateStep] = useState('');
  const { toast } = useToast();

  const handleTest = async (testName: string, testFunction: () => Promise<any>) => {
    setLoading(prev => ({ ...prev, [testName]: true }));
    try {
      const result = await testFunction();
      setResults(prev => ({ ...prev, [testName]: { success: true, data: result } }));
      toast({
        title: "Test Successful",
        description: `${testName} completed successfully`,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setResults(prev => ({ ...prev, [testName]: { success: false, error: errorMessage } }));
      toast({
        title: "Test Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [testName]: false }));
    }
  };

  const testGetProgress = () => getOnboardingProgress();

  const testUpdateProgress = () => {
    const step = parseInt(updateStep);
    if (isNaN(step) || step < 0) {
      throw new Error('Please enter a valid step number (0 or greater)');
    }
    return updateOnboardingProgress(step);
  };

  const testVerifyStep = () => {
    if (!verifyCode.trim()) {
      throw new Error('Please enter a verification code');
    }
    return verifyOnboardingStep(verifyCode.trim());
  };

  const renderResult = (testName: string) => {
    const result = results[testName];
    if (!result) return null;

    return (
      <Alert className={`mt-2 ${result.success ? 'border-green-500' : 'border-red-500'}`}>
        <div className="flex items-center">
          {result.success ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription className="ml-2">
            {result.success ? 'Success' : 'Error'}: {result.success ? JSON.stringify(result.data, null, 2) : result.error}
          </AlertDescription>
        </div>
      </Alert>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center space-x-2 mb-6">
          <TestTube className="h-6 w-6 text-purple-600" />
          <h1 className="text-3xl font-bold text-gray-900">API Testing</h1>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Get Onboarding Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Get Onboarding Progress</span>
              </CardTitle>
              <CardDescription>
                Test the get-onboarding-progress Edge Function
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleTest('getProgress', testGetProgress)}
                disabled={loading.getProgress}
                className="w-full"
              >
                {loading.getProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Test Get Progress
              </Button>
              {renderResult('getProgress')}
            </CardContent>
          </Card>

          {/* Update Onboarding Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Update Onboarding Progress</span>
              </CardTitle>
              <CardDescription>
                Test the update-onboarding-progress Edge Function
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="updateStep">Completed Step Number</Label>
                  <Input
                    id="updateStep"
                    type="number"
                    placeholder="Enter step number (e.g., 1)"
                    value={updateStep}
                    onChange={(e) => setUpdateStep(e.target.value)}
                    min="0"
                  />
                </div>
                <Button
                  onClick={() => handleTest('updateProgress', testUpdateProgress)}
                  disabled={loading.updateProgress || !updateStep.trim()}
                  className="w-full"
                >
                  {loading.updateProgress && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test Update Progress
                </Button>
                {renderResult('updateProgress')}
              </div>
            </CardContent>
          </Card>

          {/* Verify Onboarding Step */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>Verify Onboarding Step</span>
              </CardTitle>
              <CardDescription>
                Test the verify Edge Function
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="verifyCode">Verification Code</Label>
                  <Input
                    id="verifyCode"
                    placeholder="Enter verification code"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value)}
                  />
                </div>
                <Button
                  onClick={() => handleTest('verifyStep', testVerifyStep)}
                  disabled={loading.verifyStep || !verifyCode.trim()}
                  className="w-full"
                >
                  {loading.verifyStep && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test Verify Step
                </Button>
                {renderResult('verifyStep')}
              </div>
            </CardContent>
          </Card>

          {/* API Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span>API Status</span>
              </CardTitle>
              <CardDescription>
                Current test results summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Get Progress:</span>
                  <span className={`font-medium ${results.getProgress?.success ? 'text-green-600' : results.getProgress?.success === false ? 'text-red-600' : 'text-gray-500'}`}>
                    {results.getProgress ? (results.getProgress.success ? '✅ Pass' : '❌ Fail') : 'Not tested'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Update Progress:</span>
                  <span className={`font-medium ${results.updateProgress?.success ? 'text-green-600' : results.updateProgress?.success === false ? 'text-red-600' : 'text-gray-500'}`}>
                    {results.updateProgress ? (results.updateProgress.success ? '✅ Pass' : '❌ Fail') : 'Not tested'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Verify Step:</span>
                  <span className={`font-medium ${results.verifyStep?.success ? 'text-green-600' : results.verifyStep?.success === false ? 'text-red-600' : 'text-gray-500'}`}>
                    {results.verifyStep ? (results.verifyStep.success ? '✅ Pass' : '❌ Fail') : 'Not tested'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
            <CardDescription>
              How to use this testing page
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-gray-600">
              <div>
                <strong>Get Onboarding Progress:</strong> Tests fetching the current user's latest completed step from the database.
              </div>
              <div>
                <strong>Update Onboarding Progress:</strong> Tests updating the user's progress to a specific step number. Enter a number (0 or greater) and click test.
              </div>
              <div>
                <strong>Verify Onboarding Step:</strong> Tests the verification endpoint with a code. This will likely fail until you have actual verification codes from completed challenges.
              </div>
              <div>
                <strong>Note:</strong> Make sure you're logged in to test these functions. The tests use your current authentication session.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
