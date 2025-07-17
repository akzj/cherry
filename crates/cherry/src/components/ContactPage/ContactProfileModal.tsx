import React from 'react';
import styled from 'styled-components';
import { Avatar } from '../UI';
import { Contact } from '@/types';
import { FaEnvelope, FaCommentDots, FaPhoneAlt, FaVideo } from 'react-icons/fa';

interface ContactProfileModalProps {
  contact: Contact;
  onClose: () => void;
  onMessage?: (contact: Contact) => void;
  onVoiceCall?: (contact: Contact) => void;
  onVideoCall?: (contact: Contact) => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(1px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const Modal = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  min-width: 340px;
  max-width: 90vw;
  padding: 2rem 2.5rem 1.5rem 2.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 18px;
  right: 18px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #888;
  cursor: pointer;
  z-index: 10;
`;

const Name = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 1rem;
  color: #222;
`;

const Status = styled.div`
  font-size: 0.95rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.5rem 0;
  color: #374151;
`;

const Label = styled.span`
  font-size: 0.95rem;
  color: #6b7280;
`;

const Actions = styled.div`
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ActionButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  width: 60px;
  height: 60px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(99,102,241,0.18);
  gap: 0.25rem;
  &:hover {
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(99,102,241,0.28);
  }
`;

const ContactProfileModal: React.FC<ContactProfileModalProps> = ({ contact, onClose, onMessage, onVoiceCall, onVideoCall }) => {
  // 将contact.status转换为Avatar组件接受的Status类型
  const getValidStatus = (status: string): 'online' | 'offline' | 'busy' | 'away' => {
    switch (status) {
      case 'online':
      case 'offline':
      case 'busy':
      case 'away':
        return status;
      default:
        return 'online';
    }
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose} title="关闭">×</CloseButton>
        <Avatar src={contact.avatar_url || ''} alt={contact.remark_name || ''} size="lg" status={getValidStatus(contact.status || 'online')} />
        <Name>{contact.remark_name}</Name>
        <Status>{contact.status || ''}</Status>
        <InfoRow>
          <FaEnvelope style={{ color: '#6366f1' }} />
          <Label>{contact.target_id || '暂无账号信息'}</Label>
        </InfoRow>
        {/* 可扩展更多信息，如公司、签名、地址等 */}
        <Actions>
          <ActionButton onClick={() => onMessage && onMessage(contact)} title="发消息">
            <FaCommentDots size={22} />
            <span>消息</span>
          </ActionButton>
          <ActionButton onClick={() => onVoiceCall && onVoiceCall(contact)} title="语音通话">
            <FaPhoneAlt size={22} />
            <span>语音</span>
          </ActionButton>
          <ActionButton onClick={() => onVideoCall && onVideoCall(contact)} title="视频通话">
            <FaVideo size={22} />
            <span>视频</span>
          </ActionButton>
        </Actions>
      </Modal>
    </Overlay>
  );
};

export default ContactProfileModal; 