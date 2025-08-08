import { useState, useEffect } from 'react';
import { useTheme } from '../components/ThemeProvider';
import dynamic from 'next/dynamic';

export function useMyLogic() {
  const [isClient, setIsClient] = useState(false);
  const { mode, setMode } = useTheme();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Dynamic import for chat panel (avoid SSR issues)
  const FlowGenioExpertChat = dynamic(() => import('../components/ExpertAssistantChat'), {
    ssr: false,
  });

  return {
    isClient,
    mode,
    setMode,
    FlowGenioExpertChat,
  };
}
