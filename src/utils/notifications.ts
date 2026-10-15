// Daily learning reminder and browser notification manager

export interface NotificationStatus {
  isSupported: boolean;
  permission: NotificationPermission;
}

export function checkNotificationSupport(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      isSupported: false,
      permission: 'default',
    };
  }
  return {
    isSupported: true,
    permission: Notification.permission,
  };
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (err) {
    console.error('Error requesting notification permission', err);
    return false;
  }
}

export function sendDailyReminderNotification(customMessage?: string): boolean {
  if (typeof window === 'undefined') return false;

  const title = '🌟 Waktunya Bermain & Belajar di Pintar SD!';
  const options: NotificationOptions = {
    body:
      customMessage ||
      'Hai Juara Cilik! Luangkan 5 menit untuk bermain kuis seru hari ini dan pertahankan streak belajarmu! 🔥',
    icon: '/icon.svg',
    badge: '/icon.svg',
    tag: 'daily-reminder',
  };

  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, options);
      return true;
    } catch {
      // Fallback
    }
  }
  return false;
}
