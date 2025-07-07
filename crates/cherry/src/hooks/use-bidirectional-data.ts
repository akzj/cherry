import { useCallback, useEffect, useRef, useState } from 'react';

// 定义可扩展参数类型
export interface LoadItemsParams {
  forward?: { key: ItemKeyType };
  backward?: { key: ItemKeyType };
  [key: string]: any;
}
export type ItemKeyType = number | string;

export interface KeyExtractor<T> {
  getKey: (item: T) => ItemKeyType;
}

export type DataItem<T = {}> = T & KeyExtractor<T>;

export interface LoadItemsFunction<T = {}> {
  (params: LoadItemsParams): Promise<{
    data: DataItem<T>[];
    hasNextPage: boolean;
  }>;
}

export interface UseBidirectionalDataOptions<T> {
  loadItems: LoadItemsFunction<T>;
  initialLoadParams?: LoadItemsParams;
  trimThreshold?: number;
  enableDeduplication?: boolean;
}

export function useBidirectionalData<T>({
  loadItems,
  initialLoadParams,
  trimThreshold = 25,
  enableDeduplication = true,
}: UseBidirectionalDataOptions<T>) {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<DataItem<T>[]>([]);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const [error, setError] = useState<Error>();
  const initialLoadRef = useRef(false);
  const loadedKeysRef = useRef<Set<ItemKeyType>>(new Set());

  // Trim items from the end (backward direction)
  const trimItems = useCallback(
    (maxItems: number = trimThreshold) => {
      setItems((current) => {
        if (current.length <= maxItems) return current;

        const itemsToKeep = current.slice(-maxItems);
        const itemsToRemove = current.slice(0, current.length - maxItems);

        // Remove deleted keys from deduplication set
        if (enableDeduplication) {
          itemsToRemove.forEach((item) =>
            loadedKeysRef.current.delete(item.getKey(item)),
          );
        }

        return itemsToKeep;
      });
    },
    [trimThreshold, enableDeduplication],
  );

  // Trim items from the beginning (forward direction)
  const trimForwardItems = useCallback(
    (maxItems: number = trimThreshold) => {
      setItems((current) => {
        if (current.length <= maxItems) return current;

        const itemsToKeep = current.slice(0, maxItems);
        const itemsToRemove = current.slice(maxItems);

        // Remove deleted keys from deduplication set
        if (enableDeduplication) {
          itemsToRemove.forEach((item) =>
            loadedKeysRef.current.delete(item.getKey(item)),
          );
        }

        return itemsToKeep;
      });
    },
    [trimThreshold, enableDeduplication],
  );

  // Load more items
  const loadMore = useCallback(
    async (params: LoadItemsParams) => {
      if (loading) return;

      setLoading(true);
      try {
        const { data, hasNextPage: newHasNextPage } = await loadItems(params);

        setItems((current) => {
          if (enableDeduplication) {
            // Create set of existing keys
            const itemSet = new Set<ItemKeyType>();
            current.forEach((item) => itemSet.add(item.getKey(item)));

            // Filter out duplicates
            const newItems = data.filter(
              (item) => !itemSet.has(item.getKey!(item)),
            );

            // Add new keys to deduplication set
            newItems.forEach((item) =>
              loadedKeysRef.current.add(item.getKey(item)),
            );

            if (newItems.length > 0) {
              return [...newItems, ...current].sort((a, b) => {
                if (
                  typeof a.getKey(a) === 'number' &&
                  typeof b.getKey(b) === 'number'
                ) {
                  return (b.getKey(b) as number) - (a.getKey(a) as number) 
                } else {
                  return a
                    .getKey(a)
                    .toString()
                    .localeCompare(b.getKey(b).toString());
                }
              });
            }
            return current;
          } else {
            // Without deduplication
            return [...data, ...current].sort((a, b) => {
              if (
                typeof a.getKey(a) === 'number' &&
                typeof b.getKey(b) === 'number'
              ) {
                return (b.getKey(b) as number) - (a.getKey(a) as number) 
              } else {
                return a
                  .getKey(a)
                  .toString()
                  .localeCompare(b.getKey(b).toString());
              }
            });
          }
        });
        setHasNextPage(newHasNextPage);

        if (!newHasNextPage){
          //reset 1 seconds
          setTimeout(() => {
            setHasNextPage(true);
          }, 1000);
        }

      } catch (error_) {
        console.error('Error loading items:', error_);
        setError(
          error_ instanceof Error ? error_ : new Error('Something went wrong'),
        );
      } finally {
        setLoading(false);
      }
    },
    [loading, loadItems, enableDeduplication],
  );

  // Initial load
  useEffect(() => {
    if (initialLoadRef.current) return;
    initialLoadRef.current = true;

    if (initialLoadParams) {
      loadMore(initialLoadParams);
    } else {
      console.log('initialLoadParams is not provided, load more with key 0');
      loadMore({ forward: { key: 0 } });
    }
  }, [loadMore, initialLoadParams]);

  return {
    loading,
    items,
    hasNextPage,
    error,
    loadMore,
    updateItem: (item: DataItem<T>) => {
      console.log('updateItem', item);
      setItems((current) => {
        const index = current.findIndex(
          (i) => i.getKey(i) === item.getKey(item),
        );
        if (index === -1) {
          return current;
        }
        return [...current.slice(0, index), item, ...current.slice(index + 1)];
      });
    },
    deleteItem: (item: DataItem<T>) => {
      console.log('deleteItem', item);
      setItems((current) => {
        const index = current.findIndex(
          (i) => i.getKey(i) === item.getKey(item),
        );
        if (index === -1) {
          return current;
        }
        return [...current.slice(0, index), ...current.slice(index + 1)];
      });
    },
    trimItems,
    trimForwardItems,
    // Utility functions
    clearItems: useCallback(() => {
      setItems([]);
      loadedKeysRef.current.clear();
    }, []),
    resetError: useCallback(() => {
      setError(undefined);
    }, []),
  };
}
