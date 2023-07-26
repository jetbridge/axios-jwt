export class BrowserStorageService {
  private _storage: Storage

  constructor(storage: Storage) {
    this._storage = storage
  }

  async remove(key: string) {
    this._storage.removeItem(key)
  }

  async get(key: string) {
    return this._storage.getItem(key)
  }

  async set(key: string, value: string) {
    this._storage.setItem(key, value)
  }
}
