# axios-jwt

Store, transmit, refresh JWT authentication tokens for axios

## What does it do?

Applies a request interceptor to your axios instance.

The interceptor automatically adds an access token header (default: `Authorization`) to all requests.
It stores `access_token` and `refresh_token` in `localStorage` and reads them when needed.

It parses the expiration time of your access token and checks to see if it is expired before every request. If it is expired, a request to
refresh and store a new access token is automatically performed before the request proceeds.

## How do I use it?

- Define a token refresh function
- Configure the interceptor
- Store tokens on login with `setAuthTokens()`

### Apply interceptor:

```typescript
import { IAuthTokens, TokenRefreshRequest, applyAuthTokenInterceptor } from 'axios-jwt'
import axios from 'axios'
// your axios instance that you wish to apply the interceptor to
import apiClient from '../apiClient'

const BASE_URL = process.env.REACT_APP_BASE_URL
if (!BASE_URL) throw new Error('BASE_URL is not defined')

// type of response from login endpoint
export interface IAuthResponse {
  access_token: string
  refresh_token: string
}

// refresh token endpoint
const refreshEndpoint = `${BASE_URL}/auth/refresh_token`

// transform response into IAuthTokens
// this assumes your auth endpoint returns `{"access_token": ..., "refresh_token": ...}`
export const authResponseToAuthTokens = (res: IAuthResponse): IAuthTokens => ({
  accessToken: res.access_token,
  refreshToken: res.refresh_token,
})

// define token refresh function
const requestRefresh: TokenRefreshRequest = async (refreshToken: string): Promise<string> => {
  // perform refresh
  return (await axios.post(refreshEndpoint, { token: refreshToken })).data.access_token
}

// add interceptor to your axios instance
applyAuthTokenInterceptor(apiClient, { requestRefresh })
```

### Login/logout:

```typescript
import { isLoggedIn, setAuthTokens, clearAuthTokens, getAccessToken, getRefreshToken } from 'axios-jwt'

// login
const login = async (params: ILoginRequest) => {
  const res: IAuthResponse = (await axios.post('/auth/login', params)).data
  // save tokens to storage
  setAuthTokens(authResponseToAuthTokens(res))
}

// to reset auth tokens
const logout = () => clearAuthTokens()

// check if refresh token exists
if (isLoggedIn()) {
  // assume we are logged in because we have a refresh token
}

// get access to tokens
const accessToken = getAccessToken()
const refreshToken = getRefreshToken()
```

## Configuration

```typescript
{
  requestRefresh,  // async function that takes refreshToken and returns a promise for a fresh accessToken
  header = "Authorization",  // header name
  headerPrefix = "Bearer ",  // header value prefix
}
```

## Caveats

- Your backend should allow a few seconds of leeway between when the token expires and when it actually becomes unusable.

## Non-TypeScript implementation

```javascript
import {applyAuthTokenInterceptor} from 'axios-jwt';
import axios from 'axios';

const apiClient = axios.create();

const requestRefresh = (refresh) => {
    return new Promise((resolve, reject) => {
        // notice that this is the global axios instance.  <-- important
        axios.post('/api/v1/auth/token/refresh/', {
            refresh
        })
            .then(response => {
                resolve(response.data.accessToken);
            }, reject);
    });
};
applyAuthTokenInterceptor(apiClient, { requestRefresh });  // Notice that this uses the apiClient instance.  <-- important

// Now just make all requests from the apiClient.

apiClient.get('/api/endpoint/resource/1')
    .then(response => { // blah blah })
```
