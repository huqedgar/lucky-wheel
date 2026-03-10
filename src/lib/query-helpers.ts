export function createQueryKeys<T extends string>(feature: T) {
  return {
    all: [feature] as const,
    lists: () => [...createQueryKeys(feature).all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...createQueryKeys(feature).lists(), filters] as const,
    details: () => [...createQueryKeys(feature).all, "detail"] as const,
    detail: (id: string) => [...createQueryKeys(feature).details(), id] as const,
  };
}
