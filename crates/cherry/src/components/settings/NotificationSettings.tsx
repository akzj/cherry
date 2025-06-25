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

const TimeSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(134, 239, 172, 0.2);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: rgba(22, 57, 35, 0.8);
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: rgba(134, 239, 172, 0.4);
    box-shadow: 0 0 0 2px rgba(134, 239, 172, 0.1);
  }
  
  &:hover {
    border-color: rgba(134, 239, 172, 0.3);
    background: rgba(255, 255, 255, 0.15);
  }
`;

const NotificationSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    newMessages: true,
    sound: true,
    vibration: true,
    previewContent: true,
    groupMessages: true,
    mentions: true,
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00'
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
      {/* 基本通知设置 */}
      <Section>
        <SectionTitle>基本通知</SectionTitle>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="newMessages">新消息通知</SettingLabel>
            <SettingDescription>接收新消息的推送通知</SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="newMessages"
              name="newMessages"
              checked={settings.newMessages}
              onChange={handleChange}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="sound">提示音效</SettingLabel>
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

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="vibration">振动提醒</SettingLabel>
            <SettingDescription>收到消息时设备振动</SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="vibration"
              name="vibration"
              checked={settings.vibration}
              onChange={handleChange}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="previewContent">显示消息预览</SettingLabel>
            <SettingDescription>在通知中显示消息内容</SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="previewContent"
              name="previewContent"
              checked={settings.previewContent}
              onChange={handleChange}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>
      </Section>

      {/* 高级通知设置 */}
      <Section>
        <SectionTitle>高级通知</SectionTitle>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="groupMessages">群组消息</SettingLabel>
            <SettingDescription>接收群组消息的通知</SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="groupMessages"
              name="groupMessages"
              checked={settings.groupMessages}
              onChange={handleChange}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="mentions">@提及通知</SettingLabel>
            <SettingDescription>当有人@您时发送特殊通知</SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="mentions"
              name="mentions"
              checked={settings.mentions}
              onChange={handleChange}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>
      </Section>

      {/* 免打扰设置 */}
      <Section>
        <SectionTitle>免打扰时间</SectionTitle>
        
        <SettingItem>
          <SettingInfo>
            <SettingLabel htmlFor="quietHours">启用免打扰</SettingLabel>
            <SettingDescription>在指定时间段内静音通知</SettingDescription>
          </SettingInfo>
          <ToggleSwitch>
            <ToggleInput
              type="checkbox"
              id="quietHours"
              name="quietHours"
              checked={settings.quietHours}
              onChange={handleChange}
            />
            <ToggleSlider />
          </ToggleSwitch>
        </SettingItem>

        {settings.quietHours && (
          <>
            <SettingItem>
              <SettingInfo>
                <SettingLabel htmlFor="quietStart">开始时间</SettingLabel>
                <SettingDescription>免打扰模式开始时间</SettingDescription>
              </SettingInfo>
              <TimeSelect
                id="quietStart"
                name="quietStart"
                value={settings.quietStart}
                onChange={handleChange}
              >
                <option value="20:00">20:00</option>
                <option value="21:00">21:00</option>
                <option value="22:00">22:00</option>
                <option value="23:00">23:00</option>
                <option value="00:00">00:00</option>
              </TimeSelect>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel htmlFor="quietEnd">结束时间</SettingLabel>
                <SettingDescription>免打扰模式结束时间</SettingDescription>
              </SettingInfo>
              <TimeSelect
                id="quietEnd"
                name="quietEnd"
                value={settings.quietEnd}
                onChange={handleChange}
              >
                <option value="06:00">06:00</option>
                <option value="07:00">07:00</option>
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
              </TimeSelect>
            </SettingItem>
          </>
        )}
      </Section>
    </Container>
  );
};

export default NotificationSettings;
