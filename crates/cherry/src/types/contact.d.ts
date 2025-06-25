// 基础联系人类型
export interface Contact {
    contact_id: string;
    owner_id: string;
    target_id: string;
    relation_type: string;
    created_at: Date;
    updated_at: Date;
    remark_name: string;
    avatar_url: string;
    status: string;
    tags: string;
    is_favorite: boolean;
    mute_settings: string;
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
    title: string; // 分组标题（如字母 A、B、C 等）
    contacts: Contact[];
  }
  