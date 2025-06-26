import React from 'react';
import styled from 'styled-components';

const TestContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  gap: 10px;
  z-index: 9998;
`;

const TestButton = styled.button`
  background: #6366f1;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: #4f46e5;
  }
`;

const ScrollTest: React.FC = () => {
  const scrollToPosition = (position: number) => {
    const container = document.querySelector('[data-message-container]') as HTMLElement;
    if (container) {
      container.scrollTop = position;
      console.log('Manually scrolled to position:', position);
    }
  };

  const getCurrentScroll = () => {
    const container = document.querySelector('[data-message-container]') as HTMLElement;
    if (container) {
      console.log('Current scroll info:', {
        scrollTop: container.scrollTop,
        scrollHeight: container.scrollHeight,
        clientHeight: container.clientHeight
      });
    }
  };

  return (
    <TestContainer>
      <TestButton onClick={() => scrollToPosition(0)}>Top</TestButton>
      <TestButton onClick={() => scrollToPosition(200)}>200px</TestButton>
      <TestButton onClick={() => scrollToPosition(500)}>500px</TestButton>
      <TestButton onClick={() => {
        const container = document.querySelector('[data-message-container]') as HTMLElement;
        if (container) {
          scrollToPosition(container.scrollHeight);
        }
      }}>Bottom</TestButton>
      <TestButton onClick={getCurrentScroll}>Info</TestButton>
    </TestContainer>
  );
};

export default ScrollTest; 