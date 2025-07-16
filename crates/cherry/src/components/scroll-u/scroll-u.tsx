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
    isLoadingPre.current = true;

    console.log('ScrollU: handlePre fetching more items', first);

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
      }
    } finally {
    }
  }, [renderMore, isLoadingPre, elements]);

  // 节流版本的handlePre - 防止频繁触发但不会卡住
  const throttledHandlePre = useCallback(() => {
    const now = Date.now();
    // 如果正在加载，直接返回
    if (isLoadingPre.current) return;
    
    // 检查滚动状态，快速滚动时延长节流时间
    const currentScrollSpeed = Math.abs(scrollSpeed.current || 0);
    const throttleTime = currentScrollSpeed > 100 ? 300 : 100; // 高速滚动时使用更长的节流时间
    
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
  }, [handlePre]);

  const handleNext = useCallback(async () => {
    if (!renderMore || isLoadingNext.current) return;

    const last = elements[elements.length - 1];
    if (!last) return;
    isLoadingNext.current = true;
    try {
      const newItems = await renderMore('next', last);
      if (!newItems?.length) {
        console.warn('ScrollU: handleNext returned no new items');
      } else {
        if (newItems?.length) setElements(prev => [...prev, ...newItems]);
      }
    } finally {
      isLoadingNext.current = false;
    }
  }, [renderMore, isLoadingNext, elements]);

  // 节流版本的handleNext - 防止频繁触发但不会卡住
  const throttledHandleNext = useCallback(() => {
    const now = Date.now();
    // 如果正在加载，直接返回
    if (isLoadingNext.current) return;
    
    // 检查滚动状态，快速滚动时延长节流时间
    const currentScrollSpeed = Math.abs(scrollSpeed.current || 0);
    const throttleTime = currentScrollSpeed > 100 ? 300 : 100; // 高速滚动时使用更长的节流时间
    
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
  }, [handleNext]);

  /* ----------  CLEAN-UP (TOP / BOTTOM)  ---------- */
  const cleanItemsFromBottom = useCallback(() => {
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
      //console.log('ScrollU: cleanItemsFromBottom removing', nodes.length - removeIndex - 1, 'items', 'container.scrollTop', container.scrollTop);
    }
  }, []);

  const cleanItemsFromTop = useCallback(() => {
    const container = containerRef.current;
    const nodes = Array.from(contentRef.current?.children ?? []);
    if (!container || !nodes.length) return;

    const containerTop = container.getBoundingClientRect().top;
    let removeIndex = -1;

    for (let i = 0; i < nodes.length; i++) {
      const nodeRect = (nodes[i] as HTMLElement).getBoundingClientRect();
      if (nodeRect.bottom < containerTop) removeIndex = i;
      else break;
    }

    if (removeIndex > 3) {
      removeIndex -= 3; // 保留前3个元素

      // 记录清理前的总高度
      const oldHeight = contentRef.current?.scrollHeight ?? 0;
      pendingTopCleanAdjust.current = { oldHeight: oldHeight, oldScrollTop: container.scrollTop };

      console.log('ScrollU: cleanItemsFromTop removing', removeIndex, 'items', 'oldHeight', oldHeight, 'container.scrollTop', container.scrollTop);
      setElements(prev => prev.slice(removeIndex));
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
    isScrolling.current = true;
    lastScrollTime.current = now;
    
    // 检测滚动结束
    if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    scrollEndTimer.current = window.setTimeout(() => {
      isScrolling.current = false;
    }, 150); // 150ms没有滚动事件就认为滚动结束
    
    // 使用 RAF 节流滚动条更新
    if (rafId.current) cancelAnimationFrame(rafId.current);
    rafId.current = requestAnimationFrame(() => {
      updateScrollBar();
    });
    
    const container = containerRef.current;
    if (!container) return;
    const currentScrollTop = container.scrollTop;
    const scrollDiff = currentScrollTop - lastScrollTop.current;
    lastScrollTop.current = currentScrollTop;
    scrollSpeed.current = scrollDiff;

    // console.log('ScrollU: handleScroll currentScrollTop', currentScrollTop, 'scrollDiff', scrollDiff);

    // 防抖清理
    clearTimeout(cleanTimers.current.bottom);
    clearTimeout(cleanTimers.current.top);
    cleanTimers.current.bottom = setTimeout(cleanItemsFromBottom, 2000);
    cleanTimers.current.top = setTimeout(cleanItemsFromTop, 3500);
  }, [updateScrollBar, cleanItemsFromBottom, cleanItemsFromTop]);

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
    };
  }, [handleScroll]);

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
      
      // 如果正在快速滚动，使用更保守的调整策略
      if (isScrolling.current || Math.abs(scrollSpeed.current) > 50) {
        // 快速滚动时只做基本的高度调整，不添加scrollSpeed补偿
        container.scrollTop = oldScrollTop + heightDelta;
      } else {
        // 慢速滚动时使用原来的精确调整
        const scrollDelta = container.scrollTop - oldScrollTop;
        const delta = Math.max(0, heightDelta - scrollDelta);
        container.scrollTop += delta + Math.min(scrollSpeed.current, 50); // 限制scrollSpeed的影响
      }
      
      pendingPreAdjust.current = null;
      //console.log('ScrollU: pendingPreAdjust Adjusting oldHeight', oldHeight, 'newHeight', newHeight, 'heightDelta', heightDelta, ' scrollDelta', scrollDelta, 'container.scrollTop', container.scrollTop, 'delta', delta);
      //console.log('ScrollU: pendingPreAdjust Adjusted scrollTop by', oldScrollTop, 'new scrollTop', container.scrollTop);
      isLoadingPre.current = false;
      return;
    }

    // 处理顶部清理后的滚动位置调整
    if (pendingTopCleanAdjust.current) {
      const { oldHeight, oldScrollTop } = pendingTopCleanAdjust.current;
      const newHeight = contentRef.current?.scrollHeight || 0;
      const deltaHeight = oldHeight - newHeight;
      
      // 如果正在快速滚动，跳过清理后的位置调整
      if (!isScrolling.current && Math.abs(scrollSpeed.current) < 50) {
        const deltaScrollTop = oldScrollTop - container.scrollTop;
        //console.log('ScrollU:  pendingTopCleanAdjust Adjusting oldHeight', oldHeight, 'newHeight', newHeight,'deltaHeight', deltaHeight, 'deltaScroll', deltaScrollTop, ' container.scrollTop', container.scrollTop);

        const delta = Math.max(0, deltaHeight - deltaScrollTop);
        if (delta > 0) {
          //console.log('ScrollU: pendingTopCleanAdjust Adjusting scrollTop by', delta);
          container.scrollTop -= delta;
        } else {
          //console.log('ScrollU: pendingTopCleanAdjust No adjustment needed, delta is negative or zero');
        }
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
            if (entry.target === _firstNode.current) throttledHandlePre();
            else if (entry.target === _lastNode.current) throttledHandleNext();
          }
        });
      },
      { root: containerRef.current, rootMargin: '50px', threshold: 0.1 }
    );
    intersectionObserver.current = io;
    return () => {
      io.disconnect();
      // 清理定时器
      if (preThrottleTimer.current) clearTimeout(preThrottleTimer.current);
      if (nextThrottleTimer.current) clearTimeout(nextThrottleTimer.current);
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

  const cleanTimers = useRef<{ top: any, bottom: any }>({ top: 0, bottom: 0 });

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
