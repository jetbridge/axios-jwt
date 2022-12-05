export type StorageServiceType = {
  remove(key: string): void
  set(key: string, value: string): void
  get(value: string): string | null
}

type StorageProxyType = {
  Storage: StorageServiceType | null
}

export const StorageProxy: StorageProxyType = {
  Storage: null
}
