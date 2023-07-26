import { StorageProxy } from './StorageProxy'
import { STORAGE_KEY } from './StorageKey'
import { IAuthTokens } from './IAuthTokens'

/**
 * Sets the access and refresh tokens
 * @param {IAuthTokens} tokens - Access and Refresh tokens
 */
export const setAuthTokens = async (tokens: IAuthTokens): Promise<void> =>
  await StorageProxy.Storage?.set(STORAGE_KEY, JSON.stringify(tokens))
