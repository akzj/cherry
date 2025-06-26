import React from 'react';
import styled from 'styled-components';
import { Window } from '@tauri-apps/api/window';
import { 
  IoRemoveOutline, 
  IoExpandOutline, 
  IoCloseOutline
} from 'react-icons/io5';

const WindowControlsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-left: auto;
`;

const WindowControlButton = styled.button<{ $variant: 'minimize' | 'maximize' | 'close' }>`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: rgba(34, 197, 94, 0.8);
  
  &:hover {
    transform: scale(1.05);
    background: ${props => {
      switch (props.$variant) {
        case 'minimize':
          return 'rgba(59, 130, 246, 0.2)';
        case 'maximize':
          return 'rgba(16, 185, 129, 0.2)';
        case 'close':
          return 'rgba(239, 68, 68, 0.2)';
        default:
          return 'rgba(134, 239, 172, 0.2)';
      }
    }};
    color: ${props => {
      switch (props.$variant) {
        case 'minimize':
          return 'rgb(59, 130, 246)';
        case 'maximize':
          return 'rgb(16, 185, 129)';
        case 'close':
          return 'rgb(239, 68, 68)';
        default:
          return 'rgb(34, 197, 94)';
      }
    }};
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const WindowControls: React.FC = () => {
  const handleMinimize = async () => {
    try {
      const window = Window.getCurrent();
      await window.minimize();
    } catch (error) {
      // Failed to minimize window
    }
  };

  const handleMaximize = async () => {
    try {
      const window = Window.getCurrent();
      await window.toggleMaximize();
    } catch (error) {
      // Failed to maximize window
    }
  };

  const handleClose = async () => {
    try {
      const window = Window.getCurrent();
      await window.close();
    } catch (error) {
      // Failed to close window
    }
  };

  return (
    <WindowControlsContainer>
      <WindowControlButton $variant="minimize" onClick={handleMinimize}>
        <IoRemoveOutline />
      </WindowControlButton>
      <WindowControlButton $variant="maximize" onClick={handleMaximize}>
        <IoExpandOutline />
      </WindowControlButton>
      <WindowControlButton $variant="close" onClick={handleClose}>
        <IoCloseOutline />
      </WindowControlButton>
    </WindowControlsContainer>
  );
};

export default WindowControls; 