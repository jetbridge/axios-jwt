import { StorageProxy } from './StorageProxy'
import { StorageType } from './StorageType'

export const applyStorage = (storage: StorageType) => {
  StorageProxy.Storage = storage
}
