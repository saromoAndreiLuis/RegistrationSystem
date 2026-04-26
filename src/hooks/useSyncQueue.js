import { useState, useEffect } from 'react';

export const useSyncQueue = () => {
  const [queueLength, setQueueLength] = useState(0);

  useEffect(() => {
    const checkQueue = () => {
      try {
        const queue = JSON.parse(localStorage.getItem('registrationQueue') || '[]');
        setQueueLength(queue.length);
      } catch (e) {
        setQueueLength(0);
      }
    };

    // Check immediately
    checkQueue();

    // Check periodically
    const interval = setInterval(checkQueue, 2000);

    return () => clearInterval(interval);
  }, []);

  return queueLength;
};
