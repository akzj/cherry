import React from 'react';
import styled from 'styled-components';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: any) => void;
  onClose: () => void;
  isOpen: boolean;
}

const PickerContainer = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  bottom: 100%;
  right: 0;
  z-index: 1000;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.$isOpen ? 'translateY(0)' : 'translateY(10px)'};
  transition: all 0.2s ease-in-out;
  margin-bottom: 8px;
  
  /* 自定义 emoji-mart 样式 */
  .emoji-mart {
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(30, 30, 46, 0.95);
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  }
  
  .emoji-mart-search {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
  }
  
  .emoji-mart-search input {
    background: transparent;
    color: rgba(255, 255, 255, 0.9);
    border: none;
    outline: none;
  }
  
  .emoji-mart-search input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  .emoji-mart-category-label {
    background: rgba(30, 30, 46, 0.95);
    color: rgba(255, 255, 255, 0.7);
  }
  
  .emoji-mart-scroll {
    background: rgba(30, 30, 46, 0.95);
  }
  
  .emoji-mart-anchor {
    color: rgba(255, 255, 255, 0.5);
  }
  
  .emoji-mart-anchor:hover,
  .emoji-mart-anchor-selected {
    color: #6366f1;
  }
  
  .emoji-mart-emoji {
    border-radius: 6px;
  }
  
  .emoji-mart-emoji:hover {
    background: rgba(99, 102, 241, 0.2);
  }
  
  .emoji-mart-skin-swatches {
    background: rgba(30, 30, 46, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
  opacity: ${props => props.$isOpen ? 1 : 0};
  visibility: ${props => props.$isOpen ? 'visible' : 'hidden'};
  transition: all 0.2s ease-in-out;
`;

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect, onClose, isOpen }) => {
  const handleEmojiSelect = (emoji: any) => {
    onEmojiSelect(emoji);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <Overlay $isOpen={isOpen} onClick={onClose} />
      <PickerContainer $isOpen={isOpen}>
        <Picker
          data={data}
          onEmojiSelect={handleEmojiSelect}
          theme="dark"
          set="native"
          skinTonePosition="search"
          previewPosition="none"
          searchPosition="sticky"
          maxFrequentRows={4}
          perLine={8}
          emojiSize={20}
          emojiButtonSize={28}
          emojiButtonRadius={6}
          searchPlaceholder="搜索表情..."
          noResultsEmoji="🤔"
          noResultsText="没有找到表情"
          categories={[
            'frequent',
            'people',
            'nature',
            'foods',
            'activity',
            'places',
            'objects',
            'symbols',
            'flags'
          ]}
        />
      </PickerContainer>
    </>
  );
};

export default EmojiPicker; 