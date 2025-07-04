// 测试 emoji 反应切换功能
import { Message, Reaction } from './types/types';

// 模拟消息数据
const createTestMessage = (id: number, reactions?: Reaction[]): Message => ({
  id,
  userId: 'test-user',
  content: 'Test message',
  timestamp: '2024-01-01T12:00:00Z',
  type: 'text',
  reactions: reactions || []
});

// 模拟 store 方法
let mockAddReactionCalled = false;
let mockRemoveReactionCalled = false;
let lastAddReactionArgs: any[] = [];
let lastRemoveReactionArgs: any[] = [];

const mockAddReaction = (conversationId: string, messageId: number, emoji: string, userId: string) => {
  mockAddReactionCalled = true;
  lastAddReactionArgs = [conversationId, messageId, emoji, userId];
};

const mockRemoveReaction = (conversationId: string, messageId: number, emoji: string, userId: string) => {
  mockRemoveReactionCalled = true;
  lastRemoveReactionArgs = [conversationId, messageId, emoji, userId];
};

// 模拟 handleReactionClick 函数
const handleReactionClick = (msg: Message, emoji: string, currentUserId: string, conversationId: string) => {
  // 检查当前用户是否已经点击过这个 emoji
  const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
  const hasUserReacted = existingReaction?.users.includes(currentUserId);
  
  if (hasUserReacted) {
    // 如果用户已经点击过，则删除反应
    mockRemoveReaction(conversationId, msg.id, emoji, currentUserId);
  } else {
    // 如果用户没有点击过，则添加反应
    mockAddReaction(conversationId, msg.id, emoji, currentUserId);
  }
};

// 测试用例
const testCases = [
  {
    name: '用户第一次点击 emoji - 应该添加反应',
    message: createTestMessage(1),
    emoji: '👍',
    currentUserId: 'user1',
    conversationId: 'conv1',
    expectedAction: 'add',
    expectedArgs: ['conv1', 1, '👍', 'user1']
  },
  {
    name: '用户再次点击同一个 emoji - 应该删除反应',
    message: createTestMessage(2, [
      { emoji: '👍', users: ['user1', 'user2'] }
    ]),
    emoji: '👍',
    currentUserId: 'user1',
    conversationId: 'conv1',
    expectedAction: 'remove',
    expectedArgs: ['conv1', 2, '👍', 'user1']
  },
  {
    name: '用户点击不同的 emoji - 应该添加新反应',
    message: createTestMessage(3, [
      { emoji: '👍', users: ['user1'] }
    ]),
    emoji: '❤️',
    currentUserId: 'user1',
    conversationId: 'conv1',
    expectedAction: 'add',
    expectedArgs: ['conv1', 3, '❤️', 'user1']
  },
  {
    name: '其他用户点击已有反应的 emoji - 应该添加反应',
    message: createTestMessage(4, [
      { emoji: '👍', users: ['user1'] }
    ]),
    emoji: '👍',
    currentUserId: 'user2',
    conversationId: 'conv1',
    expectedAction: 'add',
    expectedArgs: ['conv1', 4, '👍', 'user2']
  },
  {
    name: '用户点击没有反应的消息 - 应该添加反应',
    message: createTestMessage(5),
    emoji: '😊',
    currentUserId: 'user1',
    conversationId: 'conv1',
    expectedAction: 'add',
    expectedArgs: ['conv1', 5, '😊', 'user1']
  }
];

// 运行测试
function runReactionTests() {
  console.log('🧪 开始测试 emoji 反应切换功能...\n');
  
  let passed = 0;
  let failed = 0;
  
  testCases.forEach((testCase, index) => {
    // 重置模拟状态
    mockAddReactionCalled = false;
    mockRemoveReactionCalled = false;
    lastAddReactionArgs = [];
    lastRemoveReactionArgs = [];
    
    try {
      // 执行测试
      handleReactionClick(
        testCase.message,
        testCase.emoji,
        testCase.currentUserId,
        testCase.conversationId
      );
      
      // 验证结果
      let isSuccess = false;
      let actualAction = '';
      let actualArgs: any[] = [];
      
      if (testCase.expectedAction === 'add') {
        isSuccess = mockAddReactionCalled && !mockRemoveReactionCalled;
        actualAction = 'add';
        actualArgs = lastAddReactionArgs;
      } else {
        isSuccess = mockRemoveReactionCalled && !mockAddReactionCalled;
        actualAction = 'remove';
        actualArgs = lastRemoveReactionArgs;
      }
      
      // 验证参数
      const argsMatch = JSON.stringify(actualArgs) === JSON.stringify(testCase.expectedArgs);
      isSuccess = isSuccess && argsMatch;
      
      if (isSuccess) {
        console.log(`✅ ${index + 1}. ${testCase.name}`);
        console.log(`   动作: ${actualAction}`);
        console.log(`   参数: [${actualArgs.join(', ')}]`);
        passed++;
      } else {
        console.log(`❌ ${index + 1}. ${testCase.name}`);
        console.log(`   期望: ${testCase.expectedAction} [${testCase.expectedArgs.join(', ')}]`);
        console.log(`   实际: ${actualAction} [${actualArgs.join(', ')}]`);
        console.log(`   addReactionCalled: ${mockAddReactionCalled}`);
        console.log(`   removeReactionCalled: ${mockRemoveReactionCalled}`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ ${index + 1}. ${testCase.name} - 测试失败: ${error}`);
      failed++;
    }
    console.log('');
  });
  
  console.log(`📊 测试结果: ${passed} 通过, ${failed} 失败`);
  
  if (failed === 0) {
    console.log('🎉 所有 emoji 反应切换测试通过！');
  } else {
    console.log('⚠️  有测试失败，请检查实现');
  }
}

// 导出测试函数
export { runReactionTests, testCases };

// 如果直接运行此文件，执行测试
if (typeof window !== 'undefined') {
  // 在浏览器环境中，可以调用 runReactionTests() 来执行测试
  console.log('Emoji 反应切换测试模块已加载，调用 runReactionTests() 来执行测试');
} else {
  // 在 Node.js 环境中直接运行测试
  runReactionTests();
} 