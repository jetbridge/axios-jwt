import { BrowserStorageService } from './BrowserStorageService'

export const getBrowserSessionStorage = () => new BrowserStorageService(window.sessionStorage)
