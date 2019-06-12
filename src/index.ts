import * as jwt from "jsonwebtoken";
import { AxiosInstance, default as axiosRaw, AxiosRequestConfig } from "axios";

// a little time before expiration to try refresh (seconds)
const EXPIRE_FUDGE = 10;

type Token = string;
export interface IAuthTokens {
  accessToken: Token;
  refreshToken: Token;
}

export const getTokenStorageKey = (): string =>
  `auth-tokens-${process.env.NODE_ENV}`;

export const isLoggedIn = (): boolean => {
  const token = getRefreshToken();
  return !!token;
};

export const setAuthTokens = (tokens: IAuthTokens) =>
  localStorage.setItem(getTokenStorageKey(), JSON.stringify(tokens));

export const clearAuthTokens = () =>
  localStorage.removeItem(getTokenStorageKey());

const getAuthTokens = (): IAuthTokens | undefined => {
  const tokensRaw = localStorage.getItem(getTokenStorageKey());
  if (!tokensRaw) return;

  try {
    // parse stored tokens JSON
    return JSON.parse(tokensRaw);
  } catch (err) {
    console.error("Failed to parse auth tokens: ", tokensRaw, err);
  }
  return;
};
export const getRefreshToken = (): Token | undefined => {
  const tokens = getAuthTokens();
  return tokens ? tokens.refreshToken : undefined;
};
export const getAccessToken = (): Token | undefined => {
  const tokens = getAuthTokens();
  return tokens ? tokens.accessToken : undefined;
};
const isTokenExpired = (token: Token): boolean => {
  if (!token) return true;
  const expin = getExpiresInFromJWT(token) - EXPIRE_FUDGE;
  return !expin || expin < 0;
};

// gets unix TS
const getTokenExpiresTimeStamp = (token: Token): number | undefined => {
  const decoded = jwt.decode(token);
  if (!decoded) return;
  return (decoded as { [key: string]: number }).exp;
};

const getExpiresInFromJWT = (token: Token): number => {
  const exp = getTokenExpiresTimeStamp(token);
  if (exp) return exp - Date.now() / 1000;

  return -1;
};

const refreshToken = async (
  requestRefresh: TokenRefreshRequest
): Promise<IAuthTokens> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return Promise.reject("No refresh token available");

  try {
    // do refresh with default axios client (we don't want our interceptor applied for refresh)
    const res: IAuthTokens = await requestRefresh(refreshToken);
    // save tokens
    setAuthTokens(res);
    return res;
  } catch (err) {
    // failed to refresh... check error type
    if (err && err.response && err.response.status === 401) {
      // got invalid token response for sure, remove saved tokens because they're invalid
      localStorage.removeItem(getTokenStorageKey());
      return Promise.reject(
        `Got 401 on token refresh; Resetting auth token: ${err}`
      );
    } else {
      // some other error, probably network error
      return Promise.reject(`Failed to refresh auth token: ${err}`);
    }
  }
};

export type TokenRefreshRequest = (
  refreshToken: string
) => Promise<IAuthTokens>;
export interface IAuthTokenInterceptorConfig {
  header?: string;
  headerPrefix?: string;
  requestRefresh: TokenRefreshRequest;
}

const authTokenInterceptor = ({
  header = "Authorization",
  headerPrefix = "Bearer ",
  requestRefresh
}: IAuthTokenInterceptorConfig) => async (
  requestConfig: AxiosRequestConfig
): Promise<AxiosRequestConfig> => {
  // we need refresh token to do any authenticated requests
  if (!getRefreshToken()) return requestConfig;

  // use access token (if we have it)
  let accessToken = getAccessToken();

  // check if access token is expired
  if (!accessToken || isTokenExpired(accessToken)) {
    // do refresh
    try {
      const newTokens = await refreshToken(requestRefresh);
      // refresh ok. proceed
      if (newTokens) accessToken = newTokens.accessToken;
    } catch (err) {
      return Promise.reject(
        `Unable to refresh access token for request: ${requestConfig} due to token refresh error: ${err}`
      );
    }
  }

  // add token to headers
  if (accessToken)
    requestConfig.headers[header] = `${headerPrefix}${accessToken}`;
  return requestConfig;
};

export const useAuthTokenInterceptor = (
  axios: AxiosInstance,
  config: IAuthTokenInterceptorConfig
) => {
  axios.interceptors.request.use(authTokenInterceptor(config));
};
