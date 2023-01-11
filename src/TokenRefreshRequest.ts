import { Token } from './Token'
import { IAuthTokens } from './IAuthTokens'

export type TokenRefreshRequest = (refreshToken: Token) => Promise<Token | IAuthTokens>
