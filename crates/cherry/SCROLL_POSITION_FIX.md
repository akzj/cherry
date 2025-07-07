# 消息列表滚动位置保持解决方案 (更新版)

## 问题描述

在消息列表中，当用户向上滚动加载历史消息时，会出现滚动位置漂移和抖动的问题。具体表现为：

1. 用户正在查看某个位置的消息
2. 向上滚动触发历史消息加载
3. 新消息被添加到列表前面，导致DOM重新渲染
4. 滚动位置发生变化，用户失去当前查看的位置
5. 异步内容加载（如图片）导致高度变化，引起抖动

## 最新解决方案

### 1. 简化的锚点消息机制

使用更简单但更有效的锚点消息机制：

```typescript
// 设置锚点消息（用于保持滚动位置）
const setAnchorMessage = useCallback(() => {
  if (!containerRef.current) return;
  
  const container = containerRef.current;
  const scrollTop = container.scrollTop;
  const containerHeight = container.clientHeight;
  const centerPosition = scrollTop + containerHeight / 2;

  // 找到滚动中心位置的消息作为锚点
  let anchorMessage: number | null = null;
  let minDistance = Infinity;

  for (let i = 0; i < container.children.length; i++) {
    const child = container.children[i] as HTMLElement;
    const childTop = child.offsetTop;
    const childBottom = childTop + child.offsetHeight;
    
    if (centerPosition >= childTop && centerPosition <= childBottom) {
      anchorMessage = parseInt(child.getAttribute('data-message-id') || '0');
      break;
    }
    
    const distance = Math.min(
      Math.abs(centerPosition - childTop),
      Math.abs(centerPosition - childBottom)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      anchorMessage = parseInt(child.getAttribute('data-message-id') || '0');
    }
  }

  anchorMessageRef.current = anchorMessage;
}, []);
```

### 2. 简化的滚动位置恢复

使用更稳定的滚动位置恢复机制：

```typescript
// 简化的滚动位置恢复
const restoreScrollPosition = useCallback(() => {
  if (!containerRef.current || !anchorMessageRef.current || isRestoringScrollRef.current) return;

  isRestoringScrollRef.current = true;
  const container = containerRef.current;
  const anchorId = anchorMessageRef.current;
  
  // 使用 requestAnimationFrame 确保DOM已更新
  requestAnimationFrame(() => {
    const anchorElement = container.querySelector(`[data-message-id="${anchorId}"]`) as HTMLElement;
    if (anchorElement) {
      const newScrollTop = anchorElement.offsetTop - container.offsetTop - container.clientHeight / 2;
      container.scrollTop = newScrollTop;
    }
    
    // 延迟重置标志，避免重复执行
    setTimeout(() => {
      isRestoringScrollRef.current = false;
    }, 200);
  });
}, []);
```

### 3. CSS固定高度优化

为消息容器添加固定高度，减少高度变化：

```css
const MessageContainer = styled.div<{ $isOwn: boolean }>`
  display: flex;
  justify-content: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  align-self: ${props => props.$isOwn ? 'flex-end' : 'flex-start'};
  align-items: flex-end;
  gap: 0.5rem;
  max-width: 70%;
  min-height: 60px; /* 添加最小高度 */
  margin: 4px 0; /* 添加固定间距 */
`;

const MessageBubble = styled.div<{ $isOwn: boolean; $isReply?: boolean }>`
  /* ... 其他样式 ... */
  min-height: 40px; /* 添加最小高度 */
`;
```

### 4. 异步内容处理优化

简化异步图片加载，减少高度变化：

```typescript
// 简化的异步图片组件
const AsyncMessageImage: React.FC<{ url: string }> = ({ url }) => {
  const [src, setSrc] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const getFile = async (url: string) => {
      const cache_file_path = await path.join(appCacheDirPath, url);
      const cache_file_exists = await exists(cache_file_path);
      if (cache_file_exists) {
        return cache_file_path;
      }
      return await invoke('cmd_download_file', {
        url: url,
        filePath: cache_file_path
      });
    };
    (async () => {
      setIsLoading(true);
      const path = await getFile(url);
      if (mounted) {
        setSrc(path as string);
        setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [url]);

  if (isLoading) {
    return <div style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>图片加载中...</div>;
  }
  
  if (!src) return <span>图片加载失败</span>;
  
  return (
    <img 
      src={`cherry://localhost?file_path=${src}`} 
      style={{ maxWidth: '220px', maxHeight: '220px', borderRadius: '8px', margin: '4px 0' }}
    />
  );
};
```

### 5. 防抖和时机控制

使用防抖和正确的时机控制：

```typescript
// 监听消息变化，恢复滚动位置
useEffect(() => {
  const currentLength = messages.length;
  const prevLength = prevMessagesLengthRef.current;

  // 如果是加载历史消息（消息数量增加且不是第一次加载）
  if (currentLength > prevLength && prevLength > 0) {
    // 使用多层延迟确保DOM完全渲染
    setTimeout(() => {
      restoreScrollPosition();
    }, 100);
  }

  prevMessagesLengthRef.current = currentLength;
}, [messages.length, restoreScrollPosition]);
```

## 关键改进点

### 1. 移除复杂的高度监听
- 不再使用 ResizeObserver 监听每个消息的高度变化
- 避免频繁的高度计算和位置调整

### 2. 简化滚动恢复逻辑
- 使用更直接的滚动位置计算
- 减少不必要的DOM查询和计算

### 3. CSS固定高度
- 为消息容器添加最小高度
- 减少内容加载时的高度变化

### 4. 更好的时机控制
- 使用 setTimeout + requestAnimationFrame 确保DOM更新完成
- 避免在DOM渲染过程中进行滚动调整

### 5. 防抖处理
- 使用 isRestoringScrollRef 防止重复执行
- 延迟重置标志，避免频繁触发

## 测试工具

提供了 `ScrollStabilityTest` 组件来测试滚动稳定性：

```typescript
import ScrollStabilityTest from './test-scroll-stability';

// 在开发环境中使用
<ScrollStabilityTest conversationId={conversationId} />
```

## 效果

实施这些改进后：

- ✅ **滚动位置保持稳定**，不会出现漂移
- ✅ **减少抖动**，异步内容加载更平滑
- ✅ **性能更好**，减少不必要的计算和监听
- ✅ **代码更简洁**，易于维护和理解
- ✅ **用户体验更佳**，浏览历史消息更流畅

## 注意事项

1. **CSS固定高度**：确保最小高度设置合理，不会影响内容显示
2. **时机控制**：延迟时间需要根据实际网络和渲染性能调整
3. **测试验证**：使用提供的测试工具验证修复效果
4. **性能监控**：监控滚动事件的频率和性能影响 