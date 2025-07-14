// src/components/SafeQuillContent.styled.ts
import styled from 'styled-components';

export const QuillContent = styled.div`
  /* 基础排版 */
  line-height: 1.5;
  word-break: break-word;
  white-space: pre-wrap;

  /* 图片自适应 */
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 4px 0;
  }

  /* 链接样式 */
  a {
    color: #1890ff;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  /* 列表样式 */
  ul, ol {
    margin: 0 0 0 1.25em;
    padding: 0;
  }

  li {
    margin: 0 0 0.25em 0;
  }

  /* 代码块 */
  pre {
    background: #f5f5f5;
    padding: 0.75em;
    border-radius: 4px;
    overflow-x: auto;
    font-family: ui-monospace, 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  }

  code {
    background: #f5f5f5;
    padding: 0.125em 0.25em;
    border-radius: 3px;
    font-size: 0.875em;
  }

  /* 引用 */
  blockquote {
    margin: 0;
    padding-left: 1em;
    border-left: 3px solid #e5e5e5;
    color: #666;
  }
`;