import styled from 'styled-components';

export const ReplyContainer = styled.div`
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-left: 4px solid #6366f1;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  position: relative;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
  transition: all 0.2s ease;
  
  &:hover {
    border-color: rgba(99, 102, 241, 0.3);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
  }
`;

export const ReplyHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
`;

export const ReplyLabel = styled.span`
  font-size: 0.75rem;
  color: #6366f1;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  
  &::before {
    content: '';
    width: 12px;
    height: 12px;
    background: url("data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTE0IDE3aDNsMi00VjdBMiAyIDAgMCAwIDIxIDVIOWEyIDIgMCAwIDAtMiAydjZhMiAyIDAgMCAwIDIgMmgzbDIgNHoiIGZpbGw9IiM2MzY2ZjEiLz48cGF0aCBkPSJNOSAxMmExIDEgMCAwIDEtMS0xVjhhMSAxIDAgMCAxIDIgMHYzYTEgMSAwIDAgMS0xIDF6IiBmaWxsPSJ3aGl0ZSIvPjwvc3ZnPg==") no-repeat center;
    background-size: contain;
  }
`;

export const CancelButton = styled.button`
  background: none;
  border: none;
  color: #6366f1;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  font-size: 0.75rem;
  
  &:hover {
    background: rgba(99, 102, 241, 0.1);
  }
`;

export const ReplyContent = styled.div`
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.75);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  max-width: 100%;
  font-weight: 500;
  
  /* 支持图片预览的样式 */
  .image-preview {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.8rem;
  }
  
  .image-icon {
    width: 18px;
    height: 18px;
    border-radius: 4px;
    background-color: #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #6b7280;
    flex-shrink: 0;
  }
`; 