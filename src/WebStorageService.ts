export class WebStorageService {
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
    return this._storage.setItem(key, value)
  }
}
