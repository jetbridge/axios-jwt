import { BrowserStorageService } from './BrowserStorageService'

export const getBrowserSessionStorage = () => {
  if (typeof window !== 'undefined') {
    return new BrowserStorageService(window.sessionStorage)
  }
}
