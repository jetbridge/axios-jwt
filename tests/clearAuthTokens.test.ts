import { clearAuthTokens } from '../src'

describe('clearAuthTokens', () => {
  it('removes the tokens from localstorage', () => {
    // GIVEN
    // Tokens are stored in localStorage
    const tokens = { accessToken: 'accesstoken', refreshToken: 'refreshtoken' }
    localStorage.setItem('auth-tokens-test', JSON.stringify(tokens))

    // WHEN
    // I call clearAuthTokens
    clearAuthTokens()

    // THEN
    // I expect the localstorage to be empty
    expect(localStorage.getItem('auth-tokens-test')).toBeNull()
  })
})
