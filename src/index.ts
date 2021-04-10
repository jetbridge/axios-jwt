import * as jwt from 'jsonwebtoken'
import { AxiosInstance, AxiosRequestConfig } from 'axios'

// a little time before expiration to try refresh (seconds)
const EXPIRE_FUDGE = 10
const STORAGE_KEY = `auth-tokens-${process.env.NODE_ENV}`

type Token = string
export interface IAuthTokens {
  accessToken: Token
  refreshToken: Token
}

// EXPORTS

/**
 * Checks if refresh tokens are stored
 * @returns Whether the user is logged in or not
 */
export const isLoggedIn = (): boolean => {
  const token = getRefreshToken()
  return !!token
}

/**
 * Sets the access and refresh tokens
 * @param {IAuthTokens} tokens - Access and Refresh tokens
 */
export const setAuthTokens = (tokens: IAuthTokens): void => localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))

/**
 * Sets the access token
 * @param {string} token - Access token
 */
export const setAccessToken = (token: Token): void => {
  const tokens = getAuthTokens()
  if (!tokens) {
    throw new Error('Unable to update access token since there are not tokens currently stored')
  }

  tokens.accessToken = token
  setAuthTokens(tokens)
}

/**
 * Clears both tokens
 */
export const clearAuthTokens = (): void => localStorage.removeItem(STORAGE_KEY)

/**
 * Returns the stored refresh token
 * @returns {string} Refresh token
 */
export const getRefreshToken = (): Token | undefined => {
  const tokens = getAuthTokens()
  return tokens ? tokens.refreshToken : undefined
}

/**
 * Returns the stored access token
 * @returns {string} Access token
 */
export const getAccessToken = (): Token | undefined => {
  const tokens = getAuthTokens()
  return tokens ? tokens.accessToken : undefined
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
export const refreshTokenIfNeeded = async (requestRefresh: TokenRefreshRequest): Promise<Token | undefined> => {
  // use access token (if we have it)
  let accessToken = getAccessToken()

  // check if access token is expired
  if (!accessToken || isTokenExpired(accessToken)) {
    // do refresh
    accessToken = await refreshToken(requestRefresh)
  }

  return accessToken
}

/**
 *
 * @param {Axios} axios - Axios instance to apply the interceptor to
 * @param {IAuthTokenInterceptorConfig} config - Configuration for the interceptor
 */
export const applyAuthTokenInterceptor = (axios: AxiosInstance, config: IAuthTokenInterceptorConfig): void => {
  if (!axios.interceptors) throw new Error(`invalid axios instance: ${axios}`)
  axios.interceptors.request.use(authTokenInterceptor(config))
}

/**
 * @deprecated This method has been renamed to applyAuthTokenInterceptor and will be removed in a future release.
 */
export const useAuthTokenInterceptor = applyAuthTokenInterceptor

// PRIVATE

/**
 *  Returns the refresh and access tokens
 * @returns {IAuthTokens} Object containing refresh and access tokens
 */
const getAuthTokens = (): IAuthTokens | undefined => {
  const tokensRaw = localStorage.getItem(STORAGE_KEY)
  if (!tokensRaw) return

  try {
    // parse stored tokens JSON
    return JSON.parse(tokensRaw)
  } catch (error) {
    console.error('Failed to parse auth tokens: ', tokensRaw, error)
  }
  return
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
  return !expiresIn || expiresIn <= EXPIRE_FUDGE
}

/**
 * Gets the unix timestamp from an access token
 *
 * @param {string} token - Access token
 * @returns {string} Unix timestamp
 */
const getTimestampFromToken = (token: Token): number | undefined => {
  const decoded = jwt.decode(token)
  if (!decoded) return
  return (decoded as { [key: string]: number }).exp
}

/**
 * Returns the number of seconds before the access token expires or -1 if it already has
 *
 * @param {string} token - Access token
 * @returns {number} Number of seconds before the access token expires
 */
const getExpiresIn = (token: Token): number => {
  const expiration = getTimestampFromToken(token)
  if (expiration) return expiration - Date.now() / 1000

  return -1
}

/**
 * Refreshes the access token using the provided function
 *
 * @param {requestRefresh} requestRefresh - Function that is used to get a new access token
 * @returns {string} - Fresh access token
 */
const refreshToken = async (requestRefresh: TokenRefreshRequest): Promise<Token> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return Promise.reject('No refresh token available')

  try {
    // Update the status
    isRefreshing = true

    // do refresh with default axios client (we don't want our interceptor applied for refresh)
    const newToken = await requestRefresh(refreshToken)
    // save tokens
    setAccessToken(newToken)
    return newToken
  } catch (error) {
    // failed to refresh... check error type
    const status = error?.response?.status
    if (status === 401 || status === 422) {
      // got invalid token response for sure, remove saved tokens because they're invalid
      localStorage.removeItem(STORAGE_KEY)
      return Promise.reject(`Got 401 on token refresh; Resetting auth token: ${error}`)
    } else {
      // some other error, probably network error
      return Promise.reject(`Failed to refresh auth token: ${error}`)
    }
  } finally {
    isRefreshing = false
  }
}

export type TokenRefreshRequest = (refreshToken: string) => Promise<Token>

export interface IAuthTokenInterceptorConfig {
  header?: string
  headerPrefix?: string
  requestRefresh: TokenRefreshRequest
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
const authTokenInterceptor = ({
  header = 'Authorization',
  headerPrefix = 'Bearer ',
  requestRefresh,
}: IAuthTokenInterceptorConfig) => async (requestConfig: AxiosRequestConfig): Promise<AxiosRequestConfig> => {
  // we need refresh token to do any authenticated requests
  if (!getRefreshToken()) return requestConfig

  // if it's refreshing prevent another 'refresh' request
  if (isRefreshing) {
    // add the request to the queue
    return new Promise((resolve, reject) => {
      queue.push({ resolve, reject })
    })
      .then((token) => {
        requestConfig.headers[header] = `${headerPrefix}${token}`
        return requestConfig
      })
      .catch(Promise.reject)
  }

  // do refresh if needed
  let accessToken
  try {
    accessToken = await refreshTokenIfNeeded(requestRefresh)
    resolveQueue(accessToken)
  } catch (err) {
    declineQueue(err)
    console.warn(err)
    return Promise.reject(
      `Unable to refresh access token for request: ${requestConfig} due to token refresh error: ${err}`
    )
  }

  // add token to headers
  if (accessToken) requestConfig.headers[header] = `${headerPrefix}${accessToken}`
  return requestConfig
}

type RequestsQueue = {
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}[]

let isRefreshing = false
let queue: RequestsQueue = []

/**
 * Function that resolves all items in the queue with the provided token
 * @param token New access token
 */
const resolveQueue = (token?: string) => {
  queue.forEach((p) => {
    p.resolve(token)
  })

  queue = []
}

/**
 * Function that declines all items in the queue with the provided error
 * @param error Error
 */
const declineQueue = (error: Error) => {
  queue.forEach((p) => {
    p.reject(error)
  })

  queue = []
}
