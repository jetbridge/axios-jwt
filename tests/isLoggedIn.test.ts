import { STORAGE_KEY } from '../src/StorageKey'
import { isLoggedIn } from '../index'

describe('isLoggedIn', () => {
  it('returns false if tokens are not set', async () => {
    // GIVEN
    // localStorage is empty
    localStorage.removeItem(STORAGE_KEY)

    // WHEN
    // I call isLoggedIn
    const result = await isLoggedIn()

    // THEN
    // I expect the result to be false
    expect(result).toEqual(false)
  })

  it('returns true if refresh token is set', async () => {
    // GIVEN
    // Both tokens are stored in localstorage
    const tokens = { accessToken: 'accesstoken', refreshToken: 'refreshtoken' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))

    // WHEN
    // I call isLoggedIn
    const result = await isLoggedIn()

    // THEN
    // I expect the result to be true
    expect(result).toEqual(true)
  })
})
