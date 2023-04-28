import { StringValue } from 'ms'
import { StorageType } from './StorageType'
import { TokenRefreshRequest } from './TokenRefreshRequest'

export interface IAuthTokenInterceptorConfig {
  header?: string
  headerPrefix?: string
  requestRefresh: TokenRefreshRequest
  /**
   *
   *  Token leeway in seconds (or via [`ms`](https://github.com/vercel/ms))
   */
  tokenExpireFudge?: number | StringValue
  getStorage?: () => StorageType | undefined
}
