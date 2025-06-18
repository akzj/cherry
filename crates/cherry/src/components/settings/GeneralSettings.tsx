import React, { useState } from 'react';
import styled from 'styled-components';

// ==================== Styled Components ====================
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 1.5rem;
  border: 1px solid rgba(134, 239, 172, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      0 6px 20px rgba(0, 0, 0, 0.1);
    border-color: rgba(134, 239, 172, 0.3);
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: rgba(22, 57, 35, 0.9);
  margin: 0 0 1rem 0;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(134, 239, 172, 0.1);
  
  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.label`
  font-size: 0.95rem;
  font-weight: 500;
  color: rgba(22, 57, 35, 0.8);
  cursor: pointer;
  display: block;
  margin-bottom: 0.25rem;
`;

const SettingDescription = styled.p`
  font-size: 0.8rem;
  color: rgba(22, 57, 35, 0.6);
  margin: 0;
  line-height: 1.4;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 3rem;
  height: 1.5rem;
  cursor: pointer;
`;

const ToggleInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background: linear-gradient(135deg, #86efac, #22c55e);
  }
  
  &:checked + span:before {
    transform: translateX(1.5rem);
    background: white;
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(134, 239, 172, 0.2);
  transition: all 0.3s ease;
  border-radius: 1rem;
  border: 1px solid rgba(134, 239, 172, 0.3);
  
  &:before {
    position: absolute;
    content: "";
    height: 1.125rem;
    width: 1.125rem;
    left: 0.125rem;
    bottom: 0.125rem;
    background: rgba(134, 239, 172, 0.8);
    transition: all 0.3s ease;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  ${ToggleInput}:checked + & {
    box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.2);
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(134, 239, 172, 0.2);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: rgba(22, 57, 35, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: rgba(134, 239, 172, 0.4);
    box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.1);
  }
  
  &:hover {
    border-color: rgba(134, 239, 172, 0.3);
    background: rgba(255, 255, 255, 0.15);
  }
  
  option {
    background: rgba(255, 255, 255, 0.95);
    color: rgba(22, 57, 35, 0.8);
    padding: 0.5rem;
  }
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid rgba(134, 239, 172, 0.2);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: rgba(22, 57, 35, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: rgba(134, 239, 172, 0.4);
    box-shadow: 0 0 0 3px rgba(134, 239, 172, 0.1);
  }
  
  &:hover {
    border-color: rgba(134, 239, 172, 0.3);
    background: rgba(255, 255, 255, 0.15);
  }
  
  &::placeholder {
    color: rgba(22, 57, 35, 0.5);
  }
`;

const GeneralSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: true,
    sound: false,
    language: 'zh-CN',
    username: 'John Doe',
    email: 'john.doe@example.com'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <Container>
      {/* 基本设置 */}
      <Section>
        <SectionTitle>基本设置</SectionTitle>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="username">用户名</SettingLabel>
            <SettingDescription>显示在聊天中的名称</SettingDescription>
          </SettingInfo>
          <Input
            type="text"
            id="username"
            name="username"
            value={settings.username}
            onChange={handleChange}
            placeholder="输入用户名"
          />
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="email">邮箱地址</SettingLabel>
            <SettingDescription>用于账户安全和通知</SettingDescription>
          </SettingInfo>
          <Input
            type="email"
            id="email"
            name="email"
            value={settings.email}
            onChange={handleChange}
            placeholder="输入邮箱地址"
          />
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="language">语言</SettingLabel>
            <SettingDescription>选择界面显示语言</SettingDescription>
          </SettingInfo>
          <Select
            id="language"
            name="language"
            value={settings.language}
            onChange={handleChange}
          >
            <option value="zh-CN">简体中文</option>
            <option value="en-US">English (US)</option>
            <option value="ja-JP">日本語</option>
          </Select>
        </SettingItem>
      </Section>

      {/* 通知设置 */}
      <Section>
        <SectionTitle>通知设置</SectionTitle>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="notifications">启用通知</SettingLabel>
            <SettingDescription>接收新消息和系统通知</SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="notifications"
              name="notifications"
              checked={settings.notifications}
              onChange={handleChange}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="sound">声音提醒</SettingLabel>
            <SettingDescription>收到消息时播放提示音</SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="sound"
              name="sound"
              checked={settings.sound}
              onChange={handleChange}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>
      </Section>

      {/* 数据设置 */}
      <Section>
        <SectionTitle>数据设置</SectionTitle>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="autoSave">自动保存</SettingLabel>
            <SettingDescription>自动保存草稿和设置</SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="autoSave"
              name="autoSave"
              checked={settings.autoSave}
              onChange={handleChange}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>
      </Section>
    </Container>
  );
};

export default GeneralSettings;
