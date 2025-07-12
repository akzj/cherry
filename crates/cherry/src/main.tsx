import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

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
  
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
