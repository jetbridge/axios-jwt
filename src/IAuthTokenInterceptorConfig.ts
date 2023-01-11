import { TokenRefreshRequest } from './TokenRefreshRequest'
import { StorageType } from './StorageType'

export interface IAuthTokenInterceptorConfig {
  header?: string
  headerPrefix?: string
  requestRefresh: TokenRefreshRequest
  tokenExpireFudge?: number
  getStorage?: () => StorageType
}
