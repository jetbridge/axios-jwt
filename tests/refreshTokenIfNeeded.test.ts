import { refreshTokenIfNeeded } from '../src'
import jwt from 'jsonwebtoken'

describe('refreshTokenIfNeeded', () => {
  it('refreshes the access token is it has expired', async () => {
    // GIVEN
    // I have a token that expired an hour ago
    const expiredToken = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) - 60 * 60,
        data: 'foobar',
      },
      'secret'
    )

    // and this token is stored in local storage
    const tokens = { accessToken: expiredToken, refreshToken: 'refreshtoken' }
    localStorage.setItem('auth-tokens-test', JSON.stringify(tokens))

    // and I have a requestRefresh function that returns an access token
    const requestRefresh = async () => 'newaccesstoken'

    // WHEN
    // I call refreshTokenIfNeeded
    const result = await refreshTokenIfNeeded(requestRefresh)

    // THEN
    // I expect the stored access token to have been updated
    const storedTokens = localStorage.getItem('auth-tokens-test') as string
    expect(JSON.parse(storedTokens)).toEqual({ accessToken: 'newaccesstoken', refreshToken: 'refreshtoken' })

    // and the result to be the new access token
    expect(result).toEqual('newaccesstoken')
  })
})
