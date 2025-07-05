import React from 'react';
import styled from 'styled-components';

interface QuickEmojiReplyProps {
  onReply: (emoji: string) => void;
  onReplyMessage?: () => void;
  emojis?: string[];
}

const EmojiReplyBar = styled.div`
  display: flex;
  position: absolute;
  right: 0px;
  top: -35px;
  //background: linear-gradient(90deg, rgba(219, 99, 199, 0.13) 0%, rgba(139, 92, 246, 0.09) 100%);
  border-radius: 10px;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(237, 87, 200, 0.319), 0 1.5px 6px rgba(139, 92, 246, 0.09);
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
  width: 32px; /* 设置宽度 */
  height: 32px; /* 设置高度 */
  opacity: 0.85;
  transition: all 0.18s cubic-bezier(.4, 1.3, .6, 1);
  border-radius: 10px;
  line-height: 1;
  outline: none;
  background: transparent;
  display: flex; /* 使用 flex 布局以居中内容 */
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  //box-shadow: 0 1px 3px rgba(99, 219, 143, 0.628);
  border: 1.5px solid transparent;

  &:hover {
    opacity: 1;
    transform: translateY(-2px) scale(1.18);
    //box-shadow: 0 4px 12px rgba(138, 92, 246, 0.516);
  }

  &:active {
    opacity: 0.6;
    transform: scale(0.96);
  }
`;
const QuickEmojiReply: React.FC<QuickEmojiReplyProps> = ({
  onReply,
  onReplyMessage,
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
    {onReplyMessage && (
      <EmojiButton
        //title="回复消息"
        onClick={onReplyMessage}
        aria-label="回复消息"
      >
       <svg width="64px" height="64px" viewBox="0 0 24.00 24.00" xmlns="http://www.w3.org/2000/svg" fill="#109819" stroke="#109819" stroke-width="0.00024000000000000003"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="0" fill="none" width="24" height="24"></rect> <g> <path d="M9 16h7.2l-2.6 2.6L15 20l5-5-5-5-1.4 1.4 2.6 2.6H9c-2.2 0-4-1.8-4-4s1.8-4 4-4h2V4H9c-3.3 0-6 2.7-6 6s2.7 6 6 6z"></path> </g> </g></svg>
      </EmojiButton>
    )}
  </EmojiReplyBar>
);

export default QuickEmojiReply; 