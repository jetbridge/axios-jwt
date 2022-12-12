export type StorageServiceType = {
  remove(key: string): void
  set(key: string, value: string): void
  get(value: string): string | null
}
