import React, { useState } from 'react';
import GeneralSettings from './GeneralSettings';
import PrivacySettings from './PrivacySettings';
import NotificationSettings from './NotificationSettings';
import AppearanceSettings from './AppearanceSettings';
import { SettingCategory } from '../../types/settings';

const SettingsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<SettingCategory>('general');
  const [darkMode, setDarkMode] = useState(false);

  const renderSettingsContent = () => {
    switch (activeCategory) {
      case 'general':
        return <GeneralSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'appearance':
        return <AppearanceSettings darkMode={darkMode} setDarkMode={setDarkMode} />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边导航 */}
      <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">设置</h1>
        </div>

        <nav className="mt-6">
          {(['general', 'privacy', 'notifications', 'appearance'] as SettingCategory[]).map((category) => (
            <button
              key={category}
              className={`flex items-center w-full px-6 py-3 text-left transition-colors duration-200 ${activeCategory === category
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              onClick={() => setActiveCategory(category)}
            >
              <span className="capitalize">
                {category === 'general' && '通用'}
                {category === 'privacy' && '隐私'}
                {category === 'notifications' && '通知'}
                {category === 'appearance' && '外观'}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-3xl mx-auto">
          {renderSettingsContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
