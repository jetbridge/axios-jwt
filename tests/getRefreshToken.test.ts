import { getRefreshToken } from '../src'

describe('getRefreshToken', () => {
  it('returns undefined if tokens are not set', () => {
    // GIVEN
    // localStorage is empty
    localStorage.removeItem('auth-tokens-test')

    // WHEN
    // I call getRefreshToken
    const result = getRefreshToken()

    // THEN
    // I expect the result to be undefined
    expect(result).toEqual(undefined)
  })

  it('returns the access token is it is set', () => {
    // GIVEN
    // Both tokens are stored in localstorage
    const tokens = { accessToken: 'accesstoken', refreshToken: 'refreshtoken' }
    localStorage.setItem('auth-tokens-test', JSON.stringify(tokens))

    // WHEN
    // I call getRefreshToken
    const result = getRefreshToken()

    // THEN
    // I expect the result to be the supplied refresh token
    expect(result).toEqual('refreshtoken')
  })
})
