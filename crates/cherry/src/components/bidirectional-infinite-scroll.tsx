'use client';

import { throttle } from 'lodash';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import useInfiniteScroll, {
  UseInfiniteScrollHookRefCallback,
} from 'react-infinite-scroll-hook';



import { DataItem, ItemKeyType } from '../hooks/use-bidirectional-data';
import { styled } from 'styled-components';
export type { UseInfiniteScrollHookRefCallback } from 'react-infinite-scroll-hook';

const Container = styled.div`
  flex: 1;
  border: 1px solid red;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-height: 0; /* 重要：允许在flex容器中正确收缩 */
  height: 100%;
  
  /* 确保消息容器正确布局 */
  > div {
    flex-shrink: 0; /* 防止消息被压缩 */
  }
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
    
    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
  
  /* 高亮动画效果 */
  .highlight {
    animation: highlightPulse 2s ease-in-out;
  }
  
  @keyframes highlightPulse {
    0% {
      background-color: rgba(99, 102, 241, 0.2);
      transform: scale(1);
    }
    50% {
      background-color: rgba(99, 102, 241, 0.3);
      transform: scale(1.02);
    }
    100% {
      background-color: transparent;
      transform: scale(1);
    }
  }
`;

// 定义可扩展参数类型
export interface LoadItemsParams {
  forward?: { key: ItemKeyType };
  backward?: { key: ItemKeyType };
  [key: string]: any;
}

export interface BidirectionalInfiniteScrollProps<T = {}> {
  // 数据相关
  items: DataItem<T>[];
  loading: boolean;
  hasNextPage: boolean;
  error?: Error;

  // 回调函数
  onLoadMore: (params: LoadItemsParams) => void;
  onTrimItems?: (direction: 'forward' | 'backward', count: number) => void;

  // 配置选项
  trimThreshold?: number; // 删除阈值
  scrollThresholdUp?: number; // 向上滚动阈值
  scrollThresholdDown?: number; // 向下滚动阈值
  bottomThreshold?: number; // 底部加载阈值
  maxHeight?: string; // 最大高度
  maxWidth?: string; // 最大宽度

  // 渲染函数
  renderItem: (item: DataItem<T>) => React.ReactNode;

  // 加载中渲染函数
  renderLoading?: (
    refCallback: UseInfiniteScrollHookRefCallback,
  ) => React.ReactNode;

  // 错误渲染函数
  renderError?: (error: Error) => React.ReactNode;

  // 样式
  className?: string;
  containerClassName?: string;

  // 功能开关
  enableTrimming?: boolean;
  enableBottomLoading?: boolean;
  enableScrollPositionPreservation?: boolean;

  // 其他配置
  renderDebugInfo?: boolean;
}

const DEFAULT_CONFIG = {
  trimThreshold: 25,
  scrollThresholdUp: 0.25,
  scrollThresholdDown: 0.67,
  bottomThreshold: 10,
  maxHeight: '500px',
  maxWidth: '500px',
  enableTrimming: true,
  enableBottomLoading: true,
  enableScrollPositionPreservation: true,
} as const;

export function BidirectionalInfiniteScroll<T = {}>(
  props: BidirectionalInfiniteScrollProps<T>,
) {
  // Refs
  const scrollableRootRef = useRef<HTMLDivElement | null>(null);
  const lastScrollDistanceToBottomRef = useRef<number>(0);
  const lastScrollTopRef = useRef<number>(0);
  const isTrimmingRef = useRef(false);
  const isBottomLoadingRef = useRef(false);

  // State
  const [scrollDirection, setScrollDirection] = useState<
    'up' | 'down' | 'none'
  >('none');
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [lastItem, setLastItem] = useState<DataItem<T> | undefined>(undefined);

  // Infinite scroll hook
  const [infiniteRef, { rootRef }] = useInfiniteScroll({
    loading: props.loading,
    hasNextPage: props.hasNextPage,
    onLoadMore: () => {
      console.log('onLoadMore', props.items.length);
      if (props.items.length > 0) {
        const lastItem = props.items[props.items.length - 1];
        if (lastItem) {
          props.onLoadMore({ backward: { key: lastItem.getKey(lastItem) } });
          return;
        }
      }
      // 加载最新的消息
      props.onLoadMore({ backward: { key: 1 << 60 } });
    },
    disabled: Boolean(props.error),
  });

  // Reversed items for display
  const reversedItems = useMemo(
    () => [...props.items].reverse(),
    [props.items],
  );

  // Scroll position preservation effect
  useLayoutEffect(() => {
    if (!props.enableScrollPositionPreservation) return;

    const scrollableRoot = scrollableRootRef.current;
    const lastScrollDistanceToBottom = lastScrollDistanceToBottomRef.current;

    if (scrollableRoot) {
      if (isTrimmingRef.current) {
        console.log('删除操作，保持滚动位置不变');
        const currentScrollTop = scrollableRoot.scrollTop;
        scrollableRoot.scrollTop = currentScrollTop;
        isTrimmingRef.current = false;
      } else if (isBottomLoadingRef.current) {
        console.log('底部加载操作，保持滚动位置不变');
        const currentScrollTop = scrollableRoot.scrollTop;
        scrollableRoot.scrollTop = currentScrollTop;
        isBottomLoadingRef.current = false;
      } else {
        console.log('正常加载，保持距离底部的距离');
        scrollableRoot.scrollTop =
          scrollableRoot.scrollHeight - lastScrollDistanceToBottom;
      }
    }
  }, [reversedItems, rootRef, props.enableScrollPositionPreservation]);

  // Root ref setter
  const rootRefSetter = useCallback(
    (node: HTMLDivElement) => {
      rootRef(node);
      scrollableRootRef.current = node;
    },
    [rootRef],
  );

  // Scroll handler
  const handleRootScroll = useCallback(() => {
    const rootNode = scrollableRootRef.current;
    if (!rootNode) return;

    const currentScrollTop = rootNode.scrollTop;
    const lastScrollTop = lastScrollTopRef.current;

    // Detect scroll direction
    const newScrollDirection =
      currentScrollTop > lastScrollTop
        ? 'down'
        : currentScrollTop < lastScrollTop
          ? 'up'
          : 'none';

    setScrollDirection(newScrollDirection);

    // Update scroll position tracking
    const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;

    console.log(
      `Scroll event: direction=${newScrollDirection}, scrollTop=${currentScrollTop}, scrollHeight=${rootNode.scrollHeight}, clientHeight=${rootNode.clientHeight}, distanceToBottom=${scrollDistanceToBottom}`,
    );
    lastScrollDistanceToBottomRef.current = scrollDistanceToBottom;
    lastScrollTopRef.current = currentScrollTop;

    const trimThreshold = props.trimThreshold ?? DEFAULT_CONFIG.trimThreshold;
    const scrollThresholdUp =
      props.scrollThresholdUp ?? DEFAULT_CONFIG.scrollThresholdUp;
    const scrollThresholdDown =
      props.scrollThresholdDown ?? DEFAULT_CONFIG.scrollThresholdDown;
    const bottomThreshold =
      props.bottomThreshold ?? DEFAULT_CONFIG.bottomThreshold;
    // Trimming logic
    if (props.enableTrimming && props.onTrimItems) {
      if (newScrollDirection === 'up' && props.items.length > trimThreshold) {
        if (
          rootNode.scrollTop > 0 &&
          rootNode.scrollTop < rootNode.scrollHeight * scrollThresholdUp
        ) {
          console.log('向上滚动，删除多余的 items');
          isTrimmingRef.current = true;
          props.onTrimItems('backward', trimThreshold);
        }
      } else if (
        newScrollDirection === 'down' &&
        props.items.length > trimThreshold
      ) {
        if (
          rootNode.scrollTop > 0 &&
          rootNode.scrollTop > rootNode.scrollHeight * scrollThresholdDown
        ) {
          console.log('向下滚动，删除多余的 items');
          isTrimmingRef.current = true;
          props.onTrimItems('forward', trimThreshold);
        }
      }
    }

    // Update last item
    if (reversedItems.length > 0) {
      const lastItem = reversedItems[reversedItems.length - 1];
      setLastItem(lastItem);
    }

    // Bottom detection and loading
    const scrollTop = rootNode.scrollTop;
    const scrollHeight = rootNode.scrollHeight;
    const clientHeight = rootNode.clientHeight;

    const isBottom = scrollTop + clientHeight >= scrollHeight - bottomThreshold;
    setIsAtBottom(isBottom);

    if (isBottom && lastItem && props.enableBottomLoading) {
      isBottomLoadingRef.current = true;
      props.onLoadMore({ forward: { key: lastItem.getKey(lastItem) } });
    }
  }, [
    props.items.length,
    reversedItems,
    props.trimThreshold,
    props.scrollThresholdUp,
    props.scrollThresholdDown,
    props.bottomThreshold,
    props.enableTrimming,
    props.enableBottomLoading,
    props.onTrimItems,
    props.onLoadMore,
  ]);

  // Throttled scroll handler
  const throttledScrollHandler = useCallback(
    throttle(handleRootScroll, 16), // 60fps
    [handleRootScroll],
  );

  // Error rendering
  if (props.error && props.renderError) {
    return props.renderError(props.error);
  }

  return (
    <Container>
      <div

        ref={rootRefSetter}
        className={`overflow-auto ${props.containerClassName}`}
        style={{ maxHeight: props.maxHeight, maxWidth: props.maxWidth, border: '1px solid blue' }}
        onScroll={throttledScrollHandler}
      >
        {props.hasNextPage &&
          (props.renderLoading ? (
            props.renderLoading(infiniteRef)
          ) : (
            <div ref={infiniteRef}>Loading...</div>
          ))}

        <div className="flex flex-col gap-1">
          {reversedItems.map((item) => (
            <div key={item.getKey(item)}>{props.renderItem(item)}</div>
          ))}
        </div>
      </div>

      {/* Debug info - can be removed in production */}
      {/* {process.env.NODE_ENV === 'development' && props.renderDebugInfo && (
        <div className="mt-2 text-xs text-gray-500">
          <div>Scroll Direction: {scrollDirection}</div>
          <div>At Bottom: {isAtBottom ? 'Yes' : 'No'}</div>
          <div>Items Count: {props.items.length}</div>
          <div>
            Last Item:{' '}
            {lastItem
              ? `${lastItem.getKey(lastItem)} - ${JSON.stringify(lastItem)}`
              : 'None'}
          </div>
        </div>
      )} */}
    </Container>
  );
}
