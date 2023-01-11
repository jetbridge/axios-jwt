import { AxiosInstance } from 'axios'
import { IAuthTokenInterceptorConfig } from './IAuthTokenInterceptorConfig'
import { authTokenInterceptor } from './authTokenInterceptor'

/**
 *
 * @param {Axios} axios - Axios instance to apply the interceptor to
 * @param {IAuthTokenInterceptorConfig} config - Configuration for the interceptor
 */
export const applyAuthTokenInterceptor = (
  axios: AxiosInstance,
  config: IAuthTokenInterceptorConfig
): void => {
  if (!axios.interceptors) throw new Error(`invalid axios instance: ${axios}`)

  axios.interceptors.request.use(authTokenInterceptor(config))
}
