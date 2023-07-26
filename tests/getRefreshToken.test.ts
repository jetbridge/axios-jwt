import { getRefreshToken } from '../index'
import { STORAGE_KEY } from '../src/StorageKey'

describe('getRefreshToken', () => {
  it('returns undefined if tokens are not set', async () => {
    // GIVEN
    // localStorage is empty
    localStorage.removeItem(STORAGE_KEY)

    // WHEN
    // I call getRefreshToken
    const result = await getRefreshToken()

    // THEN
    // I expect the result to be undefined
    expect(result).toEqual(undefined)
  })

  it('returns the access token is it is set', async () => {
    // GIVEN
    // Both tokens are stored in localstorage
    const tokens = { accessToken: 'accesstoken', refreshToken: 'refreshtoken' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))

    // WHEN
    // I call getRefreshToken
    const result = await getRefreshToken()

    // THEN
    // I expect the result to be the supplied refresh token
    expect(result).toEqual('refreshtoken')
  })
})
