import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Conversation, Message } from '@/types';
import ChatHeader from './ChatHeader';
import MessageList from '@/components/chatView/messageList/MessageList';
import MessageInput from '@/components/chatView/messageInput/MessageInput';


interface ConversationViewProps {
  conversation: Conversation;
  currentUserId: string;
  isVisible: boolean;
}

const Container = styled.div<{ $isVisible: boolean }>`
  flex: 1;
  display: ${props => props.$isVisible ? 'flex' : 'none'};
  flex-direction: column;
  overflow: hidden;
  height: 100%;
  min-height: 0; /* 重要：允许flex子元素收缩 */
`;

const ConversationView: React.FC<ConversationViewProps> = ({
  conversation,
  currentUserId,
  isVisible,
}) => {
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);


  // 添加调试日志
  //  console.log('ConversationView mounted', {
  //     conversationId: conversation.id,
  //     isVisible,
  //     currentUserId,
  //   });

  return (
    <Container $isVisible={isVisible}>
      <ChatHeader conversation={conversation} />
      <MessageList
        currentUserId={currentUserId}
        conversationId={conversation.id}
        setReplyingTo={setReplyingTo}
      />
      <MessageInput
        setReplyingTo={setReplyingTo}
        replyingTo={replyingTo}
        disabled={false}
        conversationId={conversation.id}
      />
    </Container>
  );
};

export default ConversationView; 