import { useState, useEffect } from 'react';
import { messaging, getToken, onMessage } from '@/lib/firebase';
import { toast } from 'sonner';

const useNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    if (!messaging || !session?.user?.id) return;

    const requestPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          });
          setFcmToken(token);
          // Send this token to your server to associate it with the user
          await fetch('/api/notifications/register-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
          });
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    };

    requestPermission();

    const unsubscribe = onMessage(messaging, (payload) => {
      toast.info(payload.notification?.title, {
        description: payload.notification?.body,
      });
    });

    return () => unsubscribe();
  }, [session?.user?.id]);

  return { fcmToken };
};

export default useNotifications;