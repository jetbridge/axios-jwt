import * as jwt from 'jsonwebtoken'
import { AxiosRequestConfig } from 'axios'

// a little time before expiration to try refresh (seconds)
const EXPIRE_FUDGE = 10
const STORAGE_KEY = `auth-tokens-${process.env.NODE_ENV}`

type Token = string
export interface IAuthTokens {
  accessToken: Token
  refreshToken: Token
}

// EXPORTS
export const isLoggedIn = (): boolean => {
  const token = getRefreshToken()
  return !!token
}

export const setAuthTokens = (tokens: IAuthTokens) => localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))

export const setAccessToken = (token: Token) => {
  const tokens = getAuthTokens()
  if (!tokens) {
    console.warn('Trying to set new access token but no auth tokens found in storage. This should not happen.')
    return
  }

  tokens.accessToken = token
  setAuthTokens(tokens)
}

export const clearAuthTokens = () => localStorage.removeItem(STORAGE_KEY)

export const getRefreshToken = (): Token | undefined => {
  const tokens = getAuthTokens()
  return tokens ? tokens.refreshToken : undefined
}
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
 * Get the current access token, exchange it with a new one if it's expired and then returns and return it.
 * @param {requestRefresh} requestRefresh - Fuction that is used to get a new access token
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
export const useAuthTokenInterceptor = (axios: any, config: IAuthTokenInterceptorConfig) => {
  if (!axios.interceptors) throw new Error(`invalid axios instance: ${axios}`)
  axios.interceptors.request.use(authTokenInterceptor(config))
}

// PRIVATE
const getAuthTokens = (): IAuthTokens | undefined => {
  const tokensRaw = localStorage.getItem(STORAGE_KEY)
  if (!tokensRaw) return

  try {
    // parse stored tokens JSON
    return JSON.parse(tokensRaw)
  } catch (err) {
    console.error('Failed to parse auth tokens: ', tokensRaw, err)
  }
  return
}
const isTokenExpired = (token: Token): boolean => {
  if (!token) return true
  const expiration = getExpiration(token) - EXPIRE_FUDGE
  return !expiration || expiration < 0
}

// gets unix TS
const getTimestampFromToken = (token: Token): number | undefined => {
  const decoded = jwt.decode(token)
  if (!decoded) return
  return (decoded as { [key: string]: number }).exp
}

const getExpiration = (token: Token): number => {
  const exp = getTimestampFromToken(token)
  if (exp) return exp - Date.now() / 1000

  return -1
}

const refreshToken = async (requestRefresh: TokenRefreshRequest): Promise<Token> => {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return Promise.reject('No refresh token available')

  try {
    // Update the status
    isRefreshing = true

    // do refresh with default axios client (we don't want our interceptor applied for refresh)
    const res = await requestRefresh(refreshToken)
    // save tokens
    setAccessToken(res)
    return res
  } catch (err) {
    // failed to refresh... check error type
    if (err && err.response && (err.response.status === 401 || err.response.status === 422)) {
      // got invalid token response for sure, remove saved tokens because they're invalid
      localStorage.removeItem(STORAGE_KEY)
      return Promise.reject(`Got 401 on token refresh; Resetting auth token: ${err}`)
    } else {
      // some other error, probably network error
      return Promise.reject(`Failed to refresh auth token: ${err}`)
    }
  } finally {
    isRefreshing = false
  }
}

export type TokenRefreshRequest = (refreshToken: string) => Promise<Token>

type RequestsQueue = {
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}[]

let isRefreshing: boolean = false
let queue: RequestsQueue = []

const processQueue = (error: Error | null, token: string | null = null) => {
  queue.forEach((p) => {
    if (error !== null) {
      p.reject(error)
    } else {
      p.resolve(token)
    }
  })

  queue = []
}

export interface IAuthTokenInterceptorConfig {
  header?: string
  headerPrefix?: string
  requestRefresh: TokenRefreshRequest
}

/**
 * Function that returns an Axios Intercepter that:
 * - Applies that right auth header to requests
 * - Refreshes the access token when needed
 * - Puts subsequent requests in a queue and executes them after the access token has been refreshed.
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
    processQueue(null, accessToken)
  } catch (err) {
    processQueue(err, accessToken)
    console.warn(err)
    return Promise.reject(
      `Unable to refresh access token for request: ${requestConfig} due to token refresh error: ${err}`
    )
  }

  // add token to headers
  if (accessToken) requestConfig.headers[header] = `${headerPrefix}${accessToken}`
  return requestConfig
}
