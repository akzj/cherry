'use client';
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { DefaultScrollBar } from './scroll-bar';
import { ReactElement, Key } from 'react';

// 定义必须包含 key 的 ReactElement 类型
export type ElementWithKey<P = any> = ReactElement<P> & { key: Key };
/* ----------  TYPES  ---------- */
export type ElementWithKeyArr = ElementWithKey[];
export type UpdateElementHandle = (elements: ElementWithKeyArr) => ElementWithKeyArr;

export interface ScrollURef {
  updateElements: (handle: UpdateElementHandle) => void;
  listNodes: () => ElementWithKeyArr;
  triggerRender: (direction: 'pre' | 'next') => void;
}

export interface ScrollUProps {
  className?: any;
  renderMore?: (
    direction: 'pre' | 'next',
    contextData?: ElementWithKey
  ) => Promise<ElementWithKeyArr>;
  initialItems?: ElementWithKeyArr;
  showScrollBar?: boolean;
  scrollBarRender?: (height: number, top: number) => React.ReactNode;
  scrollbarGutter?: number;
}

export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return (node: T) => {
    refs.forEach(ref => {
      if (!ref) return;
      if (typeof ref === 'function') ref(node);
      else (ref as React.MutableRefObject<T | null>).current = node;
    });
  };
}

/* ----------  COMPONENT  ---------- */
const ScrollU = forwardRef<ScrollURef, ScrollUProps>((props, ref) => {
  const {
    className,
    renderMore,
    initialItems = [],
    showScrollBar = true,
    scrollBarRender = (height: number, top: number) => (
      <DefaultScrollBar height={height} top={top} />
    ),
    scrollbarGutter = 20,
  } = props;

  /* ----------  REFS & STATE  ---------- */
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollBar, setScroll] = useState({ height: 0, top: 0 });

  const rafId = useRef<number | null>(null);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  const [elements, setElements] = useState<ElementWithKeyArr>(initialItems);
  const isLoadingPre: React.MutableRefObject<boolean> = useRef<boolean>(false);
  const isLoadingNext: React.MutableRefObject<boolean> = useRef<boolean>(false);

  // IntersectionObserver 节流相关
  const preThrottleTimer = useRef<number | null>(null);
  const nextThrottleTimer = useRef<number | null>(null);
  const lastPreTrigger = useRef<number>(0);
  const lastNextTrigger = useRef<number>(0);

  // 滚动状态跟踪
  const isScrolling = useRef<boolean>(false);
  const scrollEndTimer = useRef<number | null>(null);
  const lastScrollTime = useRef<number>(0);
  const scrollVelocity = useRef<number>(0);
  const lastScrollTimestamp = useRef<number>(0);

  // 延迟加载相关
  const pendingPreLoad = useRef<boolean>(false);
  const pendingNextLoad = useRef<boolean>(false);
  const retryLoadTimer = useRef<number | null>(null);

  // 防重复请求的状态跟踪
  const lastPreContext = useRef<ElementWithKey | null>(null);
  const lastNextContext = useRef<ElementWithKey | null>(null);
  const lastPreTime = useRef<number>(0);
  const lastNextTime = useRef<number>(0);

  /* 顶部添加元素后的滚动位置调整 */
  const pendingPreAdjust = useRef<null | { oldHeight: number; oldScrollTop: number }>(null);
  /* 顶部清理元素后的滚动位置调整 */
  const pendingTopCleanAdjust = useRef<null | { oldHeight: number, oldScrollTop: number }>(null);

  /* ----------  IMPERATIVE HANDLE  ---------- */
  useImperativeHandle(ref, () => ({
    updateElements: (handler: UpdateElementHandle) => {
      const container = containerRef.current;
      if (!container) return;
      setElements(prev => handler(prev));
    },
    listNodes: () => elements,
    triggerRender: (direction: 'pre' | 'next') => {
      direction === 'pre' ? handlePre() : handleNext();
    },
  }));

  // 监听元素变化，清空对应的上下文
  useEffect(() => {
    const first = elements[0];
    const last = elements[elements.length - 1];

    // 如果第一个元素发生变化，清空 pre 上下文
    if (lastPreContext.current && first && lastPreContext.current.key !== first.key) {
      console.log('ScrollU: Clearing pre context due to element change');
      lastPreContext.current = null;
    }

    // 如果最后一个元素发生变化，清空 next 上下文
    if (lastNextContext.current && last && lastNextContext.current.key !== last.key) {
      console.log('ScrollU: Clearing next context due to element change');
      lastNextContext.current = null;
    }
  }, [elements]);

  const handlePre = useCallback(async () => {
    console.log('ScrollU: handlePre called');
    if (!containerRef.current || !contentRef.current) return;
    if (!renderMore) return;

    if (isLoadingPre.current) {
      console.warn('ScrollU: handlePre already loading');
      return;
    }

    const first = elements[0];
    if (!first) return;

    const now = Date.now();

    // 检查是否与上次请求的上下文相同，以及是否在短时间内重复请求
    if (lastPreContext.current && lastPreContext.current.key === first.key &&
      now - lastPreTime.current < 800) { // 800ms内不允许重复请求
      console.warn('ScrollU: handlePre skipping duplicate request for same context', first.key, 'time diff:', now - lastPreTime.current);
      return;
    }

    isLoadingPre.current = true;
    lastPreContext.current = first; // 记录当前请求的上下文
    lastPreTime.current = now; // 记录请求时间

    console.log('ScrollU: handlePre fetching more items', first, 'context set at:', now);

    try {
      const newItems = await renderMore('pre', first);
      if (!newItems?.length) {
        console.warn('ScrollU: handlePre returned no new items');
        isLoadingPre.current = false;
      } else {
        console.log('ScrollU: handlePre new items', newItems);
        const container = containerRef.current;
        if (!container) return;

        pendingPreAdjust.current = {
          oldHeight: contentRef.current!.scrollHeight,
          oldScrollTop: container.scrollTop,
        };
        intersectionObserver.current?.unobserve(_firstNode.current!);
        setElements(prev => [...newItems, ...prev]);
        // 不要立即清空上下文，只在元素真正改变时清空
      }
    } catch (error) {
      console.error('ScrollU: handlePre error', error);
      isLoadingPre.current = false;
      // 只在错误时清空上下文，允许重试
      lastPreContext.current = null;
    } finally {
    }
  }, [renderMore, isLoadingPre, elements]);

  const handleNext = useCallback(async () => {
    if (!renderMore || isLoadingNext.current) return;

    const last = elements[elements.length - 1];
    if (!last) return;

    const now = Date.now();

    // 检查是否与上次请求的上下文相同，以及是否在短时间内重复请求
    if (lastNextContext.current && lastNextContext.current.key === last.key &&
      now - lastNextTime.current < 800) { // 800ms内不允许重复请求
      console.warn('ScrollU: handleNext skipping duplicate request for same context', last.key, 'time diff:', now - lastNextTime.current);
      return;
    }

    isLoadingNext.current = true;
    lastNextContext.current = last; // 记录当前请求的上下文
    lastNextTime.current = now; // 记录请求时间

    try {
      const newItems = await renderMore('next', last);
      if (!newItems?.length) {
        console.warn('ScrollU: handleNext returned no new items');
      } else {
        if (newItems?.length) setElements(prev => [...prev, ...newItems]);
        // 不要立即清空上下文，只在元素真正改变时清空
      }
    } catch (error) {
      console.error('ScrollU: handleNext error', error);
      // 只在错误时清空上下文，允许重试
      lastNextContext.current = null;
    } finally {
      isLoadingNext.current = false;
    }
  }, [renderMore, isLoadingNext, elements]);

  // 延迟加载函数 - 在滚动结束后重试
  const retryPendingLoads = useCallback(() => {
    const now = Date.now();

    // 检查是否真的需要重试，避免不必要的重复
    if (pendingPreLoad.current && !isLoadingPre.current) {
      const first = elements[0];
      // 只有当前元素与上次请求的上下文不同时才重试，并且时间间隔足够
      if (first && (!lastPreContext.current || lastPreContext.current.key !== first.key ||
        now - lastPreTime.current >= 800)) {
        pendingPreLoad.current = false;
        console.log('ScrollU: Retrying pending pre load for', first.key);
        handlePre();
      } else {
        console.log('ScrollU: Skipping pre retry - same context or too soon');
        pendingPreLoad.current = false;
      }
    }

    if (pendingNextLoad.current && !isLoadingNext.current) {
      const last = elements[elements.length - 1];
      // 只有当前元素与上次请求的上下文不同时才重试，并且时间间隔足够
      if (last && (!lastNextContext.current || lastNextContext.current.key !== last.key ||
        now - lastNextTime.current >= 800)) {
        pendingNextLoad.current = false;
        console.log('ScrollU: Retrying pending next load for', last.key);
        handleNext();
      } else {
        console.log('ScrollU: Skipping next retry - same context or too soon');
        pendingNextLoad.current = false;
      }
    }
  }, [elements, handlePre, handleNext]);

  // 节流版本的handlePre - 防止频繁触发但不会卡住
  const throttledHandlePre = useCallback(() => {
    const now = Date.now();
    // 如果正在加载，直接返回
    if (isLoadingPre.current) return;

    // 计算滚动速度（更精确）
    const timeDelta = now - lastScrollTimestamp.current;
    const currentScrollSpeed = Math.abs(scrollSpeed.current || 0);
    scrollVelocity.current = timeDelta > 0 ? currentScrollSpeed / timeDelta : 0;

    // 更细粒度的滚动速度判断
    const isVeryFastScrolling = currentScrollSpeed > 300;
    const isFastScrolling = currentScrollSpeed > 150;
    const isMediumScrolling = currentScrollSpeed > 50;

    // 如果滚动速度很快，标记为待加载，不直接跳过
    if (isVeryFastScrolling) {
      console.log('ScrollU: Deferring handlePre due to very fast scrolling', currentScrollSpeed);
      pendingPreLoad.current = true;
      // 设置延迟重试，速度越快延迟越长
      if (retryLoadTimer.current) clearTimeout(retryLoadTimer.current);
      retryLoadTimer.current = window.setTimeout(() => {
        retryPendingLoads();
      }, 500); // 500ms后重试
      return;
    }

    // 根据滚动速度调整节流时间 - 更精细的控制
    let throttleTime = 50; // 默认值
    if (isVeryFastScrolling) {
      throttleTime = 300;
    } else if (isFastScrolling) {
      throttleTime = 200;
    } else if (isMediumScrolling) {
      throttleTime = 100;
    }

    // 如果距离上次触发少于节流时间，使用定时器延迟执行
    if (now - lastPreTrigger.current < throttleTime) {
      if (preThrottleTimer.current) clearTimeout(preThrottleTimer.current);
      preThrottleTimer.current = window.setTimeout(() => {
        lastPreTrigger.current = Date.now();
        handlePre();
      }, throttleTime);
    } else {
      // 立即执行
      lastPreTrigger.current = now;
      handlePre();
    }
  }, [handlePre, retryPendingLoads]);

  // 节流版本的handleNext - 防止频繁触发但不会卡住
  const throttledHandleNext = useCallback(() => {
    const now = Date.now();
    // 如果正在加载，直接返回
    if (isLoadingNext.current) return;

    // 计算滚动速度（更精确）
    const timeDelta = now - lastScrollTimestamp.current;
    const currentScrollSpeed = Math.abs(scrollSpeed.current || 0);
    scrollVelocity.current = timeDelta > 0 ? currentScrollSpeed / timeDelta : 0;

    // 更细粒度的滚动速度判断
    const isVeryFastScrolling = currentScrollSpeed > 300;
    const isFastScrolling = currentScrollSpeed > 150;
    const isMediumScrolling = currentScrollSpeed > 50;

    // 如果滚动速度很快，标记为待加载，不直接跳过
    if (isVeryFastScrolling) {
      console.log('ScrollU: Deferring handleNext due to very fast scrolling', currentScrollSpeed);
      pendingNextLoad.current = true;
      // 设置延迟重试，速度越快延迟越长
      if (retryLoadTimer.current) clearTimeout(retryLoadTimer.current);
      retryLoadTimer.current = window.setTimeout(() => {
        retryPendingLoads();
      }, 500); // 500ms后重试
      return;
    }

    // 根据滚动速度调整节流时间 - 更精细的控制
    let throttleTime = 50; // 默认值
    if (isVeryFastScrolling) {
      throttleTime = 300;
    } else if (isFastScrolling) {
      throttleTime = 200;
    } else if (isMediumScrolling) {
      throttleTime = 100;
    }

    // 如果距离上次触发少于节流时间，使用定时器延迟执行
    if (now - lastNextTrigger.current < throttleTime) {
      if (nextThrottleTimer.current) clearTimeout(nextThrottleTimer.current);
      nextThrottleTimer.current = window.setTimeout(() => {
        lastNextTrigger.current = Date.now();
        handleNext();
      }, throttleTime);
    } else {
      // 立即执行
      lastNextTrigger.current = now;
      handleNext();
    }
  }, [handleNext, retryPendingLoads]);

  /* ----------  CLEAN-UP (TOP / BOTTOM)  ---------- */
  const cleanItemsFromBottom = useCallback(() => {
    // 只在滚动结束后进行清理
    if (isScrolling.current) {
      console.log('ScrollU: cleanItemsFromBottom skipped - still scrolling');
      return;
    }
    
    const container = containerRef.current;
    const nodes = Array.from(contentRef.current?.children ?? []);
    if (!container || !nodes.length) return;

    const containerBottom = container.getBoundingClientRect().bottom;
    let removeIndex = -1;

    for (let i = nodes.length - 1; i >= 0; i--) {
      const nodeRect = (nodes[i] as HTMLElement).getBoundingClientRect();
      if (nodeRect.top > containerBottom) removeIndex = i;
      else break;
    }

    if (removeIndex !== -1 && removeIndex < nodes.length - 1) {
      setElements(prev => prev.slice(0, removeIndex + 1));
      console.log('ScrollU: cleanItemsFromBottom removing', nodes.length - removeIndex - 1, 'items', 'container.scrollTop', container.scrollTop);
    }
  }, []);

  const cleanItemsFromTop = useCallback(() => {
    // 只在滚动结束后进行清理
    if (isScrolling.current) {
      console.log('ScrollU: cleanItemsFromTop skipped - still scrolling');
      return;
    }
    
    console.log('ScrollU: cleanItemsFromTop called');
    const container = containerRef.current;
    const nodes = Array.from(contentRef.current?.children ?? []);
    if (!container || !nodes.length) {
      console.log('ScrollU: cleanItemsFromTop early return - no container or nodes');
      return;
    }

    const containerTop = container.getBoundingClientRect().top;
    let removeIndex = -1;

    console.log('ScrollU: cleanItemsFromTop checking', nodes.length, 'nodes, containerTop:', containerTop);

    for (let i = 0; i < nodes.length; i++) {
      const nodeRect = (nodes[i] as HTMLElement).getBoundingClientRect();
      if (nodeRect.bottom < containerTop) {
        removeIndex = i;
      } else {
        break;
      }
    }

    if (removeIndex > 3) {
      removeIndex -= 3; // 保留前3个元素

      // 记录清理前的总高度
      const oldHeight = contentRef.current?.scrollHeight ?? 0;
      pendingTopCleanAdjust.current = { oldHeight: oldHeight, oldScrollTop: container.scrollTop };

      console.log('ScrollU: cleanItemsFromTop removing', removeIndex, 'items', 'oldHeight', oldHeight, 'container.scrollTop', container.scrollTop);
      setElements(prev => prev.slice(removeIndex));
    } else {
      console.log('ScrollU: cleanItemsFromTop no items to remove, removeIndex:', removeIndex);
    }
  }, []);

  /* ----------  SCROLLBAR  ---------- */
  const updateScrollBar = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const containerHeight = container.clientHeight;
    const contentHeight = content.scrollHeight;
    const scrollTop = container.scrollTop;

    const scrollBarHeight = Math.min(
      containerHeight,
      (containerHeight / contentHeight) * containerHeight
    );
    const scrollBarTop = (scrollTop / contentHeight) * containerHeight;

    setScroll({ height: scrollBarHeight, top: scrollBarTop });
  }, []);


  // 初始化滚动条

  const scrollSpeed = useRef(0);
  const lastScrollTop = useRef(0);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    const now = Date.now();
    const container = containerRef.current;
    if (!container) return;

    const currentScrollTop = container.scrollTop;
    const scrollDiff = currentScrollTop - lastScrollTop.current;
    const timeDelta = now - lastScrollTime.current;

    // 更精确的滚动状态跟踪
    isScrolling.current = true;
    lastScrollTime.current = now;
    lastScrollTimestamp.current = now;
    lastScrollTop.current = currentScrollTop;
    scrollSpeed.current = scrollDiff;

    // 计算滚动速度（像素/毫秒）
    const currentScrollVelocity = timeDelta > 0 ? Math.abs(scrollDiff) / timeDelta : 0;
    scrollVelocity.current = currentScrollVelocity;

    // 检测滚动结束 - 根据滚动速度动态调整检测时间
    const scrollEndDelay = currentScrollVelocity > 0.5 ? 150 : 100; // 快速滚动时延长检测时间

    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = window.setTimeout(() => {
      isScrolling.current = false;
      // 滚动结束后，重试待加载的请求
      retryPendingLoads();
      
      // 滚动结束后才进行清理，避免滚动时的性能问题和状态混乱
      console.log('ScrollU: Scroll ended, starting cleanup');
      
      // 清理底部元素
      setTimeout(() => {
        console.log('ScrollU: Bottom cleanup timer fired');
        cleanItemsFromBottom();
      }, 500); // 短暂延迟确保滚动完全结束
      
      // 清理顶部元素
      setTimeout(() => {
        console.log('ScrollU: Top cleanup timer fired');
        cleanItemsFromTop();
      }, 1000); // 稍长延迟确保底部清理完成
    }, scrollEndDelay);

    // 使用 RAF 节流滚动条更新 - 只在需要时更新
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      updateScrollBar();
    });

    // console.log('ScrollU: handleScroll currentScrollTop', currentScrollTop, 'scrollDiff', scrollDiff, 'velocity', currentScrollVelocity);

    // 滚动过程中不进行任何清理操作，避免性能问题和状态混乱
    // 所有清理操作都在滚动结束后进行
  }, [updateScrollBar, cleanItemsFromBottom, cleanItemsFromTop, retryPendingLoads]);

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      // 清理所有定时器和 RAF
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
      if (retryLoadTimer.current) clearTimeout(retryLoadTimer.current);
      if (preThrottleTimer.current) clearTimeout(preThrottleTimer.current);
      if (nextThrottleTimer.current) clearTimeout(nextThrottleTimer.current);
    };
  }, [handleScroll]);

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      // 清理所有定时器
      if (rafId.current) cancelAnimationFrame(rafId.current);
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
      if (retryLoadTimer.current) clearTimeout(retryLoadTimer.current);
      if (preThrottleTimer.current) clearTimeout(preThrottleTimer.current);
      if (nextThrottleTimer.current) clearTimeout(nextThrottleTimer.current);

      // 清理 IntersectionObserver
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }
    };
  }, []);

  // 初始化和元素变化时更新滚动条
  useEffect(() => {
    updateScrollBar();
  }, [elements, updateScrollBar]);

  /* ----------  SCROLL POSITION ADJUSTMENTS  ---------- */
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 处理顶部添加新元素后的滚动位置调整
    if (pendingPreAdjust.current) {
      const { oldHeight, oldScrollTop } = pendingPreAdjust.current;
      const newHeight = contentRef.current?.scrollHeight || 0;
      const heightDelta = newHeight - oldHeight;

      // 获取当前滚动速度
      const currentScrollSpeed = Math.abs(scrollSpeed.current);

      // 根据滚动状态使用不同的调整策略
      if (currentScrollSpeed > 150) {
        // 极高速滚动：使用简单的高度补偿，避免复杂计算
        container.scrollTop = oldScrollTop + heightDelta;
        console.log('ScrollU: High speed adjustment, simple height compensation');
      } else if (currentScrollSpeed > 50 || isScrolling.current) {
        // 中等速度滚动：使用保守的调整策略
        // 限制scrollSpeed的影响，避免过度调整
        const speedCompensation = Math.min(Math.abs(scrollSpeed.current), 30) * Math.sign(scrollSpeed.current);
        container.scrollTop = oldScrollTop + heightDelta + speedCompensation;
        console.log('ScrollU: Medium speed adjustment with compensation');
      } else {
        // 慢速滚动或静止：使用精确调整
        const scrollDelta = container.scrollTop - oldScrollTop;
        const delta = Math.max(0, heightDelta - scrollDelta);
        container.scrollTop += delta + Math.min(scrollSpeed.current, 20);
        console.log('ScrollU: Precise adjustment for slow/static scroll', { delta, scrollDelta, heightDelta });
      }

      pendingPreAdjust.current = null;
      isLoadingPre.current = false;
      return;
    }

    // 处理顶部清理后的滚动位置调整
    if (pendingTopCleanAdjust.current) {
      const { oldHeight, oldScrollTop } = pendingTopCleanAdjust.current;
      const newHeight = contentRef.current?.scrollHeight || 0;
      const deltaHeight = oldHeight - newHeight;
      const currentScrollSpeed = Math.abs(scrollSpeed.current);

      // 快速滚动时跳过清理后的位置调整，避免干扰
      if (currentScrollSpeed < 100 && !isScrolling.current) {
        const deltaScrollTop = oldScrollTop - container.scrollTop;
        const delta = Math.max(0, deltaHeight - deltaScrollTop);
        if (delta > 0) {
          container.scrollTop -= delta;
        }
      } else {
        console.log('ScrollU: Skipping top clean adjustment due to fast scrolling');
      }

      pendingTopCleanAdjust.current = null;
    }
  }, [elements]);

  /* ----------  INTERSECTION OBSERVER  ---------- */
  const _firstNode = useRef<HTMLDivElement | null>(null);
  const _lastNode = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // 添加额外的检查，确保元素仍然有效
            if (entry.target === _firstNode.current && _firstNode.current) {
              console.log('ScrollU: IntersectionObserver triggered for first node');
              throttledHandlePre();
            } else if (entry.target === _lastNode.current && _lastNode.current) {
              console.log('ScrollU: IntersectionObserver triggered for last node');
              throttledHandleNext();
            }
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: '100px', // 增加 rootMargin 以提前触发
        threshold: [0, 0.1], // 使用多个阈值以提高检测精度
        // 在支持的浏览器中启用更好的性能
        ...(typeof window !== 'undefined' && 'IntersectionObserver' in window && {
          // Safari 特殊优化
          trackVisibility: false,
          delay: 0
        })
      }
    );
    intersectionObserver.current = io;
    return () => {
      io.disconnect();
      // 清理定时器
      if (preThrottleTimer.current) clearTimeout(preThrottleTimer.current);
      if (nextThrottleTimer.current) clearTimeout(nextThrottleTimer.current);
      if (retryLoadTimer.current) clearTimeout(retryLoadTimer.current);
    };
  }, [throttledHandlePre, throttledHandleNext]);

  function safeObserve(
    io: IntersectionObserver | null,
    oldEl: Element | null,
    newEl: Element | null
  ) {
    if (!io) return;
    if (oldEl && oldEl !== newEl) io.unobserve(oldEl);
    if (newEl && newEl !== oldEl) io.observe(newEl);
  }

  const handleFirstRef = (node: HTMLDivElement | null) => {
    safeObserve(intersectionObserver.current, _firstNode.current, node);
    _firstNode.current = node;
  };

  const handleLastRef = (node: HTMLDivElement | null) => {
    safeObserve(intersectionObserver.current, _lastNode.current, node);
    _lastNode.current = node;
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: '100%',
        overflow: 'auto',
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        ref={contentRef}
        style={{
          paddingRight: showScrollBar ? scrollbarGutter : 0,
        }}
      >
        {elements.map((item, idx) => {
          const isFirst = idx === 0;
          const isLast = idx === elements.length - 1;
          const targetRef = isFirst ? handleFirstRef : isLast ? handleLastRef : undefined;

          return (
            <div key={item.key} ref={targetRef}>
              {item}
            </div>
          );
        })}
      </div>
      {showScrollBar && scrollBarRender(scrollBar.height, scrollBar.top)}
    </div>
  );
});

export { ScrollU };
