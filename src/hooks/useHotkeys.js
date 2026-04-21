import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useHotkeys = (keysConfig) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event) => {
      // We use Alt as the primary modifier
      if (!event.altKey) return;

      const key = event.key.toLowerCase();
      
      if (keysConfig[key]) {
        event.preventDefault();
        keysConfig[key]();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keysConfig, navigate]);
};

export default useHotkeys;
