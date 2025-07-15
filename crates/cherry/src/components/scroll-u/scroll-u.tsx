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
export type UpdateElementHandle = (items: ElementWithKeyArr) => ElementWithKeyArr;

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

  /* 顶部添加元素后的滚动位置调整 */
  const pendingPreAdjust = useRef<null | { oldHeight: number; oldScrollTop: number }>(null);
  /* 顶部清理元素后的滚动位置调整 */
  const pendingTopCleanAdjust = useRef<null | { oldHeight: number, oldScrollTop: number }>(null);

  /* ----------  IMPERATIVE HANDLE  ---------- */
  useImperativeHandle(ref, () => ({
    updateElements: (handler: UpdateElementHandle) => {
      const container = containerRef.current;
      if (!container) return;

      const oldHeight = contentRef.current?.scrollHeight ?? 0;
      const oldScrollTop = container.scrollTop;

      pendingPreAdjust.current = { oldHeight, oldScrollTop };
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
      } else {
        console.log('ScrollU: handlePre new items', newItems);
        const container = containerRef.current;
        if (!container) return;

        pendingPreAdjust.current = {
          oldHeight: contentRef.current!.scrollHeight,
          oldScrollTop: container.scrollTop,
        };
        setElements(prev => [...newItems, ...prev]);
      }
    } finally {
      isLoadingPre.current = false;
    }
  }, [renderMore, isLoadingPre, elements]);

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
      console.log('ScrollU: cleanItemsFromBottom removing', nodes.length - removeIndex - 1, 'items', 'container.scrollTop', container.scrollTop);
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
    updateScrollBar();
    const container = containerRef.current;
    if (!container) return;
    const currentScrollTop = container.scrollTop;
    const scrollDiff = currentScrollTop - lastScrollTop.current;
    lastScrollTop.current = currentScrollTop;
    scrollSpeed.current = scrollDiff;


    // 防抖清理
    clearTimeout(cleanTimers.current.bottom);

    clearTimeout(cleanTimers.current.top);
    cleanTimers.current.bottom = setTimeout(cleanItemsFromBottom, 3000);
    cleanTimers.current.top = setTimeout(cleanItemsFromTop, 1000);
  }, [updateScrollBar, cleanItemsFromBottom, cleanItemsFromTop]);

  // 监听滚动事件
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
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
      const diff = newHeight - oldHeight;

      container.scrollTop += diff + scrollSpeed.current * 2;
      pendingPreAdjust.current = null;
      console.log('ScrollU: pendingPreAdjust Adjusting oldHeight', oldHeight, 'newHeight', newHeight, 'diff', diff);
      return;
    }

    // 处理顶部清理后的滚动位置调整
    if (pendingTopCleanAdjust.current) {
      const { oldHeight, oldScrollTop } = pendingTopCleanAdjust.current;
      const newHeight = contentRef.current?.scrollHeight || 0;
      const deltaHeight = oldHeight - newHeight;
      const deltaScrollTop = oldScrollTop - container.scrollTop;
      console.log('ScrollU:  pendingTopCleanAdjust Adjusting oldHeight', oldHeight, 'newHeight', newHeight,
        'deltaHeight', deltaHeight, 'deltaScroll', deltaScrollTop, ' container.scrollTop', container.scrollTop);

      const delta = Math.max(0, deltaHeight - deltaScrollTop);
      if (delta > 0) {
        console.log('ScrollU: pendingTopCleanAdjust Adjusting scrollTop by', delta);
        container.scrollTop -= delta;
      } else {
        console.log('ScrollU: pendingTopCleanAdjust No adjustment needed, delta is negative or zero');
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
            if (entry.target === _firstNode.current) handlePre();
            else if (entry.target === _lastNode.current) handleNext();
          }
        });
      },
      { root: containerRef.current, rootMargin: '50px', threshold: 0.1 }
    );
    intersectionObserver.current = io;
    return () => io.disconnect();
  }, [handlePre, handleNext]);

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
