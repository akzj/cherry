'use client';
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  useImperativeHandle,
  forwardRef,
  Ref,
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
  const [translateY, setTranslateY] = useState<number>(0);
  const [scrollBar, setScroll] = useState({ height: 0, top: 0 });

  const rafId = useRef<number | null>(null);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  const [elements, setElements] = useState<ElementWithKeyArr>(initialItems);
  const [isLoadingPre, setIsLoadingPre] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);

  /* pending scroll adjustment after prepend */
  const pendingPreAdjust = useRef<null | { oldHeight: number; oldTranslateY: number }>(null);

  /* ----------  IMPERATIVE HANDLE  ---------- */
  useImperativeHandle(ref, () => ({
    updateElements: (handler: UpdateElementHandle) => {
      const oldHeight = contentRef.current?.offsetHeight ?? 0;
      pendingPreAdjust.current = { oldHeight, oldTranslateY: translateY };

      setElements(prev => handler(prev));
    },
    listNodes: () => elements,
    triggerRender: (direction: 'pre' | 'next') => {
      direction === 'pre' ? handlePre() : handleNext();
    },
  }));

  /* ----------  FETCH HELPERS  ---------- */
  const getElementKey = (node: ElementWithKey): Key => node.key!;

  const handlePre = useCallback(async () => {
    console.log('ScrollU: handlePre called');
    if (!containerRef.current || !contentRef.current) return;
    if (!renderMore || isLoadingPre) return;

    const first = elements[0];
    if (!first) return;
    setIsLoadingPre(true);

    try {
      const newItems = await renderMore('pre', first);
      if (!newItems?.length) {
        console.warn('ScrollU: handlePre returned no new items');
        return;
      }

      pendingPreAdjust.current = {
        oldHeight: contentRef.current!.offsetHeight,
        oldTranslateY: translateY,
      };
      setElements(prev => [...newItems, ...prev]);
    } finally {
      setIsLoadingPre(false);
    }
  }, [renderMore, isLoadingPre, elements, translateY]);

  const handleNext = useCallback(async () => {
    if (!renderMore || isLoadingNext) return;
    const last = elements[elements.length - 1];
    setIsLoadingNext(true);

    try {
      const newItems = await renderMore('next', last);
      if (newItems?.length) setElements(prev => [...prev, ...newItems]);
    } finally {
      setIsLoadingNext(false);
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

    if (removeIndex > 0) {
      pendingPreAdjust.current = {
        oldHeight: contentRef.current!.offsetHeight,
        oldTranslateY: translateY,
      };
      setElements(prev => prev.slice(removeIndex));
    }
  }, [translateY]);

  /* ----------  SCROLLBAR  ---------- */
  useEffect(() => {
    if (!containerRef.current || !contentRef.current) return;

    const containerHeight = containerRef.current.offsetHeight;
    const contentHeight = contentRef.current.offsetHeight;

    const topHidden = Math.max(0, -translateY);
    const scrollBarHeight = Math.min(
      containerHeight,
      (containerHeight / (contentHeight || 1)) * containerHeight
    );
    const scrollBarTop = (topHidden / (contentHeight || 1)) * containerHeight;

    setScroll({ height: scrollBarHeight, top: scrollBarTop });
  }, [translateY, elements]);

  /* ----------  INERTIA SCROLL  ---------- */
  const startInertia = useCallback((initialVelocity: number) => {
    if (rafId.current) cancelAnimationFrame(rafId.current);

    let velocity = initialVelocity;
    const animate = () => {
      if (Math.abs(velocity) < 0.1) return;

      setTranslateY(prev => {
        const next = prev - velocity;
        const max = (containerRef.current?.offsetHeight ?? 0) * 2 / 3;
        const min = max - (contentRef.current?.offsetHeight ?? 0);
        return Math.max(min, Math.min(max, next));
      });

      velocity *= 0.95;
      rafId.current = requestAnimationFrame(animate);
    };
    rafId.current = requestAnimationFrame(animate);
  }, []);

  /* ----------  WHEEL LISTENER  ---------- */
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      startInertia(e.deltaY);

      // debounced cleanup
      clearTimeout((cleanTimers.current as any).bottom);
      clearTimeout((cleanTimers.current as any).top);
      (cleanTimers.current as any).bottom = setTimeout(cleanItemsFromBottom, 300);
      (cleanTimers.current as any).top = setTimeout(cleanItemsFromTop, 500);
    },
    [startInertia, cleanItemsFromBottom, cleanItemsFromTop]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleWheel]);

  /* ----------  PREPEND SCROLL ADJUSTMENT  ---------- */
  useLayoutEffect(() => {
    if (pendingPreAdjust.current && contentRef.current) {
      const { oldHeight, oldTranslateY } = pendingPreAdjust.current;
      const newHeight = contentRef.current.offsetHeight;
      const diff = newHeight - oldHeight;

      if (diff !== 0) setTranslateY(oldTranslateY - diff);
      pendingPreAdjust.current = null;
    }
  }, [elements]);


  /* 1. 内部私有 ref，给 observer 用 */
  const _firstNode = useRef<HTMLDivElement | null>(null);
  const _lastNode = useRef<HTMLDivElement | null>(null);

  /* 2. observer 里用私有 ref 判断 */
  useEffect(() => {
    const io = new IntersectionObserver(
      entries =>
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            if (entry.target === _firstNode.current) handlePre();
            else if (entry.target === _lastNode.current) handleNext();
          }
        }),
      { root: containerRef.current, rootMargin: '50px', threshold: 0.1 }
    );
    intersectionObserver.current = io;
    return () => io.disconnect();
  }, [handlePre, handleNext]);



  /* 工具：安全 observe / unobserve */
  function safeObserve(
    io: IntersectionObserver | null,
    oldEl: Element | null,
    newEl: Element | null
  ) {
    if (!io) return;
    if (oldEl && oldEl !== newEl) io.unobserve(oldEl);
    if (newEl && newEl !== oldEl) io.observe(newEl);
  }

  /* 渲染时闭包缓存当前 observer */
  const handleFirstRef = (node: HTMLDivElement | null) => {
    safeObserve(intersectionObserver.current, _firstNode.current, node);
    _firstNode.current = node;
  };

  const handleLastRef = (node: HTMLDivElement | null) => {
    safeObserve(intersectionObserver.current, _lastNode.current, node);
    _lastNode.current = node;
  };


  const cleanTimers = useRef({ top: 0, bottom: 0 });

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: '100%',
        overflow: 'hidden',
        position: 'relative',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        ref={contentRef}
        style={{
          transform: `translateY(${translateY}px)`,
          willChange: 'transform',
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