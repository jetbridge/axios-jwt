import { AxiosRequestConfig } from 'axios'
import jwt from 'jsonwebtoken'
import { authTokenInterceptor } from '../index'

describe('authTokenInterceptor', () => {
  it('returns the original request config if refresh token is not set', async () => {
    // GIVEN
    // I have a config defined
    const config = {
      header: 'Authorization',
      headerPrefix: 'Bearer ',
      requestRefresh: async (token: string) => token,
    }

    // and I have a request config
    const exampleConfig: AxiosRequestConfig = {
      url: 'https://example.com',
      method: 'POST',
    }

    // WHEN
    // I create the interceptor and call it
    const interceptor = authTokenInterceptor(config)

    const result = await interceptor(exampleConfig)

    // THEN
    // I expect the result config to not have changed
    expect(result).toEqual({
      url: 'https://example.com',
      method: 'POST',
    })
  })

  it('sets the original access token as header if has not yet expired', async () => {
    // GIVEN
    // I have an access token that expired an hour ago
    const expiredToken = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) - 60 * 60,
        data: 'foobar',
      },
      'secret'
    )

    // and this token is stored in local storage
    const tokens = { accessToken: expiredToken, refreshToken: 'refreshtoken' }
    localStorage.setItem('auth-tokens-test', JSON.stringify(tokens))

    // and I have a config defined
    const config = {
      header: 'Auth',
      headerPrefix: 'Prefix ',
      requestRefresh: async () => 'newtoken',
    }

    // and I have a request config
    const exampleConfig: AxiosRequestConfig = {
      url: 'https://example.com',
      method: 'POST',
      headers: {},
    }

    // WHEN
    // I create the interceptor and call it
    const interceptor = authTokenInterceptor(config)
    const result = await interceptor(exampleConfig)

    // THEN
    // I expect the result to have an updated header
    expect(result).toEqual({
      ...exampleConfig,
      headers: {
        Auth: 'Prefix newtoken',
      },
    })
  })

  it('throws an error if refreshTokenIfNeeded produces one', async () => {
    // GIVEN
    // I have an access token that expired an hour ago
    const expiredToken = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) - 60 * 60,
        data: 'foobar',
      },
      'secret'
    )

    // and this token is stored in local storage
    const tokens = { accessToken: expiredToken, refreshToken: 'refreshtoken' }
    localStorage.setItem('auth-tokens-test', JSON.stringify(tokens))

    // and I have a config defined
    const config = {
      header: 'Auth',
      headerPrefix: 'Prefix ',
      requestRefresh: async () => {
        throw new Error('Example error')
      },
    }

    // and I have a request config
    const exampleConfig: AxiosRequestConfig = {
      url: 'https://example.com',
      method: 'POST',
      headers: {},
    }

    // and I have an error handler
    const catchFn = jest.fn()

    // WHEN
    // I create the interceptor and call it
    const interceptor = authTokenInterceptor(config)
    await interceptor(exampleConfig).catch(catchFn)

    // THEN
    // I expect the error handler to have been called to have an updated header
    const errorMsg =
      'Unable to refresh access token for request due to token refresh error: Failed to refresh auth token: Example error'
    expect(catchFn).toHaveBeenCalledWith(new Error(errorMsg))
  })

  it('refreshes the access token and sets it as header if it has expired', async () => {
    // GIVEN
    // I have an access token that expired an hour ago
    const expiredToken = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) - 60 * 60,
        data: 'foobar',
      },
      'secret'
    )

    // and this token is stored in local storage
    const tokens = { accessToken: expiredToken, refreshToken: 'refreshtoken' }
    localStorage.setItem('auth-tokens-test', JSON.stringify(tokens))

    // and I have a config defined
    const config = {
      header: 'Auth',
      headerPrefix: 'Prefix ',
      requestRefresh: async () => 'updatedaccesstoken',
    }

    // and I have a request config
    const exampleConfig: AxiosRequestConfig = {
      url: 'https://example.com',
      method: 'POST',
      headers: {},
    }

    // WHEN
    // I create the interceptor and call it
    const interceptor = authTokenInterceptor(config)
    const result = await interceptor(exampleConfig)

    // THEN
    // I expect the result to have an updated header
    expect(result).toEqual({
      ...exampleConfig,
      headers: {
        Auth: 'Prefix updatedaccesstoken',
      },
    })
  })

  it('puts requests in the queue while tokens are being refreshed', async () => {
    // GIVEN
    // We are counting the number of times a token is being refreshed
    let refreshes = 0

    // I have an access token that expired an hour ago
    const expiredToken = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) - 60 * 60,
        data: 'foobar',
      },
      'secret'
    )

    // and this token is stored in local storage
    const tokens = { accessToken: expiredToken, refreshToken: 'refreshtoken' }
    localStorage.setItem('auth-tokens-test', JSON.stringify(tokens))

    // and I have a config defined
    const config = {
      requestRefresh: async () => {
        refreshes++

        await new Promise((resolve) => setTimeout(resolve, 100))

        return 'updatedaccesstoken'
      },
    }

    // and I have a request config
    const exampleConfig: AxiosRequestConfig = {
      url: 'https://example.com',
      method: 'POST',
      headers: {},
    }

    // WHEN
    // I create 3 interceptor and call them all at once
    const interceptor = authTokenInterceptor(config)
    const results = await Promise.all([
      interceptor(exampleConfig),
      interceptor(exampleConfig),
      interceptor(exampleConfig),
    ])

    // THEN
    // I expect the result to have an updated header
    expect(results[0].headers).toEqual({ Authorization: 'Bearer updatedaccesstoken' })

    // and the number of refreshes to be 1
    expect(refreshes).toEqual(1)
  })
})
