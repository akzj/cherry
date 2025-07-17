import styled from 'styled-components';

export const CardContainer = styled.div`
  position: fixed; /* Using fixed position to keep it in view even when scrolling */
  width: 280px;
  background-color: #1e1e2d;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1);
  padding: 0;
  z-index: 1500; /* Higher z-index to ensure it appears above other elements */
  overflow: hidden;
  animation: fadeIn 0.2s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

export const CardHeader = styled.div`
  position: relative;
  height: 80px;
  background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%);
`;

export const UserInfoSection = styled.div`
  position: relative;
  padding: 0 16px 16px;
  margin-top: -40px;
`;

export const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
`;

export const LargeAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid #1e1e2d;
  overflow: hidden;
  background-color: #2c2c3a;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const UserName = styled.h3`
  color: #ffffff;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
  margin: 12px 0 4px;
`;

export const UserStatus = styled.div<{ $isOnline?: boolean }>`
  font-size: 14px;
  text-align: center;
  color: ${props => props.$isOnline ? '#22c55e' : '#94a3b8'};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.$isOnline ? '#22c55e' : '#94a3b8'};
  }
`;

export const UserBio = styled.p`
  color: #d1d5db;
  font-size: 14px;
  line-height: 1.5;
  text-align: center;
  margin: 12px 0;
`;

export const Divider = styled.div`
  height: 1px;
  background-color: rgba(255, 255, 255, 0.1);
  margin: 12px 0;
`;

export const ActionButtons = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 16px;
`;

export const ActionButton = styled.button`
  background-color: transparent;
  color: #a5b4fc;
  border: 1px solid rgba(165, 180, 252, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    background-color: rgba(165, 180, 252, 0.1);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
`;

export const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #d1d5db;
  font-size: 13px;
  
  svg {
    width: 16px;
    height: 16px;
    color: #94a3b8;
  }
`;
