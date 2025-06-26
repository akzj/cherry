// 测试认证修复
// 在Chrome开发者工具的控制台中执行

async function testAuthFix() {
  console.log('=== 测试认证修复 ===');
  
  try {
    // 1. 清除localStorage中的认证数据
    console.log('1. 清除localStorage认证数据...');
    localStorage.removeItem('auth-storage');
    console.log('✅ localStorage已清除');
    
    // 2. 检查初始状态
    console.log('2. 检查初始状态...');
    if (typeof window.useAuthStore !== 'undefined') {
      const state = window.useAuthStore.getState();
      console.log('初始认证状态:', {
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
        user: state.user,
        token: state.token
      });
    }
    
    // 3. 重新加载页面
    console.log('3. 重新加载页面...');
    console.log('请手动刷新页面 (F5) 来测试修复效果');
    
    // 4. 预期结果
    console.log('4. 预期结果:');
    console.log('- 页面应该显示登录表单');
    console.log('- 不应该自动跳转到主应用');
    console.log('- 需要手动输入用户名密码登录');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 导出到全局
window.testAuthFix = testAuthFix;

console.log('认证修复测试脚本已加载');
console.log('执行 window.testAuthFix() 开始测试'); 