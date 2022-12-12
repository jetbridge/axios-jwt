import { WebStorageService } from './WebStorageService';
import { applyStorage } from './applyStorage';

export const applySessionStorage = () => {
  applyStorage(
    new WebStorageService(window.sessionStorage)
  )
}
