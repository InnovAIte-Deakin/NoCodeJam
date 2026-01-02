import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Trophy } from 'lucide-react';
import { BadgeDefinition } from '@/services/badgeService';

interface BadgeNotificationProps {
  badges: BadgeDefinition[];
  onDismiss: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export function BadgeNotification({ 
  badges, 
  onDismiss, 
  autoHide = true, 
  autoHideDelay = 5000 
}: BadgeNotificationProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoHide && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 300); // Wait for animation to complete
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onDismiss]);

  if (!visible || badges.length === 0) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 max-w-sm transition-all duration-300 transform ${
        visible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-full opacity-0 scale-95'
      }`}
    >
      <Card className="border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="animate-bounce">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-bold text-gray-900">
                {badges.length === 1 ? 'Badge Unlocked!' : `${badges.length} Badges Unlocked!`}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setVisible(false);
                setTimeout(onDismiss, 300);
              }}
              className="h-6 w-6 p-0 hover:bg-yellow-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-3">
            {badges.map((badge, index) => (
              <div
                key={badge.id}
                className={`flex items-center space-x-3 p-3 bg-white/60 rounded-lg border border-yellow-200 transition-all duration-300 ${
                  visible ? 'translate-x-0 opacity-100' : '-translate-x-5 opacity-0'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="text-2xl animate-pulse">
                  {badge.icon}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm text-gray-900">{badge.name}</div>
                  <div className="text-xs text-gray-600">{badge.description}</div>
                </div>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  New!
                </Badge>
              </div>
            ))}
          </div>

          {/* Decorative sparkles with CSS animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '2s'
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
