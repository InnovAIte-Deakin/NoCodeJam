import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidLink, setIsValidLink] = useState(false);
  const [passwordMatchesOld, setPasswordMatchesOld] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Supabase typically uses these parameter names
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');
  
  // Alternative parameter names that Supabase might use
  const token = searchParams.get('token');
  const code = searchParams.get('code');

  useEffect(() => {
    const handlePasswordReset = async () => {
      setIsValidating(true);
      
      try {
        // Check if we have the expected parameters
        if (type === 'recovery' && (accessToken || token || code)) {
          if (accessToken && refreshToken) {
            // Method 1: Use tokens directly
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            
            if (!error) {
              setIsValidLink(true);
            }
          } else {
            // Method 2: Let Supabase handle the session from URL
            const { error } = await supabase.auth.getSession();
            if (!error) {
              setIsValidLink(true);
            }
          }
        } else {
          // Try to get current session (in case user is already authenticated from the email link)
          const { data: { session }, error } = await supabase.auth.getSession();
          if (session && !error) {
            setIsValidLink(true);
          }
        }
      } catch (error) {
        console.error('Session validation error:', error);
      } finally {
        setIsValidating(false);
      }
    };

    handlePasswordReset();
  }, [accessToken, refreshToken, type, token, code]);

  // Check if new password matches the old password
  useEffect(() => {
    const checkPasswordMatch = async () => {
      if (password.length >= 6) { // Only check if password has reasonable length
        try {
          const { data: { user }, error } = await supabase.auth.getUser();
          if (user && user.email && !error) {
            // Try to sign in with the new password to see if it matches the old one
            const { error: signInError } = await supabase.auth.signInWithPassword({
              email: user.email,
              password: password
            });
            
            // If sign in succeeds, it means the password is the same as the old one
            if (!signInError) {
              setPasswordMatchesOld(true);
            } else {
              setPasswordMatchesOld(false);
            }
          }
        } catch (error) {
          // If there's an error, assume password doesn't match old one
          setPasswordMatchesOld(false);
        }
      } else {
        setPasswordMatchesOld(false);
      }
    };

    // Debounce the check to avoid too many API calls
    const timeoutId = setTimeout(checkPasswordMatch, 500);
    return () => clearTimeout(timeoutId);
  }, [password]);

  const validatePassword = (pwd: string) => {
    const minLength = pwd.length >= 8;
    const hasUppercase = /[A-Z]/.test(pwd);
    const hasLowercase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    
    return {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      isValid: minLength && hasUppercase && hasLowercase && hasNumbers
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validatePassword(password);
    
    if (!validation.isValid) {
      toast({
        title: "Password requirements not met",
        description: "Please ensure your password meets all requirements.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical.",
        variant: "destructive",
      });
      return;
    }

    if (passwordMatchesOld) {
      toast({
        title: "Password unchanged",
        description: "Your new password must be different from your current password.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        // Handle specific Supabase errors
        if (error.message.includes('same as the old password') || error.message.includes('identical')) {
          toast({
            title: "Password unchanged",
            description: "Your new password must be different from your current password.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      setIsSuccess(true);
      toast({
        title: "Password updated successfully",
        description: "Your password has been updated. You will be redirected to login.",
      });

      // Sign out the user and redirect to login after 2 seconds
      setTimeout(async () => {
        await supabase.auth.signOut();
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Password reset error:', error);
      toast({
        title: "Error",
        description: "Failed to update password. Please try again or request a new reset link.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating
  if (isValidating) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Validating reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidLink) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 font-bold text-xl">!</span>
            </div>
            <CardTitle>Invalid Reset Link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/forgot-password')} 
              className="w-full"
            >
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle>Password Updated!</CardTitle>
            <CardDescription>
              Your password has been successfully updated. You will be redirected to login shortly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const validation = validatePassword(password);

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">New Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
              
              {/* Password Requirements */}
              {password && (
                <div className="mt-2 space-y-1 text-xs">
                  <div className={`flex items-center ${validation.minLength ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-1">{validation.minLength ? '✓' : '✗'}</span>
                    At least 8 characters
                  </div>
                  <div className={`flex items-center ${validation.hasUppercase ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-1">{validation.hasUppercase ? '✓' : '✗'}</span>
                    One uppercase letter
                  </div>
                  <div className={`flex items-center ${validation.hasLowercase ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-1">{validation.hasLowercase ? '✓' : '✗'}</span>
                    One lowercase letter
                  </div>
                  <div className={`flex items-center ${validation.hasNumbers ? 'text-green-600' : 'text-red-600'}`}>
                    <span className="mr-1">{validation.hasNumbers ? '✓' : '✗'}</span>
                    One number
                  </div>
                  {/* New password vs old password check */}
                  {password.length >= 6 && (
                    <div className={`flex items-center ${!passwordMatchesOld ? 'text-green-600' : 'text-red-600'}`}>
                      <span className="mr-1">{!passwordMatchesOld ? '✓' : '✗'}</span>
                      Different from current password
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <div className={`mt-1 text-xs flex items-center ${
                  password === confirmPassword ? 'text-green-600' : 'text-red-600'
                }`}>
                  <span className="mr-1">{password === confirmPassword ? '✓' : '✗'}</span>
                  Passwords {password === confirmPassword ? 'match' : "don't match"}
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={
                isLoading || 
                !validation.isValid || 
                password !== confirmPassword || 
                passwordMatchesOld
              }
            >
              {isLoading ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}