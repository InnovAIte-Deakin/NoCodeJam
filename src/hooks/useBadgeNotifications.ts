import { useState } from 'react';
import { BadgeDefinition } from '@/services/badgeService';

// Hook to manage badge notifications
export function useBadgeNotifications() {
  const [notifications, setNotifications] = useState<BadgeDefinition[]>([]);

  const showNotification = (badges: BadgeDefinition[]) => {
    setNotifications(badges);
  };

  const dismissNotification = () => {
    setNotifications([]);
  };

  return {
    notifications,
    showNotification,
    dismissNotification,
  };
}
