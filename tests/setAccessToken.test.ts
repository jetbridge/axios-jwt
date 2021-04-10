import { STORAGE_KEY, setAccessToken } from '../src'

describe('setAccessToken', () => {
  it('throws an error if there are no tokens stored', () => {
    // GIVEN
    // localStorage is empty
    localStorage.removeItem(STORAGE_KEY)

    // WHEN
    // I call setAccessToken
    // THEN
    // I expect an error to have been thrown
    expect(() => {
      setAccessToken('accesstoken')
    }).toThrow('Unable to update access token since there are not tokens currently stored')
  })

  it('throws an error if the stored tokens cannot be parsed', () => {
    // GIVEN
    // localStorage is empty
    localStorage.setItem(STORAGE_KEY, 'totallynotjson')

    // WHEN
    // I call setAuthTokens
    // THEN
    // I expect an error to be thrown
    expect(() => {
      setAccessToken('accesstoken')
    }).toThrow('Failed to parse auth tokens: totallynotjson')
  })

  it('stores the tokens in localstorage', () => {
    // GIVEN
    // localStorage is empty
    const tokens = { accessToken: 'accesstoken', refreshToken: 'refreshtoken' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens))

    // WHEN
    // I call setAccessToken
    setAccessToken('newaccesstoken')

    // THEN
    // I expect the stored access token to have been updated
    const storedTokens = localStorage.getItem(STORAGE_KEY) as string
    expect(JSON.parse(storedTokens)).toEqual({ accessToken: 'newaccesstoken', refreshToken: 'refreshtoken' })
  })
})
