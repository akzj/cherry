'use client';

import { throttle } from 'lodash';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DataItem, ItemKeyType } from '../hooks/use-bidirectional-data';
import { styled } from 'styled-components';

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
  onLoadMore: (params: LoadItemsParams) => Promise<boolean>;
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
  const isTrimDelayRef = useRef(false);
  const scrollSpeedRef = useRef<number>(0);

  // State
  const [scrollDirection, setScrollDirection] = useState<
    'up' | 'down' | 'none'
  >('none');




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
        scrollableRoot.scrollTop = currentScrollTop;//+ scrollSpeedRef.current;
        isTrimmingRef.current = false;
      } else if (isBottomLoadingRef.current) {
        console.log('底部加载操作，保持滚动位置不变');
        const currentScrollTop = scrollableRoot.scrollTop;
        scrollableRoot.scrollTop = currentScrollTop;//+ scrollSpeedRef.current;
        isBottomLoadingRef.current = false;
      } else {
        console.log('正常加载，保持距离底部的距离');
        scrollableRoot.scrollTop = scrollableRoot.scrollHeight - lastScrollDistanceToBottom //+ scrollSpeedRef.current;
      }
    }
  }, [reversedItems, props.enableScrollPositionPreservation]);

  // Root ref setter
  const rootRefSetter = useCallback(
    (node: HTMLDivElement) => {
      scrollableRootRef.current = node;
    },
    [],
  );

  const lastItem = useMemo(() => {
    if (reversedItems.length > 0) {
      return reversedItems[reversedItems.length - 1];
    }
    return undefined;
  }, [reversedItems]);

  const firstItem = useMemo(() => {
    if (reversedItems.length > 0) {
      return reversedItems[0];
    }
    return undefined;
  }, [reversedItems]);

  const itemSize = useMemo(() => {
    return props.items.length;
  }, [props.items]);

  // Scroll handler
  const handleRootScroll = useCallback(() => {
    const rootNode = scrollableRootRef.current;
    if (!rootNode)
      return;

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

    // console.log(
    //   `Scroll event: direction=${newScrollDirection}, scrollTop=${currentScrollTop}, scrollHeight=${rootNode.scrollHeight}, clientHeight=${rootNode.clientHeight}, distanceToBottom=${scrollDistanceToBottom}`,
    // );
    const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;
    lastScrollDistanceToBottomRef.current = scrollDistanceToBottom;
    lastScrollTopRef.current = currentScrollTop;

    // Bottom detection and loading
    const scrollTop = rootNode.scrollTop;
    const scrollHeight = rootNode.scrollHeight;
    const clientHeight = rootNode.clientHeight;

    const trimThreshold = props.trimThreshold ?? DEFAULT_CONFIG.trimThreshold;
    const scrollThresholdUp =
      props.scrollThresholdUp ?? DEFAULT_CONFIG.scrollThresholdUp;
    const scrollThresholdDown =
      props.scrollThresholdDown ?? DEFAULT_CONFIG.scrollThresholdDown;

    const isBottom = scrollTop + clientHeight >= scrollHeight * scrollThresholdDown;
    scrollSpeedRef.current = currentScrollTop - lastScrollTop;
    //console.log('scrollSpeedRef', scrollSpeedRef.current);
    // Trimming logic
    if (props.enableTrimming && props.onTrimItems) {
      if (newScrollDirection === 'up') {
        if (itemSize > trimThreshold * 3) {
          if (props.onTrimItems) {
            if (!isTrimDelayRef.current) {
              console.log('向上滚动，删除多余的 items');
              isTrimDelayRef.current = true;
              setTimeout(() => {
                isTrimDelayRef.current = false;
                isTrimmingRef.current = true;
                if (props.onTrimItems) {
                  props.onTrimItems('backward', trimThreshold);
                }
              }, 100);
            }
          }
        }
        if (rootNode.scrollTop > 0 && rootNode.scrollTop < rootNode.scrollHeight * 0.2) {
          if (firstItem) {
            console.log('向上滚动，加载更多的 items');
            props.onLoadMore({ backward: { key: firstItem.getKey(firstItem) }, load_size: 10 }).then((skip) => {
              if (skip) {
                console.log('加载更多的 items 跳过');
                return;
              }
              console.log('加载更多的 items 完成');
              const currentScrollTop = rootNode.scrollTop;
              isBottomLoadingRef.current = false;
              const lastScrollTop = lastScrollTopRef.current;
              //rootNode.scrollTop = currentScrollTop + (currentScrollTop - lastScrollTop);
            }).catch((error) => {
              console.error('加载更多的 items 失败', error);
            });
          }
        }
      } else if (newScrollDirection === 'down') {
        if (isBottom) {
          console.log('向下滚动，删除多余的 items');

          if (itemSize > trimThreshold * 1.5 && !isTrimDelayRef.current) {
            isTrimDelayRef.current = true;
            setTimeout(() => {
              isTrimDelayRef.current = false;
              if (props.onTrimItems) {
                isTrimmingRef.current = true;
                props.onTrimItems('forward', trimThreshold);
              }
            }, 100);
          }

          if (lastItem) {
            props.onLoadMore({ forward: { key: lastItem.getKey(lastItem) }, load_size: 10 }).then((skip) => {
              if (skip) {
                console.log('加载更多的 items 跳过');
                return;
              }
              console.log('加载更多的 items 完成');
              isBottomLoadingRef.current = true;
              const scrollDistanceToBottom = rootNode.scrollHeight - rootNode.scrollTop;
              lastScrollDistanceToBottomRef.current = scrollDistanceToBottom;
              lastScrollTopRef.current = rootNode.scrollTop;


            }).catch((error) => {
              console.error('加载更多的 items 失败', error);
            });
          }
        }
      }
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
    throttle(handleRootScroll, 1), // 60fps
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
