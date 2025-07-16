import React from 'react';
import styled from 'styled-components';

interface QuickEmojiReplyProps {
  isOwn: boolean;
  onReply: (emoji: string) => void;
  onReplyMessage?: () => void;
  onCopyMessage?: () => void;
  emojis?: string[];
}

const EmojiReplyBar = styled.div<{ $isOwn: boolean }>`
  display: flex;
  position: absolute;
  ${props => props.$isOwn ? 'left: -200px;' : 'right: 200px;'}
  top: -5px;
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



/**
 * 快速表情回复组件
 * @param {QuickEmojiReplyProps} props - 组件属性
 * @returns {JSX.Element} 快速表情回复组件
 */
const QuickEmojiReply: React.FC<QuickEmojiReplyProps> = ({
  isOwn,
  onReply,
  onReplyMessage,
  onCopyMessage,
  emojis = ['👍', '😂', '❤️', '😮'],
}) => (
  <EmojiReplyBar $isOwn={isOwn}>
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
        <svg width="64px" height="64px" viewBox="0 0 24.00 24.00" xmlns="http://www.w3.org/2000/svg" fill="#109819" stroke="#109819" strokeWidth="0.00024000000000000003"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <rect x="0" fill="none" width="24" height="24"></rect> <g> <path d="M9 16h7.2l-2.6 2.6L15 20l5-5-5-5-1.4 1.4 2.6 2.6H9c-2.2 0-4-1.8-4-4s1.8-4 4-4h2V4H9c-3.3 0-6 2.7-6 6s2.7 6 6 6z"></path> </g> </g></svg>
      </EmojiButton>
    )}

    {onCopyMessage && (
      <EmojiButton
        title="复制消息"
        onClick={onCopyMessage}
        aria-label="复制消息"
      >
        <svg width="64px" height="64px" viewBox="-2.4 -2.4 28.80 28.80" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000" strokeWidth="0.00024000000000000003" transform="rotate(0)"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#CCCCCC" strokeWidth="0.8160000000000001"></g><g id="SVGRepo_iconCarrier"> <path d="M15.24 2H11.3458C9.58159 1.99999 8.18418 1.99997 7.09054 2.1476C5.96501 2.29953 5.05402 2.61964 4.33559 3.34096C3.61717 4.06227 3.29833 4.97692 3.14701 6.10697C2.99997 7.205 2.99999 8.60802 3 10.3793V16.2169C3 17.725 3.91995 19.0174 5.22717 19.5592C5.15989 18.6498 5.15994 17.3737 5.16 16.312L5.16 11.3976L5.16 11.3024C5.15993 10.0207 5.15986 8.91644 5.27828 8.03211C5.40519 7.08438 5.69139 6.17592 6.4253 5.43906C7.15921 4.70219 8.06404 4.41485 9.00798 4.28743C9.88877 4.16854 10.9887 4.1686 12.2652 4.16867L12.36 4.16868H15.24L15.3348 4.16867C16.6113 4.1686 17.7088 4.16854 18.5896 4.28743C18.0627 2.94779 16.7616 2 15.24 2Z" fill="#7593f5"></path> <path d="M6.6001 11.3974C6.6001 8.67119 6.6001 7.3081 7.44363 6.46118C8.28716 5.61426 9.64481 5.61426 12.3601 5.61426H15.2401C17.9554 5.61426 19.313 5.61426 20.1566 6.46118C21.0001 7.3081 21.0001 8.6712 21.0001 11.3974V16.2167C21.0001 18.9429 21.0001 20.306 20.1566 21.1529C19.313 21.9998 17.9554 21.9998 15.2401 21.9998H12.3601C9.64481 21.9998 8.28716 21.9998 7.44363 21.1529C6.6001 20.306 6.6001 18.9429 6.6001 16.2167V11.3974Z" fill="#7593f5"></path> </g></svg>

      </EmojiButton>)}


  </EmojiReplyBar>
);

export default QuickEmojiReply; 