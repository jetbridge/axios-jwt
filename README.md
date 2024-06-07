# axios-jwt

Store, clear, transmit and automatically refresh JWT authentication tokens. This library can be used in both web and react-native projects.

## What does it do?

Applies a request interceptor to your axios instance.

The interceptor automatically adds an access token header (default: `Authorization`) to all requests.
It stores `accessToken` and `refreshToken` in `localStorage` (web) or 'AsyncStorage' (React Native) and reads them when needed.

It parses the expiration time of your access token and checks to see if it is expired before every request. If it has expired, a request to
refresh and store a new access token is automatically performed before the request proceeds.

## Installation instructions

### Install axios-jwt

```bash
npm install --save axios-jwt # or `yarn add axios-jwt`
```

### Additional steps for React Native projects

You will also need to install react-native-async-storage in order to be able to store and retrieve tokens.

#### Expo

```bash
expo install @react-native-async-storage/async-storage
```

### React Native

```bash
npm install --save @react-native-async-storage/async-storage # or `yarn add @react-native-async-storage/async-storage`
npx pod-install # installs the native iOS packages
```

## How do I use it?

1. Create an axios instance
2. Define a token refresh function
3. Configure the interceptor
4. Store tokens on login with `setAuthTokens()`
5. Clear tokens on logout with `clearAuthTokens()`

### Applying the interceptor

```typescript
// api.ts

import { IAuthTokens, TokenRefreshRequest, applyAuthTokenInterceptor, getBrowserLocalStorage } from 'axios-jwt'
import axios from 'axios'

const BASE_URL = 'https://api.example.com'

// 1. Create an axios instance that you wish to apply the interceptor to
export const axiosInstance = axios.create({ baseURL: BASE_URL })

// 2. Define token refresh function.
const requestRefresh: TokenRefreshRequest = async (refreshToken: string): Promise<IAuthTokens | string> => {

  // Important! Do NOT use the axios instance that you supplied to applyAuthTokenInterceptor (in our case 'axiosInstance')
  // because this will result in an infinite loop when trying to refresh the token.
  // Use the global axios client or a different instance
  const response = await axios.post(`${BASE_URL}/auth/refresh_token`, { token: refreshToken })

  // If your backend supports rotating refresh tokens, you may also choose to return an object containing both tokens:
  // return {
  //  accessToken: response.data.access_token,
  //  refreshToken: response.data.refresh_token
  //}

  return response.data.access_token
}

// 3. Add interceptor to your axios instance
applyAuthTokenInterceptor(axiosInstance, { requestRefresh })

// New to 2.2.0+: initialize with storage: localStorage/sessionStorage/nativeStorage. Helpers: getBrowserLocalStorage, getBrowserSessionStorage
const getStorage = getBrowserLocalStorage

// You can create you own storage, it has to comply with type StorageType
applyAuthTokenInterceptor(axiosInstance, { requestRefresh, getStorage })
```

### Login/logout

```typescript
// login.ts

import { isLoggedIn, setAuthTokens, clearAuthTokens, getAccessToken, getRefreshToken } from 'axios-jwt'
import { axiosInstance } from './api'

// 4. Post email and password and get tokens in return. Call setAuthTokens with the result.
const login = async (params: ILoginRequest) => {
  const response = await axiosInstance.post('/auth/login', params)

  // save tokens to storage
  setAuthTokens({
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token
  })
}

// 5. Remove the auth tokens from storage
const logout = async () => await clearAuthTokens()

// Check if refresh token exists
if (await isLoggedIn()) {
  // assume we are logged in because we have a refresh token
}

// Get access to tokens
const accessToken = await getAccessToken()
const refreshToken = await getRefreshToken()
```

## Configuration

```typescript
applyAuthTokenInterceptor(axiosInstance, {
  requestRefresh,  // async function that takes a refreshToken and returns a promise the resolves in a fresh accessToken
  header: "Authorization",  // header name
  headerPrefix: "Bearer ",  // header value prefix
})
```

## Caveats

- Your backend should allow a few seconds of leeway between when the token expires and when it actually becomes unusable.

## Non-TypeScript implementation

```javascript
import { applyAuthTokenInterceptor, setAuthTokens, clearAuthTokens } from 'axios-jwt';
import axios from 'axios';

const BASE_URL = 'https://api.example.com'

// 1. Create an axios instance that you wish to apply the interceptor to
const axiosInstance = axios.create({ baseURL: BASE_URL })

// 2. Define token refresh function.
const requestRefresh = (refresh) => {
    // Notice that this is the global axios instance, not the axiosInstance!  <-- important
    return axios.post(`${BASE_URL}/auth/refresh_token`, { refresh })
      .then(response => response.data.access_token)
};

// 3. Apply interceptor
applyAuthTokenInterceptor(axiosInstance, { requestRefresh });  // Notice that this uses the axiosInstance instance.  <-- important

// 4. Logging in
const login = async (params) => {
  const response = await axiosInstance.post('/auth/login', params)

  // save tokens to storage
  setAuthTokens({
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token
  })
}

// 5. Logging out
const logout = () => clearAuthTokens()

// Now just make all requests using your axiosInstance instance
axiosInstance.get('/api/endpoint/that/requires/login').then(response => { })

```
