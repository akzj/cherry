// src/components/MessageList.tsx
import React from 'react';
import { Message, User } from '../types/types';

interface MessageListProps {
  messages: Message[];
  currentUser: User;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map(message => {
        const isOwn = message.userId === currentUser.id;
        
        return (
          <div 
            key={message.id} 
            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-xl ${
              isOwn 
                ? 'bg-blue-600 text-white rounded-tr-none' 
                : 'bg-gray-200 dark:bg-gray-700 rounded-tl-none'
            }`}>
              <p className="text-sm">{message.content}</p>
              
              <div className={`text-xs mt-1 flex justify-end ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                <span>
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {isOwn && message.status && (
                  <span className="ml-1">
                    {message.status === 'sent' ? '✓' : message.status === 'delivered' ? '✓✓' : '✓✓✓'}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageList;
