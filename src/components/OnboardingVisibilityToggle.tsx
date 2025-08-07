import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';
import { EyeOff } from 'lucide-react';

interface OnboardingVisibilityToggleProps {
  onHide: () => void;
}

export function OnboardingVisibilityToggle({ onHide }: OnboardingVisibilityToggleProps) {
  const [isHiding, setIsHiding] = useState(false);

  const handleHide = async () => {
    setIsHiding(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please log in to hide the onboarding card.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(`${supabase.supabaseUrl}/functions/v1/set-onboarding-visibility`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isHidden: true }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to hide onboarding card');
      }

      onHide();
      toast({
        title: "Onboarding card hidden",
        description: "You can show it again by clicking 'Show Onboarding' below.",
      });

    } catch (error) {
      console.error('Error hiding onboarding:', error);
      toast({
        title: "Failed to hide card",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive",
      });
    } finally {
      setIsHiding(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleHide}
      disabled={isHiding}
      className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm border-0 shadow-lg transition-all duration-200"
    >
      <EyeOff className="w-4 h-4 mr-2" />
      {isHiding ? 'Hiding...' : 'Hide'}
    </Button>
  );
}
