import { STORAGE_KEY } from '../src/StorageKey'
import { clearAuthTokens } from '../index'

describe('clearAuthTokens', () => {
  it('removes the tokens from localstorage', async () => {
    // GIVEN
    // Tokens are stored in localStorage
    const tokens = { accessToken: 'accesstoken', refreshToken: 'refreshtoken' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))

    // WHEN
    // I call clearAuthTokens
    await clearAuthTokens()

    // THEN
    // I expect the localstorage to be empty
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
