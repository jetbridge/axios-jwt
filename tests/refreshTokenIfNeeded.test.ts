import { refreshTokenIfNeeded } from '../src'
import jwt from 'jsonwebtoken'

describe('refreshTokenIfNeeded', () => {
  it('throws an error if the requestRefresh function threw one', async () => {
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

    // and I have a requestRefresh function that throws an error
    const requestRefresh = async () => {
      throw new Error('Server error')
    }

    // and I have an error handler
    const catchFn = jest.fn()

    // WHEN
    // I call refreshTokenIfNeeded
    await refreshTokenIfNeeded(requestRefresh).catch(catchFn)

    // THEN
    // I expect the error handler to have been called with the right error
    expect(catchFn).toHaveBeenLastCalledWith(new Error('Failed to refresh auth token: Server error'))
  })

  it('throws an error and clears the storage if the requestRefresh function throws an error with a 401 status code', async () => {
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

    // and I have a requestRefresh function that throws an error
    const requestRefresh = async () => {
      const error: any = new Error('Server error')
      error.response = {
        status: 401,
      }

      throw error
    }

    // and I have an error handler
    const catchFn = jest.fn()

    // WHEN
    // I call refreshTokenIfNeeded
    await refreshTokenIfNeeded(requestRefresh).catch(catchFn)

    // THEN
    // I expect the error handler to have been called with the right error
    expect(catchFn).toHaveBeenLastCalledWith(new Error('Got 401 on token refresh; clearing both auth tokens'))
    // and the storage to have been cleared
    expect(localStorage.getItem('auth-tokens-test')).toBeNull()
  })

  it('throws an error and clears the storage if the requestRefresh function throws an error with a 422 status code', async () => {
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

    // and I have a requestRefresh function that throws an error
    const requestRefresh = async () => {
      const error: any = new Error('Server error')
      error.response = {
        status: 422,
      }

      throw error
    }

    // and I have an error handler
    const catchFn = jest.fn()

    // WHEN
    // I call refreshTokenIfNeeded
    await refreshTokenIfNeeded(requestRefresh).catch(catchFn)

    // THEN
    // I expect the error handler to have been called with the right error
    expect(catchFn).toHaveBeenLastCalledWith(new Error('Got 422 on token refresh; clearing both auth tokens'))
    // and the storage to have been cleared
    expect(localStorage.getItem('auth-tokens-test')).toBeNull()
  })

  it('refreshes the access token if it does not have an expiration', async () => {
    // GIVEN
    // I have an access token that has no expiration
    const expiredToken = jwt.sign(
      {
        data: 'foobar',
      },
      'secret'
    )

    // and this token is stored in local storage
    const tokens = { accessToken: expiredToken, refreshToken: 'refreshtoken' }
    localStorage.setItem('auth-tokens-test', JSON.stringify(tokens))

    // and I have a requestRefresh function that returns an access token
    const requestRefresh = async () => 'newaccesstoken'

    // WHEN
    // I call refreshTokenIfNeeded
    const result = await refreshTokenIfNeeded(requestRefresh)

    // THEN
    // I expect the stored access token to have been updated
    const storedTokens = localStorage.getItem('auth-tokens-test') as string
    expect(JSON.parse(storedTokens)).toEqual({ accessToken: 'newaccesstoken', refreshToken: 'refreshtoken' })

    // and the result to be the new access token
    expect(result).toEqual('newaccesstoken')
  })

  it('refreshes the access token is it has expired', async () => {
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

    // and I have a requestRefresh function that returns an access token
    const requestRefresh = async () => 'newaccesstoken'

    // WHEN
    // I call refreshTokenIfNeeded
    const result = await refreshTokenIfNeeded(requestRefresh)

    // THEN
    // I expect the stored access token to have been updated
    const storedTokens = localStorage.getItem('auth-tokens-test') as string
    expect(JSON.parse(storedTokens)).toEqual({ accessToken: 'newaccesstoken', refreshToken: 'refreshtoken' })

    // and the result to be the new access token
    expect(result).toEqual('newaccesstoken')
  })
})
