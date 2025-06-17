// src/components/ContactList.tsx
import React from 'react';
import { Conversation } from '../types/types';

interface ContactListProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
}

const ContactList: React.FC<ContactListProps> = ({ conversations, onSelectConversation }) => {
  return (
    <div className="divide-y divide-gray-700">
      {conversations.map(conversation => (
        <div 
          key={conversation.id}
          className="p-4 hover:bg-gray-700 cursor-pointer transition-colors flex items-center space-x-3"
          onClick={() => onSelectConversation(conversation.id)}
        >
          <div className="relative">
            <img 
              src={conversation.avatar} 
              alt={conversation.name} 
              className="w-12 h-12 rounded-full"
            />
            {conversation.participants.some(p => p.status === 'online') && (
              <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-800"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline">
              <h3 className="font-medium truncate">{conversation.name}</h3>
              {conversation.lastMessage && (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(conversation.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            
            <div className="flex justify-between items-baseline">
              {conversation.lastMessage ? (
                <p className="text-sm text-gray-400 truncate">
                  {conversation.lastMessage.content}
                </p>
              ) : (
                <p className="text-sm text-gray-400">Start a conversation</p>
              )}
              
              {conversation.unreadCount > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {conversation.unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContactList;
