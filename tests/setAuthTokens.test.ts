import { setAuthTokens } from '../index'
import { STORAGE_KEY } from '../src/StorageKey'

describe('setAuthTokens', () => {
  it('stores the tokens in localstorage', async () => {
    // GIVEN
    // localStorage is empty
    localStorage.removeItem(STORAGE_KEY)

    // WHEN
    // I call setAuthTokens
    const tokens = { accessToken: 'accesstoken', refreshToken: 'refreshtoken' }
    await setAuthTokens(tokens)

    // THEN
    // I expect them to have been stored in localstorage
    const storedTokens = localStorage.getItem(STORAGE_KEY) as string
    expect(JSON.parse(storedTokens)).toEqual(tokens)
  })
})
