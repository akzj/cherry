import React from 'react';
import styled from 'styled-components';
import { useMessageStore } from '../store/message';

const DebugContainer = styled.div`
  position: fixed;
  top: 100px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-family: monospace;
  font-size: 12px;
  max-width: 300px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 9999;
`;

// 访问全局滚动位置存储（需要从MessageList导出）
declare global {
  interface Window {
    scrollPositions?: Map<string, number>;
  }
}

const MessageDebug: React.FC<{ selectedConversation: string | null }> = ({ selectedConversation }) => {
  const { messages } = useMessageStore();
  const [currentScrollTop, setCurrentScrollTop] = React.useState(0);
  const [savedPositions, setSavedPositions] = React.useState<Record<string, number>>({});

  // 监听滚动位置变化
  React.useEffect(() => {
    const interval = setInterval(() => {
      const container = document.querySelector('[data-message-container]') as HTMLElement;
      if (container) {
        setCurrentScrollTop(container.scrollTop);
      }
      
      // 从全局变量读取保存的位置（如果可用）
      if (window.scrollPositions) {
        const positions: Record<string, number> = {};
        window.scrollPositions.forEach((value, key) => {
          positions[key] = value;
        });
        setSavedPositions(positions);
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <DebugContainer>
      <div><strong>Message Debug</strong></div>
      <div>Selected: {selectedConversation || 'none'}</div>
      <div>Current scroll: {currentScrollTop.toFixed(0)}px</div>
      <div>Total conversations: {Object.keys(messages).length}</div>
      
      <div><strong>Saved positions:</strong></div>
      {Object.entries(savedPositions).map(([convId, position]) => (
        <div key={convId} style={{ fontSize: '10px' }}>
          {convId.substring(0, 8)}...: {position.toFixed(0)}px
          {convId === selectedConversation && ' (CURRENT)'}
        </div>
      ))}
      
      {Object.entries(messages).map(([convId, msgs]) => (
        <div key={convId}>
          <strong>{convId.substring(0, 8)}...</strong>: {msgs.length} messages
          {convId === selectedConversation && ' (ACTIVE)'}
        </div>
      ))}
      {selectedConversation && messages[selectedConversation] && (
        <div>
          <strong>Current messages:</strong>
          {messages[selectedConversation].slice(-3).map(msg => (
            <div key={msg.id}>
              {msg.id}: {msg.content.substring(0, 20)}...
            </div>
          ))}
        </div>
      )}
    </DebugContainer>
  );
};

export default MessageDebug; 