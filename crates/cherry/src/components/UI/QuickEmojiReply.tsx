import React from 'react';
import styled from 'styled-components';

interface QuickEmojiReplyProps {
  onReply: (emoji: string) => void;
  emojis?: string[];
}

const EmojiReplyBar = styled.div`
  display: flex;
  position: absolute;
  right: 0px;
  top: -35px;
  background: linear-gradient(90deg, rgba(99,219,139,0.13) 0%, rgba(139, 92, 246, 0.09) 100%);
  border-radius: 10px;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(99, 219, 139, 0.13), 0 1.5px 6px rgba(139, 92, 246, 0.09);
  padding: 3px 10px 3px 10px;
  border: 1.5px solid #b1e6c7;
  min-height: 32px;
  z-index: 2;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  /* 只在 hover 消息气泡时显示 */
  .message-container:hover & {
    opacity: 1;
    pointer-events: auto;
  }
`;

const EmojiButton = styled.button`
  border: none;
  cursor: pointer;
  font-size: 1.18rem;
  padding: 3px 7px;
  opacity: 0.85;
  transition: all 0.18s cubic-bezier(.4,1.3,.6,1);
  border-radius: 12px;
  line-height: 1;
  outline: none;
  background: transparent;
  box-shadow: 0 1px 3px rgba(99,219,139,0.07);
  border: 1.5px solid transparent;
  &:hover {
    opacity: 1;
    background: rgba(177, 78, 131, 0.13);
    transform: translateY(-2px) scale(1.08);
    border: 1.5px solid #8b5cf6;
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.13);
  }
  &:active {
    opacity: 0.6;
    transform: scale(0.96);
  }
`;

const QuickEmojiReply: React.FC<QuickEmojiReplyProps> = ({
  onReply,
  emojis = ['👍', '😂', '❤️', '😮'],
}) => (
  <EmojiReplyBar>
    {emojis.map(emoji => (
      <EmojiButton
        key={emoji}
        title={`快速回复${emoji}`}
        onClick={() => onReply(emoji)}
      >
        {emoji}
      </EmojiButton>
    ))}
  </EmojiReplyBar>
);

export default QuickEmojiReply; 