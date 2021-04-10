import { setAccessToken } from '../src'

describe('setAccessToken', () => {
  it('throws an error if there are no tokens stored', () => {
    // GIVEN
    // localStorage is empty
    localStorage.removeItem('auth-tokens-test')

    // WHEN
    // I call setAccessToken
    // THEN
    // I expect an error to have been thrown
    expect(() => {
      setAccessToken('accesstoken')
    }).toThrow('Unable to update access token since there are not tokens currently stored')
  })

  it('stores the tokens in localstorage', () => {
    // GIVEN
    // localStorage is empty
    const tokens = { accessToken: 'accesstoken', refreshToken: 'refreshtoken' }
    localStorage.setItem('auth-tokens-test', JSON.stringify(tokens))

    // WHEN
    // I call setAccessToken
    setAccessToken('newaccesstoken')

    // THEN
    // I expect the stored access token to have been updated
    const storedTokens = localStorage.getItem('auth-tokens-test') as string
    expect(JSON.parse(storedTokens)).toEqual({ accessToken: 'newaccesstoken', refreshToken: 'refreshtoken' })
  })
})
