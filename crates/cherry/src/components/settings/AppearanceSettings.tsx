import React, { useState } from 'react';
import type { ThemePreference } from '../../types/settings';

interface AppearanceSettingsProps {
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ darkMode, setDarkMode }) => {
  const [settings, setSettings] = useState({
    theme: 'system' as ThemePreference,
    fontSize: 16,
    density: 'normal' as 'compact' | 'normal' | 'spacious',
  });

  const handleThemeChange = (theme: ThemePreference) => {
    setSettings(prev => ({ ...prev, theme }));
    if (theme === 'dark') {
      setDarkMode(true);
    } else if (theme === 'light') {
      setDarkMode(false);
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fontSize = parseInt(e.target.value);
    setSettings(prev => ({ ...prev, fontSize }));
  };

  const handleDensityChange = (density: 'compact' | 'normal' | 'spacious') => {
    setSettings(prev => ({ ...prev, density }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">外观设置</h2>

      <div className="space-y-4">
        {/* 主题选择 */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">主题</h3>
          <div className="flex space-x-4">
            {(['light', 'dark', 'system'] as ThemePreference[]).map((theme) => (
              <button
                key={theme}
                className={`flex-1 py-3 px-4 rounded-lg border transition-colors ${settings.theme === theme
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                    : 'border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700'
                  }`}
                onClick={() => handleThemeChange(theme)}
              >
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full mb-2 ${theme === 'light' ? 'bg-yellow-300' :
                      theme === 'dark' ? 'bg-gray-800' :
                        'bg-gradient-to-r from-gray-300 to-gray-800'
                    }`}></div>
                  <span className="capitalize text-sm">
                    {theme === 'light' && '浅色'}
                    {theme === 'dark' && '深色'}
                    {theme === 'system' && '跟随系统'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 字体大小 */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">
            字体大小: {settings.fontSize}px
          </h3>
          <input
            type="range"
            min="12"
            max="24"
            value={settings.fontSize}
            onChange={handleFontSizeChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>小</span>
            <span>中</span>
            <span>大</span>
          </div>
        </div>

        {/* 界面密度 */}
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-3">界面密度</h3>
          <div className="flex space-x-3">
            {(['compact', 'normal', 'spacious'] as const).map((density) => (
              <button
                key={density}
                className={`flex-1 py-2 px-4 rounded-md transition-colors ${settings.density === density
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                  }`}
                onClick={() => handleDensityChange(density)}
              >
                {density === 'compact' && '紧凑'}
                {density === 'normal' && '标准'}
                {density === 'spacious' && '宽松'}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
