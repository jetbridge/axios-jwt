export type StorageType = {
  remove(key: string): Promise<void>
  set(key: string, value: string): Promise<void>
  get(value: string): Promise<string | null>
}
