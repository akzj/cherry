import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";
import "./test-reply-display";

// 开发模式下的调试工具
if (import.meta.env.DEV) {
  console.log('Development mode enabled');
  
  // 全局错误处理
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
  });
  
  // 未处理的Promise拒绝
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
  });
  
  // 启用React开发工具
  if (typeof window !== 'undefined') {
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ = (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ || {};
  }
  
  // 加载调试脚本
  const script = document.createElement('script');
  script.src = '/debug.js';
  script.onload = () => {
    console.log('调试脚本已加载');
  };
  script.onerror = () => {
    console.warn('调试脚本加载失败，将在控制台中手动加载');
  };
  document.head.appendChild(script);
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
