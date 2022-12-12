import { StorageProxy } from './StorageProxy';
import { StorageServiceType } from './StorageServiceType';

export const applyStorage = (storage: StorageServiceType) => {
  StorageProxy.Storage = storage;
};
