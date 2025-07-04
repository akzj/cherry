import React from 'react';
import styled from 'styled-components';

interface QuickEmojiReplyProps {
  onReply: (emoji: string) => void;
  emojis?: string[];
}

const EmojiReplyBar = styled.div`
  display: flex;
  background: rgba(99, 219, 139, 0.171);
  border-radius: 6px;
  gap: 4px;
  margin-top: 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;

  /* 悬停在消息气泡时才显示 */
  .message-container:hover & {
    opacity: 1;
    pointer-events: auto;
  }
`;

const EmojiButton = styled.button`
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 2px;
  opacity: 0.8;
  transition: opacity 0.2s;
  border-radius: 10px;
  line-height: 1;
  outline: none;
  background: transparent;
  &:hover {
    opacity: 1;
    background: rgba(177, 78, 131, 0.17);
  }
  &:active {
    opacity: 0.6;
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