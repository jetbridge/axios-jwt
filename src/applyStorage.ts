import { StorageProxy } from './StorageProxy'
import { StorageType } from './StorageType'

export const applyStorage = (storage?: StorageType) => {
  if (storage) {
    StorageProxy.Storage = storage
  }
}
