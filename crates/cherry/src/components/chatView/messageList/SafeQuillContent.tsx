// src/components/SafeQuillContent.tsx
import React from 'react';
import DOMPurify from 'dompurify';
import { QuillContent } from './SafeQuillContent.styled';




interface SafeQuillContentProps {
  html: string;
}

const SafeQuillContent: React.FC<SafeQuillContentProps> = ({ html }) => {
  // 1. 清洗
  const clean = DOMPurify.sanitize(html, {
    ADD_TAGS: ['img', 'br', 'p', 'span', 'strong', 'em', 'u', 's', 'blockquote', 'ol', 'ul', 'li', 'a', 'code', 'pre'],
    ADD_ATTR: ['href', 'src', 'alt', 'target', 'rel'],
  });

  return (
    // 2. 用独立的 className 包裹，避免全局样式污染
    <QuillContent
      className="quill-content"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
};

export default SafeQuillContent;