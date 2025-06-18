// 基础联系人类型
export interface Contact {
    id: string;
    name: string;
    avatar: string;
    status: 'online' | 'offline' | 'busy' | 'away';
    lastActive?: Date;
  }
  
  // 群组类型
  export interface Group {
    id: string;
    name: string;
    avatar: string;
    memberCount: number;
    isOwner: boolean; // 区分创建者/成员
  }
  
  // 联系人分组类型
  export interface ContactGroup {
    id: string;
    name: string;
    contacts: Contact[];
  }
  