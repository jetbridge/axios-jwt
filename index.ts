import { applyAuthTokenInterceptor } from './src/applyAuthTokenInterceptor'

// EXPORTS

/**
 * @deprecated This method has been renamed to applyAuthTokenInterceptor and will be removed in a future release.
 */
export const useAuthTokenInterceptor = applyAuthTokenInterceptor

export * from './src/tokensUtils'
export * from './src/authTokenInterceptor'
export * from './src/setAuthTokens'
export * from './src/applyAuthTokenInterceptor'
export * from './src/getBrowserSessionStorage'
export * from './src/getBrowserLocalStorage'
export * from './src/IAuthTokens'
export * from './src/TokenRefreshRequest'
export * from './src/setAuthTokens'
export * from './src/StorageType'
