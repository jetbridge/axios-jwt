import { setAuthTokens } from './setAuthTokens'
import { StorageProxy } from './StorageProxy'
import { Token } from './Token'
import { STORAGE_KEY } from './StorageKey'
import { IAuthTokens } from './IAuthTokens'

// PRIVATE

/**
 *  Returns the refresh and access tokens
 * @returns {IAuthTokens} Object containing refresh and access tokens
 */
const getAuthTokens = async (): Promise<IAuthTokens | undefined> => {
  const rawTokens = await StorageProxy.Storage?.get(STORAGE_KEY)
  if (!rawTokens) return

  try {
    // parse stored tokens JSON
    return JSON.parse(rawTokens)
  } catch (error: unknown) {
    if (error instanceof SyntaxError) {
      error.message = `Failed to parse auth tokens: ${rawTokens}`
      throw error
    }
  }
}

/**
 * Sets the access token
 * @param {string} token - Access token
 */
export const setAccessToken = async (token: Token): Promise<void> => {
  const tokens = await getAuthTokens()
  if (!tokens) {
    throw new Error('Unable to update access token since there are not tokens currently stored')
  }

  tokens.accessToken = token
  await setAuthTokens(tokens)
}

/**
 * Returns the stored refresh token
 * @returns {string} Refresh token
 */
export const getRefreshToken = async (): Promise<Token | undefined> => {
  const tokens = await getAuthTokens()
  return tokens ? tokens.refreshToken : undefined
}

/**
 * Returns the stored access token
 * @returns {string} Access token
 */
export const getAccessToken = async (): Promise<Token | undefined> => {
  const tokens = await getAuthTokens()
  return tokens ? tokens.accessToken : undefined
}

/**
 * Clears both tokens
 */
export const clearAuthTokens = async (): Promise<void> =>
  await StorageProxy.Storage?.remove(STORAGE_KEY)

/**
 * Checks if refresh tokens are stored
 * @returns Whether the user is logged in or not
 */
export const isLoggedIn = async (): Promise<boolean> => {
  const token = await getRefreshToken()
  return !!token
}
