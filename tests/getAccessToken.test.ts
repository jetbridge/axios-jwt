import { STORAGE_KEY, getAccessToken } from '../src'

describe('getAccessToken', () => {
  it('returns undefined if tokens are not set', () => {
    // GIVEN
    // localStorage is empty
    localStorage.removeItem(STORAGE_KEY)

    // WHEN
    // I call getAccessToken
    const result = getAccessToken()

    // THEN
    // I expect the result to be undefined
    expect(result).toEqual(undefined)
  })

  it('returns the access token is it is set', () => {
    // GIVEN
    // Both tokens are stored in localstorage
    const tokens = { accessToken: 'accesstoken', refreshToken: 'refreshtoken' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))

    // WHEN
    // I call getAccessToken
    const result = getAccessToken()

    // THEN
    // I expect the result to be the supplied access token
    expect(result).toEqual('accesstoken')
  })
})
