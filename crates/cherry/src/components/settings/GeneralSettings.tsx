import React, { useState } from 'react';

const GeneralSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    startup: true,
    language: 'zh-CN',
    sendWithEnter: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">通用设置</h2>
      
      <div className="space-y-4">
        {/* 开机启动 */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">开机自动启动</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">应用程序将在系统启动时自动运行</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              name="startup"
              checked={settings.startup}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* 语言设置 */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">语言</h3>
          <select 
            name="language"
            value={settings.language}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English (US)</option>
            <option value="ja-JP">日本語</option>
          </select>
        </div>

        {/* 发送快捷键 */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">Enter键发送消息</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {settings.sendWithEnter 
                ? "按Enter发送消息，Ctrl+Enter换行" 
                : "按Enter换行，Ctrl+Enter发送消息"}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              name="sendWithEnter"
              checked={settings.sendWithEnter}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
