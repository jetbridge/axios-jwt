import { StorageType } from './StorageType'

type StorageProxyType = {
  Storage: StorageType | null
}

export const StorageProxy: StorageProxyType = {
  Storage: null,
}
