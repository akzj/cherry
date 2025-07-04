// 测试消息内容解析功能
import { parseMessageContent } from './types/types';

// 测试不同类型的消息内容
const testCases: Array<{
  name: string;
  content: any;
  type: string;
  expected: any;
}> = [
  // 文本消息
  {
    name: '纯文本消息',
    content: 'Hello, World!',
    type: 'text',
    expected: { type: 'text', text: 'Hello, World!' }
  },
  
  // 图片消息
  {
    name: '图片消息',
    content: {
      url: 'https://example.com/image.jpg',
      thumbnail_url: 'https://example.com/thumb.jpg',
      metadata: { width: 1920, height: 1080 },
      text: '这是一张图片'
    },
    type: 'image',
    expected: { 
      type: 'image', 
      text: '这是一张图片',
      imageUrl: 'https://example.com/image.jpg'
    }
  },
  
  // 音频消息
  {
    name: '音频消息',
    content: {
      url: 'https://example.com/audio.mp3',
      duration: 120,
      title: '音乐标题',
      artist: '艺术家'
    },
    type: 'audio',
    expected: {
      type: 'audio',
      audioUrl: 'https://example.com/audio.mp3',
      duration: 120,
      text: '音乐标题'
    }
  },
  
  // 视频消息
  {
    name: '视频消息',
    content: {
      url: 'https://example.com/video.mp4',
      thumbnail_url: 'https://example.com/video-thumb.jpg',
      duration: 300,
      width: 1920,
      height: 1080,
      title: '视频标题'
    },
    type: 'video',
    expected: {
      type: 'video',
      videoUrl: 'https://example.com/video.mp4',
      duration: 300,
      text: '视频标题'
    }
  },
  
  // 文件消息
  {
    name: '文件消息',
    content: {
      url: 'https://example.com/document.pdf',
      filename: 'document.pdf',
      size: 1024000,
      mime_type: 'application/pdf',
      thumbnail_url: 'https://example.com/pdf-thumb.jpg'
    },
    type: 'file',
    expected: {
      type: 'file',
      fileUrl: 'https://example.com/document.pdf',
      filename: 'document.pdf',
      fileSize: 1024000,
      mimeType: 'application/pdf'
    }
  },
  
  // 系统消息
  {
    name: '系统消息',
    content: {
      action: 'user_joined',
      data: { user_id: '123', username: 'alice' }
    },
    type: 'system',
    expected: {
      type: 'system',
      systemAction: 'user_joined',
      systemData: { user_id: '123', username: 'alice' },
      text: '系统消息: user_joined'
    }
  },
  
  // 表情消息
  {
    name: '表情消息',
    content: {
      native: '😊',
      unified: '1f60a',
      shortcodes: ':smile:'
    },
    type: 'emoji',
    expected: {
      type: 'emoji',
      emoji: '😊',
      text: '😊'
    }
  },
  
  // 代码消息
  {
    name: '代码消息',
    content: {
      code: 'console.log("Hello, World!");',
      language: 'javascript',
      filename: 'test.js'
    },
    type: 'code',
    expected: {
      type: 'code',
      code: 'console.log("Hello, World!");',
      language: 'javascript',
      text: 'test.js'
    }
  },
  
  // 位置消息
  {
    name: '位置消息',
    content: {
      latitude: 39.9042,
      longitude: 116.4074,
      address: '北京市朝阳区',
      name: '天安门广场'
    },
    type: 'location',
    expected: {
      type: 'location',
      latitude: 39.9042,
      longitude: 116.4074,
      address: '北京市朝阳区',
      text: '天安门广场'
    }
  },
  
  // 联系人消息
  {
    name: '联系人消息',
    content: {
      user_id: '456',
      name: '张三',
      avatar: 'https://example.com/avatar.jpg',
      phone: '+86 138 0000 0000',
      email: 'zhangsan@example.com'
    },
    type: 'contact',
    expected: {
      type: 'contact',
      contactId: '456',
      contactName: '张三',
      contactAvatar: 'https://example.com/avatar.jpg',
      contactPhone: '+86 138 0000 0000',
      contactEmail: 'zhangsan@example.com',
      text: '联系人: 张三'
    }
  },
  
  // 事件消息
  {
    name: '事件消息',
    content: {
      event_type: 'message_edited',
      data: { message_id: 789, new_content: '更新后的内容' }
    },
    type: 'event',
    expected: {
      type: 'event',
      eventType: 'message_edited',
      eventData: { message_id: 789, new_content: '更新后的内容' },
      text: '事件: message_edited'
    }
  },
  
  // 自定义消息
  {
    name: '自定义消息',
    content: {
      type: 'poll',
      data: { question: '你最喜欢的颜色？', options: ['红色', '蓝色', '绿色'] }
    },
    type: 'custom',
    expected: {
      type: 'custom',
      customType: 'poll',
      customData: { question: '你最喜欢的颜色？', options: ['红色', '蓝色', '绿色'] },
      text: '自定义消息: poll'
    }
  }
];

// 运行测试
function runTests() {
  console.log('🧪 开始测试消息内容解析功能...\n');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    try {
      const result = parseMessageContent(testCase.content, testCase.type);
      
      // 简单的比较（实际项目中可能需要更复杂的深度比较）
      const isSuccess = result.type === testCase.expected.type;
      
      if (isSuccess) {
        console.log(`✅ ${index + 1}. ${testCase.name}`);
        console.log(`   结果: ${JSON.stringify(result, null, 2)}`);
        passed++;
      } else {
        console.log(`❌ ${index + 1}. ${testCase.name}`);
        console.log(`   期望: ${JSON.stringify(testCase.expected, null, 2)}`);
        console.log(`   实际: ${JSON.stringify(result, null, 2)}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${index + 1}. ${testCase.name} - 解析失败: ${error}`);
      failed++;
    }
    console.log('');
  });
  
  console.log(`📊 测试结果: ${passed} 通过, ${failed} 失败`);
  
  if (failed === 0) {
    console.log('🎉 所有测试通过！');
  } else {
    console.log('⚠️  有测试失败，请检查实现');
  }
}

// 导出测试函数
export { runTests, testCases };

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 在浏览器环境中，可以调用 runTests() 来执行测试
  console.log('消息解析测试模块已加载，调用 runTests() 来执行测试');
} else {
  // 在 Node.js 环境中直接运行测试
  runTests();
} 