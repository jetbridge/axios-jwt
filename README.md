# axios-jwt

Store, transmit, refresh JWT authentication tokens for axios

## What does it do?

Applies a request interceptor to your axios instance.

The interceptor automatically adds an access token header (default: `Authorization`) to all requests.
It stores `access_token` and `refresh_token` in `localStorage` and reads them when needed.

It parses the expiration time of your access token and checks to see if it is expired before every request. If it is expired, a request to
refresh and store a new access token is automatically performed before the request proceeds.

## How do I use it?

1. Create an axios instance
2. Define a token refresh function
3. Configure the interceptor
4. Store tokens on login with `setAuthTokens()`
5. Clear tokens on logout with `clearAuthTokens()`

### Applying the interceptor

```typescript
// api.ts

import { IAuthTokens, TokenRefreshRequest, applyAuthTokenInterceptor } from 'axios-jwt'
import axios from 'axios'

const BASE_URL = 'https://api.example.com'

// 1. Create an axios instance that you wish to apply the interceptor to
export const apiClient = axios.create({ baseURL: BASE_URL })

// 2. Define token refresh function.
const requestRefresh: TokenRefreshRequest = async (refreshToken: string): Promise<string> => {

  // Important! Do NOT use the axios instance that you supplied to applyAuthTokenInterceptor (in our case 'apiClient')
  // because this will result in an infinite loop when trying to refresh the token.
  // Use the global axios client or a different instance
  const response = await axios.post(`${BASE_URL}/auth/refresh_token`, { token: refreshToken })

  return response.data.access_token
}

// 3. Add interceptor to your axios instance
applyAuthTokenInterceptor(apiClient, { requestRefresh })
```

### Login/logout

```typescript
// login.ts

import { isLoggedIn, setAuthTokens, clearAuthTokens, getAccessToken, getRefreshToken } from 'axios-jwt'
import { apiClient } from '../apiClient'

// 4. Post email and password and get tokens in return. Call setAuthTokens with the result.
const login = async (params: ILoginRequest) => {
  const response = await apiClient.post('/auth/login', params)

  // save tokens to storage
  setAuthTokens({
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token
  })
}

// 5. Clear the auth tokens from localstorage
const logout = () => clearAuthTokens()

// Check if refresh token exists
if (isLoggedIn()) {
  // assume we are logged in because we have a refresh token
}

// Get access to tokens
const accessToken = getAccessToken()
const refreshToken = getRefreshToken()
```

## Configuration

```typescript
applyAuthTokenInterceptor(apiClient, {
  requestRefresh,  // async function that takes a refreshToken and returns a promise the resolves in a fresh accessToken
  header = "Authorization",  // header name
  headerPrefix = "Bearer ",  // header value prefix
})
```

## Caveats

- Your backend should allow a few seconds of leeway between when the token expires and when it actually becomes unusable.

## Non-TypeScript implementation

```javascript
import { applyAuthTokenInterceptor } from 'axios-jwt';
import axios from 'axios';

const BASE_URL = 'https://api.example.com'

// 1. Create an axios instance that you wish to apply the interceptor to
const apiClient = axios.create({ baseURL: BASE_URL })

// 2. Define token refresh function.
const requestRefresh = (refresh) => {
    // Notice that this is the global axios instance, not the apiClient!  <-- important
    return axios.post(`${BASE_URL}/auth/refresh_token`, { refresh })
      .then(response => resolve(response.data.access_token))
};

// 3. Apply interceptor
applyAuthTokenInterceptor(apiClient, { requestRefresh });  // Notice that this uses the apiClient instance.  <-- important

// 4. Logging in
const login = async (params) => {
  const response = await apiClient.post('/auth/login', params)

  // save tokens to storage
  setAuthTokens({
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token
  })
}

// 5. Logging out
const logout = () => clearAuthTokens()

// Now just make all requests using your apiClient instance
apiClient.get('/api/endpoint/that/requires/login').then(response => { })

```
