import { BrowserStorageService } from './BrowserStorageService'

export const getBrowserLocalStorage = () => new BrowserStorageService(window.localStorage)
