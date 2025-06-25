import React, { useState } from 'react';
import styled from 'styled-components';
import type { ThemePreference } from '../../types/settings';

interface AppearanceSettingsProps {
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

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

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
`;

const ThemeButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.25rem 1rem;
  border-radius: 16px;
  border: 2px solid ${props => props.$active ? 'rgba(134, 239, 172, 0.4)' : 'rgba(134, 239, 172, 0.1)'};
  background: ${props => props.$active ? 'rgba(134, 239, 172, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(134, 239, 172, 0.2);
    border-color: rgba(134, 239, 172, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ThemeIcon = styled.div<{ $theme: string }>`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  margin-bottom: 0.75rem;
  background: ${props => {
    switch (props.$theme) {
      case 'light': return 'linear-gradient(135deg, #fbbf24, #f59e0b)';
      case 'dark': return 'linear-gradient(135deg, #374151, #1f2937)';
      case 'system': return 'linear-gradient(135deg, #e5e7eb, #6b7280)';
      default: return 'linear-gradient(135deg, #e5e7eb, #6b7280)';
    }
  }};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  ${ThemeButton}:hover & {
    transform: scale(1.1);
  }
`;

const ThemeLabel = styled.span<{ $active: boolean }>`
  font-size: 0.875rem;
  font-weight: ${props => props.$active ? '600' : '500'};
  color: ${props => props.$active ? 'rgba(22, 57, 35, 0.9)' : 'rgba(22, 57, 35, 0.7)'};
`;

const SliderContainer = styled.div`
  margin-top: 1rem;
`;

const SliderLabel = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
`;

const SliderValue = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: rgba(22, 57, 35, 0.8);
  background: rgba(134, 239, 172, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  border: 1px solid rgba(134, 239, 172, 0.2);
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(134, 239, 172, 0.2);
  outline: none;
  appearance: none;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #86efac, #22c55e);
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(134, 239, 172, 0.3);
    transition: all 0.3s ease;
  }
  
  &::-webkit-slider-thumb:hover {
    transform: scale(1.2);
    box-shadow: 0 4px 12px rgba(134, 239, 172, 0.4);
  }
  
  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #86efac, #22c55e);
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 8px rgba(134, 239, 172, 0.3);
  }
`;

const SliderLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
`;

const SliderLabelText = styled.span`
  font-size: 0.75rem;
  color: rgba(22, 57, 35, 0.6);
`;

const DensityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
`;

const DensityButton = styled.button<{ $active: boolean }>`
  padding: 0.875rem 1rem;
  border-radius: 12px;
  border: 1px solid ${props => props.$active ? 'rgba(134, 239, 172, 0.4)' : 'rgba(134, 239, 172, 0.1)'};
  background: ${props => props.$active ? 'rgba(134, 239, 172, 0.15)' : 'rgba(255, 255, 255, 0.05)'};
  color: ${props => props.$active ? 'rgba(22, 57, 35, 0.9)' : 'rgba(22, 57, 35, 0.7)'};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(134, 239, 172, 0.2);
    border-color: rgba(134, 239, 172, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ setDarkMode }) => {
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
    <Container>
      {/* 主题选择 */}
      <Section>
        <SectionTitle>主题</SectionTitle>
        <ThemeGrid>
          {(['light', 'dark', 'system'] as ThemePreference[]).map((theme) => (
            <ThemeButton
              key={theme}
              $active={settings.theme === theme}
              onClick={() => handleThemeChange(theme)}
            >
              <ThemeIcon $theme={theme} />
              <ThemeLabel $active={settings.theme === theme}>
                {theme === 'light' && '浅色'}
                {theme === 'dark' && '深色'}
                {theme === 'system' && '跟随系统'}
              </ThemeLabel>
            </ThemeButton>
          ))}
        </ThemeGrid>
      </Section>

      {/* 字体大小 */}
      <Section>
        <SectionTitle>字体大小</SectionTitle>
        <SliderContainer>
          <SliderLabel>
            <span>调整字体大小</span>
            <SliderValue>{settings.fontSize}px</SliderValue>
          </SliderLabel>
          <Slider
            type="range"
            min="12"
            max="24"
            value={settings.fontSize}
            onChange={handleFontSizeChange}
          />
          <SliderLabels>
            <SliderLabelText>小</SliderLabelText>
            <SliderLabelText>中</SliderLabelText>
            <SliderLabelText>大</SliderLabelText>
          </SliderLabels>
        </SliderContainer>
      </Section>

      {/* 界面密度 */}
      <Section>
        <SectionTitle>界面密度</SectionTitle>
        <DensityGrid>
          {(['compact', 'normal', 'spacious'] as const).map((density) => (
            <DensityButton
              key={density}
              $active={settings.density === density}
              onClick={() => handleDensityChange(density)}
            >
              {density === 'compact' && '紧凑'}
              {density === 'normal' && '标准'}
              {density === 'spacious' && '宽松'}
            </DensityButton>
          ))}
        </DensityGrid>
      </Section>
    </Container>
  );
};

export default AppearanceSettings;
