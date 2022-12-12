import { WebStorageService } from './WebStorageService';
import { applyStorage } from './applyStorage';

export const applyLocalStorage = () => {
  applyStorage(
    new WebStorageService(window.localStorage)
  )
}
