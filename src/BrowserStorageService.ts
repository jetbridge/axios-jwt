export class BrowserStorageService {
  private _storage: Storage

  constructor(storage: Storage) {
    this._storage = storage
  }

  remove(key: string) {
    this._storage.removeItem(key)
  }

  get(key: string) {
    return this._storage.getItem(key)
  }

  set(key: string, value: string) {
    this._storage.setItem(key, value)
  }
}
