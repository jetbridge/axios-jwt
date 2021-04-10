import { isLoggedIn } from '../src'

describe('isLoggedIn', () => {
  it('returns false if tokens are not set', () => {
    // GIVEN
    // localStorage is empty
    localStorage.removeItem('auth-tokens-test')

    // WHEN
    // I call isLoggedIn
    const result = isLoggedIn()

    // THEN
    // I expect the result to be false
    expect(result).toEqual(false)
  })

  it('returns true if refresh token is set', () => {
    // GIVEN
    // Both tokens are stored in localstorage
    const tokens = { accessToken: 'accesstoken', refreshToken: 'refreshtoken' }
    localStorage.setItem('auth-tokens-test', JSON.stringify(tokens))

    // WHEN
    // I call isLoggedIn
    const result = isLoggedIn()

    // THEN
    // I expect the result to be true
    expect(result).toEqual(true)
  })
})