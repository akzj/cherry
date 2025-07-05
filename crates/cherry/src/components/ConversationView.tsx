import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Conversation, Message } from '../types/types';
import { useMessageStore } from '../store/message';
import ChatHeader from './ChatHeader';
import MessageList from './MessageListSimple';
import MessageInput from './MessageInput';

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
  const { getMessages } = useMessageStore();


  // 获取当前会话的消息
  const messages = getMessages(conversation.id);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  

  // 当组件变为可见时，记录日志
  useEffect(() => {
    if (isVisible) {
      console.log(`ConversationView for ${conversation.id} is now visible, messages: ${messages.length}`);
    }
  }, [isVisible, conversation.id, messages.length]);

  // 添加调试日志
  console.log(`ConversationView render: ${conversation.id}, visible: ${isVisible}, messages: ${messages.length}`);

  return (
    <Container $isVisible={isVisible}>
      <ChatHeader conversation={conversation} />
      <MessageList
        messages={messages}
        currentUserId={currentUserId}
        conversationId={conversation.id}
        setReplyingTo={setReplyingTo}
      />
      <MessageInput
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
        conversationId={conversation.id}
        disabled={false}
      />
    </Container>
  );
};

export default ConversationView; 