import { TokenRefreshRequest } from './TokenRefreshRequest';

export interface IAuthTokenInterceptorConfig {
  header?: string;
  headerPrefix?: string;
  requestRefresh: TokenRefreshRequest;
  tokenExpireFudge?: number
}
