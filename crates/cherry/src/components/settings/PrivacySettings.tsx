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

const PrivacySettings: React.FC = () => {
  const [settings, setSettings] = useState({
    readReceipts: true,
    lastSeen: 'contacts',
    profileVisibility: 'contacts',
    messagePrivacy: 'contacts',
    dataSharing: false,
    analytics: false
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
      {/* 消息隐私 */}
      <Section>
        <SectionTitle>消息隐私</SectionTitle>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="readReceipts">已读回执</SettingLabel>
            <SettingDescription>让联系人知道您何时阅读了他们的消息</SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="readReceipts"
              name="readReceipts"
              checked={settings.readReceipts}
              onChange={handleChange}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="messagePrivacy">消息可见性</SettingLabel>
            <SettingDescription>控制谁可以看到您的消息状态</SettingDescription>
          </SettingInfo>
          <Select
            id="messagePrivacy"
            name="messagePrivacy"
            value={settings.messagePrivacy}
            onChange={handleChange}
          >
            <option value="everyone">所有人</option>
            <option value="contacts">仅联系人</option>
            <option value="nobody">无人</option>
          </Select>
        </SettingItem>
      </Section>

      {/* 个人资料隐私 */}
      <Section>
        <SectionTitle>个人资料隐私</SectionTitle>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="lastSeen">最后在线时间</SettingLabel>
            <SettingDescription>控制谁可以看到您的最后在线时间</SettingDescription>
          </SettingInfo>
          <Select
            id="lastSeen"
            name="lastSeen"
            value={settings.lastSeen}
            onChange={handleChange}
          >
            <option value="everyone">所有人</option>
            <option value="contacts">仅联系人</option>
            <option value="nobody">无人</option>
          </Select>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="profileVisibility">个人资料可见性</SettingLabel>
            <SettingDescription>控制谁可以看到您的个人资料信息</SettingDescription>
          </SettingInfo>
          <Select
            id="profileVisibility"
            name="profileVisibility"
            value={settings.profileVisibility}
            onChange={handleChange}
          >
            <option value="everyone">所有人</option>
            <option value="contacts">仅联系人</option>
            <option value="nobody">无人</option>
          </Select>
        </SettingItem>
      </Section>

      {/* 数据隐私 */}
      <Section>
        <SectionTitle>数据隐私</SectionTitle>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="dataSharing">数据共享</SettingLabel>
            <SettingDescription>允许与第三方共享匿名使用数据以改进服务</SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="dataSharing"
              name="dataSharing"
              checked={settings.dataSharing}
              onChange={handleChange}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="analytics">使用分析</SettingLabel>
            <SettingDescription>收集使用数据以改进应用性能和用户体验</SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="analytics"
              name="analytics"
              checked={settings.analytics}
              onChange={handleChange}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>
      </Section>
    </Container>
  );
};

export default PrivacySettings;
