import { applyAuthTokenInterceptor } from './applyAuthTokenInterceptor';

// EXPORTS

/**
 * @deprecated This method has been renamed to applyAuthTokenInterceptor and will be removed in a future release.
 */
export const useAuthTokenInterceptor = applyAuthTokenInterceptor

export * from './tokensUtils';
export * from './authTokenInterceptor';
export * from './setAuthTokens';
export * from './applyAuthTokenInterceptor'
export * from './applyStorage'
export * from './applySessionStorage'
export * from './applyLocalStorage'
export * from './IAuthTokens'
export * from './TokenRefreshRequest'
export * from './setAuthTokens'
export * from './StorageServiceType'
