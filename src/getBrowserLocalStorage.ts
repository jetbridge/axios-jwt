import { BrowserStorageService } from './BrowserStorageService'

export const getBrowserLocalStorage = () => {
  if (typeof window !== 'undefined') {
    return new BrowserStorageService(window.localStorage)
  }
}
