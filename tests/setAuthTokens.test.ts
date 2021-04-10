import { STORAGE_KEY, setAuthTokens } from '../src'

describe('setAuthTokens', () => {
  it('stores the tokens in localstorage', () => {
    // GIVEN
    // localStorage is empty
    localStorage.removeItem(STORAGE_KEY)

    // WHEN
    // I call setAuthTokens
    const tokens = { accessToken: 'accesstoken', refreshToken: 'refreshtoken' }
    setAuthTokens(tokens)

    // THEN
    // I expect them to have been stored in localstorage
    const storedTokens = localStorage.getItem(STORAGE_KEY) as string
    expect(JSON.parse(storedTokens)).toEqual(tokens)
  })
})
