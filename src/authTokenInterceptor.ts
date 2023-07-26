import { getAccessToken, getRefreshToken, setAccessToken } from './tokensUtils'
import { setAuthTokens } from './setAuthTokens'
import axios from 'axios'
import { StorageProxy } from './StorageProxy'
import { IAuthTokenInterceptorConfig } from './IAuthTokenInterceptorConfig'
import { TokenRefreshRequest } from './TokenRefreshRequest'
import { Token } from './Token'
import jwtDecode, { JwtPayload } from 'jwt-decode'
import { STORAGE_KEY } from './StorageKey'
import { getBrowserLocalStorage } from './getBrowserLocalStorage'
import { applyStorage } from './applyStorage'
import ms from 'ms'

// Token Leeway
// A little time before expiration to try refresh (seconds)
let expireFudge = 10

let currentlyRequestingPromise: Promise<Token | undefined> | undefined = undefined

/**
 * Gets the unix timestamp from an access token
 *
 * @param {string} token - Access token
 * @returns {string} Unix timestamp
 */
const getTimestampFromToken = (token: Token): number | undefined => {
  const decoded = jwtDecode<JwtPayload>(token)

  return decoded.exp
}

/**
 * Returns the number of seconds before the access token expires or -1 if it already has
 *
 * @param {string} token - Access token
 * @returns {number} Number of seconds before the access token expires
 */
const getExpiresIn = (token: Token): number => {
  const expiration = getTimestampFromToken(token)

  if (!expiration) return -1

  return expiration - Date.now() / 1000
}

/**
 * Checks if the token is undefined, has expired or is about the expire
 *
 * @param {string} token - Access token
 * @returns Whether or not the token is undefined, has expired or is about the expire
 */
const isTokenExpired = (token: Token): boolean => {
  if (!token) return true
  const expiresIn = getExpiresIn(token)
  return !expiresIn || expiresIn <= expireFudge
}

/**
 * Refreshes the access token using the provided function
 * Note: NOT to be called externally.  Only accessible through an interceptor
 *
 * @param {requestRefresh} requestRefresh - Function that is used to get a new access token
 * @returns {string} - Fresh access token
 */
const refreshToken = async (requestRefresh: TokenRefreshRequest): Promise<Token> => {
  const refreshToken = await getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token available')

  try {
    // Refresh and store access token using the supplied refresh function
    const newTokens = await requestRefresh(refreshToken)
    if (typeof newTokens === 'object' && newTokens?.accessToken) {
      await setAuthTokens(newTokens)
      return newTokens.accessToken
    } else if (typeof newTokens === 'string') {
      await setAccessToken(newTokens)
      return newTokens
    }

    throw new Error('requestRefresh must either return a string or an object with an accessToken')
  } catch (error) {
    // Failed to refresh token
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 401 || status === 422) {
        // The refresh token is invalid so remove the stored tokens
        await StorageProxy.Storage?.remove(STORAGE_KEY)
        throw new Error(`Got ${status} on token refresh; clearing both auth tokens`)
      }
    }

    // A different error, probably network error
    if (error instanceof Error) {
      throw new Error(`Failed to refresh auth token: ${error.message}`)
    } else {
      throw new Error('Failed to refresh auth token and failed to parse error')
    }
  }
}

/**
 * @callback requestRefresh
 * @param {string} refreshToken - Token that is sent to the backend
 * @returns {Promise} Promise that resolves in an access token
 */

/**
 * Gets the current access token, exchanges it with a new one if it's expired and then returns the token.
 * @param {requestRefresh} requestRefresh - Function that is used to get a new access token
 * @returns {string} Access token
 */
export const refreshTokenIfNeeded = async (
  requestRefresh: TokenRefreshRequest
): Promise<Token | undefined> => {
  // use access token (if we have it)
  let accessToken = await getAccessToken()

  // check if access token is expired
  if (!accessToken || isTokenExpired(accessToken)) {
    // do refresh
    accessToken = await refreshToken(requestRefresh)
  }

  return accessToken
}

/**
 * Function that returns an Axios Intercepter that:
 * - Applies that right auth header to requests
 * - Refreshes the access token when needed
 * - Puts subsequent requests in a queue and executes them in order after the access token has been refreshed.
 *
 * @param {IAuthTokenInterceptorConfig} config - Configuration for the interceptor
 * @returns {Promise} Promise that resolves in the supplied requestConfig
 */
export const authTokenInterceptor = ({
  header = 'Authorization',
  headerPrefix = 'Bearer ',
  requestRefresh,
  tokenExpireFudge = '10s',
  getStorage = getBrowserLocalStorage,
}: IAuthTokenInterceptorConfig) => {
  expireFudge =
    ms(typeof tokenExpireFudge === 'string' ? tokenExpireFudge : `${tokenExpireFudge}s`) / 1000
  applyStorage(getStorage())

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any -- Waiting for a fix in axios types
  return async (requestConfig: any): Promise<any> => {
    // Waiting for a fix in axios types
    // We need refresh token to do any authenticated requests
    if (!(await getRefreshToken())) return requestConfig

    let accessToken = undefined

    // Try to await a current request
    if (currentlyRequestingPromise) accessToken = await currentlyRequestingPromise

    if (!accessToken) {
      try {
        // Sets the promise so everyone else will wait - then get the value
        currentlyRequestingPromise = refreshTokenIfNeeded(requestRefresh)
        accessToken = await currentlyRequestingPromise

        // Reset the promise
        currentlyRequestingPromise = undefined
      } catch (error: unknown) {
        // Reset the promise
        currentlyRequestingPromise = undefined

        if (error instanceof Error) {
          throw new Error(
            `Unable to refresh access token for request due to token refresh error: ${error.message}`
          )
        }
      }
    }

    // add token to headers
    if (accessToken && requestConfig.headers) {
      requestConfig.headers[header] = `${headerPrefix}${accessToken}`
    }

    return requestConfig
  }
}
