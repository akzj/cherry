'use client'
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useImperativeHandle, forwardRef } from 'react';
import { DefaultScrollBar } from './scroll-bar';

export type ReactNodes = React.ReactNode[];
export type UpdateNodeHandle = (items: ReactNodes) => ReactNodes;

export interface ScrollURef {
  updateNodes: (handle: UpdateNodeHandle) => void;
  listNodes: () => ReactNodes;
  trigerRender: (direction: 'pre' | 'next') => void;
}

export interface ScrollUProps {
  className?: any;
  renderItem?: (direction: 'pre' | 'next', contextData?: React.ReactNode) => Promise<ReactNodes>;
  initialItems?: ReactNodes;
  showScrollBar?: boolean;
  scrollBarRender?: (height: number, top: number) => React.ReactNode;
}

const ScrollU = forwardRef<ScrollURef, ScrollUProps>((props, ref) => {
  const { className,
    renderItem,
    initialItems = [],
    showScrollBar = true,
    scrollBarRender = (height: number, top: number) => (
      <DefaultScrollBar height={height} top={top} />
    )
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [translateY, setTranslateY] = useState<number>(0);
  const [scrollBar, setScroll] = useState<{ height: number, top: number }>({ height: 0, top: 0 });
  const clearButtonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTopItemTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [items, setItems] = useState<ReactNodes>(initialItems);
  const [isLoadingPre, setIsLoadingPre] = useState(false);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const lastPreMsgId = useRef<number | null>(null);
  const lastNextMsgId = useRef<number | null>(null);
  const firstItemRef = useRef<HTMLDivElement>(null);
  const lastItemRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const [pendingPreAdjust, setPendingPreAdjust] = useState<false | { oldHeight: number, currentTranslateY: number }>(false);

  const handlePre = useCallback(async () => {
    if (isLoadingPre || !renderItem) return;
    const first = items.length > 0 ? items[0] : undefined;
    if (first && React.isValidElement(first)) {
      const currentMsgId = (first as any).props?.msgId;
      if (typeof currentMsgId === 'number' && lastPreMsgId.current === currentMsgId) {
        console.log('handlePre - Skipping duplicate request for msgId:', currentMsgId);
        return;
      }
      lastPreMsgId.current = currentMsgId;
    }

    setIsLoadingPre(true);
    try {
      const newItems = await renderItem('pre', first);
      if (!newItems || newItems.length === 0) {
        return;
      }
      const currentTranslateY = translateY;
      const oldHeight = contentRef.current ? contentRef.current.offsetHeight : 0;
      setPendingPreAdjust({ oldHeight, currentTranslateY });

      setItems(prev => [...newItems, ...prev]);
    } finally {
      setIsLoadingPre(false);
      lastPreMsgId.current = null;
    }
  }, [isLoadingPre, renderItem, items, translateY]);



  useImperativeHandle(ref, () => ({
    updateNodes: (handler: UpdateNodeHandle) => {
      setItems(nextItems => {

        // need to update offset when item change.
        const currentTranslateY = translateY;
        const oldHeight = contentRef.current ? contentRef.current.offsetHeight : 0;
        setPendingPreAdjust({ oldHeight, currentTranslateY });

        return handler(nextItems)
      });
    },
    listNodes: () => {
      return items
    },
    trigerRender: (direction: 'pre' | 'next') => {
      if (direction === 'pre') {
        handlePre();
      } else {
        handleNext();
      }
    }
  }));


  const handleNext = useCallback(async () => {
    if (isLoadingNext || !renderItem) return;

    const last = items.length > 0 ? items[items.length - 1] : undefined;
    if (last && React.isValidElement(last)) {
      const currentMsgId = (last as any).props?.msgId;
      if (typeof currentMsgId === 'number' && lastNextMsgId.current === currentMsgId) {
        console.log('handleNext - Skipping duplicate request for msgId:', currentMsgId);
        return;
      }
      lastNextMsgId.current = currentMsgId;
    }

    try {
      setIsLoadingNext(true);
      const newItems = await renderItem('next', last);
      if (!newItems || newItems.length == 0) {
        return
      }
      setItems(prev => [...prev, ...newItems]);
    } finally {
      setIsLoadingNext(false);
      lastNextMsgId.current = null; // reset
    }
  }, [isLoadingNext, renderItem, items]);

  const setupIntersectionObserver = useCallback(() => {
    if (intersectionObserver.current) {
      intersectionObserver.current.disconnect();
    }

    intersectionObserver.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target === firstItemRef.current) {
              handlePre();
            }
            else if (entry.target === lastItemRef.current) {
              handleNext();
            }
          }
        });
      },
      {
        root: containerRef.current,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    if (firstItemRef.current) {
      intersectionObserver.current.observe(firstItemRef.current);
    } else {
      console.log('First item ref is null');
    }

    if (lastItemRef.current) {
      intersectionObserver.current.observe(lastItemRef.current);
    } else {
      console.log('Last item ref is null');
    }
  }, [items.length]);


  const cleanItemsFromButton = useCallback(() => {
    let removeIndex = -1;
    const container = containerRef.current;
    const nodes = contentRef.current?.children;

    if (container && nodes) {
      const containerRect = container.getBoundingClientRect();

      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i] as HTMLElement;
        if (!node) continue;

        const itemRect = node.getBoundingClientRect();
        if (itemRect.top > containerRect.bottom) {
          removeIndex = i;
        } else {
          break;
        }
      }
      if (removeIndex !== -1 && removeIndex < nodes?.length - 1) {
        console.log('cleanItemsFromButton removeIndex:', removeIndex, 'items length:', items.length);
        removeIndex += 1; // prevent reload from button 
        setItems(prev => prev.slice(0, removeIndex));
      }
    }
  }, [containerRef, contentRef]);

  const cleanItemsFromTop = useCallback(() => {
    let removeIndex = -1;
    const container = containerRef.current;
    const nodes = contentRef.current?.children;

    if (container && nodes) {
      const containerRect = container.getBoundingClientRect();

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i] as HTMLElement;
        if (!node) continue;

        const itemRect = node.getBoundingClientRect();
        if (itemRect.bottom < containerRect.top) {
          removeIndex = i;
        } else {
          break;
        }
      }
    }
    if (removeIndex !== -1 && removeIndex > 0) {
      removeIndex -= 1; // prevent reload from top
      console.log('cleanItemsFromTop removeIndex:', removeIndex, 'items length:', items.length);
      // 记录当前的translateY和content高度，便于后续调整
      const currentTranslateY = translateY;
      const oldHeight = contentRef.current ? contentRef.current.offsetHeight : 0;
      setPendingPreAdjust({ oldHeight, currentTranslateY });
      setItems(prev => prev.slice(removeIndex,));
    }
  }, [containerRef, contentRef]);



  const startInertia = (initialVelocity: number) => {
    let velocity = initialVelocity;

    const animate = () => {
      if (Math.abs(velocity) < 0.1) {
        return;
      }

      setTranslateY(prev => {
        const next = prev - velocity;
        const max = containerRef.current!.offsetHeight * 2 / 3;
        const min = containerRef.current!.offsetHeight * 2 / 3 - contentRef.current!.offsetHeight;
        const newTranslateY = Math.max(min, Math.min(max, next));
        return newTranslateY;
      });

      velocity *= 0.35;
      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (contentRef.current && containerRef.current) {
      const containerHeight = containerRef.current.offsetHeight;
      const contentHeight = contentRef.current.offsetHeight;
      const topHiddenHeight = Math.max(0, -translateY);
      const scrollBarHeight = (containerHeight / contentHeight) * containerHeight;
      const scrollBarTop = (topHiddenHeight / contentHeight) * containerHeight;

      setScroll({
        height: scrollBarHeight,
        top: scrollBarTop,
      });
    }
  }, [translateY, items]);

  const handleScroll = useCallback((event: WheelEvent) => {
    event.preventDefault();
    if (clearButtonTimer.current) {
      clearTimeout(clearButtonTimer.current);
    }
    clearButtonTimer.current = setTimeout(cleanItemsFromButton, 300);

    if (clearTopItemTimer.current) {
      clearTimeout(clearTopItemTimer.current);
    }
    clearTopItemTimer.current = setTimeout(cleanItemsFromTop, 500);

    const deltaY = event.deltaY;
    startInertia(deltaY);
  }, []
  );


  useEffect(() => {
    const container = containerRef.current;

    if (container) {
      container.addEventListener('wheel', handleScroll, { passive: false });

      return () => {
        container.removeEventListener('wheel', handleScroll);
        if (clearButtonTimer.current) {
          clearTimeout(clearButtonTimer.current);
        }
      };
    }
  }, [handleScroll]);

  useEffect(() => {
    setupIntersectionObserver();
    return () => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }
    };
  }, [items.length]);

  useLayoutEffect(() => {
    if (pendingPreAdjust && contentRef.current) {
      const newHeight = contentRef.current.offsetHeight;

      const heightDiff = newHeight - pendingPreAdjust.oldHeight;
      console.log('Pending pre-adjust height diff:',
        'newHeight:', newHeight,
        'oldHeight:', pendingPreAdjust.oldHeight,
        'heightDiff:', heightDiff,
        'currentTranslateY:', pendingPreAdjust.currentTranslateY);
      if (heightDiff !== 0) {
        setTranslateY(prevTranslateY => {
          console.log('Adjusting translateY from:', prevTranslateY, 'by height diff:', heightDiff);
          return prevTranslateY - heightDiff;
        });

        setTimeout(() => {
          console.log('Final content:', translateY);
        }, 100); // 等待DOM更新
      }
      setPendingPreAdjust(false);
    }
  }, [items, pendingPreAdjust]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: '100%', // 或 100%，由父容器控制
        overflow: 'hidden', // 关键
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
          paddingRight: showScrollBar ? 20 : 0,
        }}
      >
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          if (isFirst || isLast) {
            return (
              <div key={index} ref={isFirst ? firstItemRef : lastItemRef}>
                {item}
              </div>
            );
          }
          return <div key={index}>{item}</div>;
        })}
      </div>
      {showScrollBar && (scrollBarRender(scrollBar.height, scrollBar.top))}
    </div>
  );
});

export { ScrollU };
