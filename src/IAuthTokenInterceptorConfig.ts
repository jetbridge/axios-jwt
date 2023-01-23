import { TokenRefreshRequest } from './TokenRefreshRequest'
import { StorageType } from './StorageType'
import { StringValue } from 'ms'

export interface IAuthTokenInterceptorConfig {
  header?: string
  headerPrefix?: string
  requestRefresh: TokenRefreshRequest
  /**
   *
   *  Token leeway in seconds (or via [`ms`](https://github.com/vercel/ms))
   */
  tokenExpireFudge?: number | StringValue
  getStorage?: () => StorageType
}
