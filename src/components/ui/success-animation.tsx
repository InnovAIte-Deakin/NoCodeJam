import React, { useEffect, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuccessAnimationProps {
  show: boolean;
  message?: string;
  duration?: number;
  onComplete?: () => void;
}

export function SuccessAnimation({
  show,
  message = 'Success!',
  duration = 2000,
  onComplete,
}: SuccessAnimationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, duration, onComplete]);

  if (!show) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div
        className={cn(
          'bg-gray-800 border-2 border-green-500 rounded-2xl p-8 flex flex-col items-center gap-4 transform transition-all duration-500',
          isVisible ? 'scale-100 rotate-0' : 'scale-50 rotate-12'
        )}
      >
        <div className="relative">
          <CheckCircle2
            className={cn(
              'w-20 h-20 text-green-500 transition-all duration-700',
              isVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
            )}
          />
          <div
            className={cn(
              'absolute inset-0 bg-green-500 rounded-full transition-all duration-700',
              isVisible ? 'scale-150 opacity-0' : 'scale-100 opacity-30'
            )}
          />
        </div>
        <p
          className={cn(
            'text-xl font-semibold text-white transition-all duration-500 delay-200',
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
          )}
        >
          {message}
        </p>
      </div>
    </div>
  );
}

/**
 * Simpler inline success indicator for use in toasts and cards
 */
export function SuccessCheckmark({ className }: { className?: string }) {
  return (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <CheckCircle2 className="w-5 h-5 text-green-500 animate-bounce" />
    </div>
  );
}

/**
 * Success confetti animation (CSS-only, lightweight)
 */
export function SuccessConfetti({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full animate-confetti"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10%`,
            animationDelay: `${Math.random() * 0.5}s`,
            animationDuration: `${2 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  );
}
