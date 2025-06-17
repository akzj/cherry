import React, { useState } from 'react';


const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState({
    readReceipts: true,
    onlineStatus: 'contacts' as 'all' | 'contacts' | 'none',
    messageHistory: 'forever' as 'forever' | '30days' | '7days',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">隐私设置</h2>
      
      <div className="space-y-4">
        {/* 已读回执 */}
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div>
            <h3 className="font-medium text-gray-800 dark:text-gray-200">已读回执</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">向联系人显示您已阅读他们的消息</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              name="readReceipts"
              checked={settings.readReceipts}
              onChange={(e) => setSettings(prev => ({...prev, readReceipts: e.target.checked}))}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* 在线状态 */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">在线状态</h3>
          <select 
            name="onlineStatus"
            value={settings.onlineStatus}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="all">所有人可见</option>
            <option value="contacts">仅联系人可见</option>
            <option value="none">不可见</option>
          </select>
        </div>

        {/* 消息历史记录 */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">消息历史记录</h3>
          <select 
            name="messageHistory"
            value={settings.messageHistory}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="forever">永久保存</option>
            <option value="30days">保留30天</option>
            <option value="7days">保留7天</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;
