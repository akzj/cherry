import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../store/auth';

const DebugPanelContainer = styled.div`
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  z-index: 10000;
  max-width: 300px;
  max-height: 400px;
  overflow-y: auto;
`;

const DebugTitle = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  color: #00ff00;
`;

const DebugItem = styled.div`
  margin-bottom: 4px;
`;

const DebugValue = styled.span`
  color: #ffff00;
`;

const ToggleButton = styled.button`
  position: fixed;
  top: 10px;
  right: 10px;
  background: #333;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  z-index: 10001;
  
  &:hover {
    background: #555;
  }
`;

interface DebugPanelProps {
  isVisible: boolean;
  onToggle: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isVisible, onToggle }) => {
  const auth = useAuth();
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isVisible) return;

    const addLog = (message: string) => {
      setLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    // 监听控制台日志
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      originalLog.apply(console, args);
      addLog(`LOG: ${args.join(' ')}`);
    };
    
    console.error = (...args) => {
      originalError.apply(console, args);
      addLog(`ERROR: ${args.join(' ')}`);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, [isVisible]);

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <>
      <ToggleButton onClick={onToggle}>
        {isVisible ? 'Hide Debug' : 'Show Debug'}
      </ToggleButton>
      
      {isVisible && (
        <DebugPanelContainer>
          <DebugTitle>Debug Panel</DebugTitle>
          
          <DebugItem>
            Auth State: <DebugValue>{JSON.stringify({
              isAuthenticated: auth.isAuthenticated,
              isInitialized: auth.isInitialized,
              isLoggedIn: auth.isLoggedIn,
              isLoading: auth.isLoading,
              hasUser: !!auth.user,
              hasToken: !!auth.token
            }, null, 2)}</DebugValue>
          </DebugItem>
          
          <DebugItem>
            User: <DebugValue>{auth.user ? auth.user.username : 'null'}</DebugValue>
          </DebugItem>
          
          <DebugItem>
            Recent Logs:
            {logs.map((log, index) => (
              <div key={index} style={{ fontSize: '10px', marginLeft: '10px' }}>
                {log}
              </div>
            ))}
          </DebugItem>
        </DebugPanelContainer>
      )}
    </>
  );
};

export default DebugPanel; 