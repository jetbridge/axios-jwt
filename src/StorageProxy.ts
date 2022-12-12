import { StorageServiceType } from './StorageServiceType';

type StorageProxyType = {
  Storage: StorageServiceType | null
}

export const StorageProxy: StorageProxyType = {
  Storage: null
}
