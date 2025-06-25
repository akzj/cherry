import { Contact, ContactGroup, Group } from '../types/contact';

// 模拟联系人数据
export const mockContacts: Contact[] = [
    {
        id: '1',
        name: '张三',
        avatar: 'https://cdn3.iconfinder.com/data/icons/diversity-avatars/64/doctor-man-asian-128.png',
        status: 'online',
    },
    {
        id: '2',
        name: '李四',
        avatar: 'https://cdn3.iconfinder.com/data/icons/diversity-avatars/64/doctor-man-asian-128.png',
        status: 'busy',
    },
    {
        id: '3',
        name: '王五',
        avatar: 'https://cdn3.iconfinder.com/data/icons/diversity-avatars/64/doctor-man-asian-128.png',
        status: 'offline',
    },
    {
        id: '4',
        name: '赵六',
        avatar: 'https://cdn0.iconfinder.com/data/icons/avatars-158/512/man_9-256.png',
        status: 'away',
    },
    {
        id: '5',
        name: '孙七',
        avatar: 'https://cdn2.iconfinder.com/data/icons/avatar-and-emotion-2/64/07-Wink-256.png',
        status: 'offline',
    },
    {
        id: '6',
        name: '周八',
        avatar: 'https://cdn3.iconfinder.com/data/icons/diversity-avatars/64/doctor-man-asian-128.png',
        status: 'away',
    },
    {
        id: '7',
        name: '吴九',
        avatar: 'https://cdn3.iconfinder.com/data/icons/diversity-avatars/64/doctor-man-asian-128.png',
        status: 'offline',
    },
    {
        id: '8',
        name: '郑十',
        avatar: 'https://cdn3.iconfinder.com/data/icons/diversity-avatars/64/doctor-man-asian-128.png',
        status: 'away',
    },
    {
        id: '9',
        name: '陈十一',
        avatar: 'https://cdn3.iconfinder.com/data/icons/diversity-avatars/64/doctor-man-asian-128.png',
        status: 'offline',
    },
    {
        id: '10',
        name: '刘十二',
        avatar: 'https://cdn3.iconfinder.com/data/icons/diversity-avatars/64/doctor-man-asian-128.png',
        status: 'away',
    }
];

// 模拟联系人分组
export const mockContactGroups: ContactGroup[] = [
    {
        id: '1',
        title: '项目A设计',
        contacts: mockContacts.slice(0, 3)
    },
    {
        id: '2',
        title: '项目A研发',
        contacts: mockContacts.slice(3, 6)
    }
];

// 模拟创建的群组
export const mockOwnedGroups: Group[] = [
    {
        id: 'gr1',
        name: '产品设计讨论组',
        avatar: 'https://cdn3.iconfinder.com/data/icons/diversity-avatars/64/doctor-man-asian-128.png',
        memberCount: 15,
        isOwner: true,
    },
    // 更多创建的群...
];

// 模拟加入的群组
export const mockJoinedGroups: Group[] = [
    {
        id: 'gr2',
        name: '前端技术交流',
        avatar: 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/boy_male_avatar_portrait-128.png',
        memberCount: 42,
        isOwner: false,
    },
    {
        id: 'gr3',
        name: '后端技术交流',
        avatar: 'https://cdn4.iconfinder.com/data/icons/avatars-xmas-giveaway/128/boy_male_avatar_portrait-128.png',
        memberCount: 42,
        isOwner: false,
    },
    {
        id: 'gr4',
        name: '前端技术交流',
        avatar: 'https://cdn1.iconfinder.com/data/icons/male-2/64/man_male_boy_cute_person_avatar_people-05-256.png',
        memberCount: 42,
        isOwner: false,
    },
    {
        id: 'gr5',
        name: '前端技术交流',
        avatar: 'https://cdn3.iconfinder.com/data/icons/diversity-avatars/64/doctor-man-asian-128.png',
        memberCount: 42,
        isOwner: false,
    }
];
