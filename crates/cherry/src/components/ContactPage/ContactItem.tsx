import React from 'react';
import Avatar from '../UI/Avatar';
import { Contact } from '../../types/contact';

interface ContactItemProps {
  contact: Contact;
  onClick: () => void;
}

const ContactItem: React.FC<ContactItemProps> = ({ contact, onClick }) => {
  return (
    <div 
      className="flex items-center p-3 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
      onClick={onClick}
    >
      <Avatar 
        src={contact.avatar} 
        alt={contact.name} 
        status={contact.status} 
        size="md"
      />
      <div className="ml-3">
        <div className="font-medium text-gray-900">{contact.name}</div>
        <div className="text-sm text-gray-500 capitalize">
          {contact.status}
        </div>
      </div>
    </div>
  );
};

export default ContactItem;
