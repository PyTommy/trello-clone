import bcrypt from 'bcrypt'
import { environment } from '../environments/environment'
import jwt from 'jsonwebtoken'

type CookieKey = 'Authorization' | 'Max-Age'

interface TokenData {
  token: string
  expiresIn: number
}

interface DataStoredInToken {
  _id: string
}

interface IAuthUtil {
  hash(str: string): Promise<string>
  createToken(userId: string): TokenData
  isPasswordMaching(password: string, password_hash: string): Promise<boolean>
  createCookie(tokenData: TokenData): string
  getCookieValue(cookie: string, key: CookieKey): string | undefined
}

class AuthUtilsImpl implements IAuthUtil {
  async hash(str: string): Promise<string> {
    return bcrypt.hash(str, 8)
  }
  createToken(userId: string): TokenData {
    const expiresIn = 60 * 60 * 24 * 7 // 7 days
    const secret = environment.jwt_secret
    const dataStoredInToken: DataStoredInToken = {
      _id: userId,
    }
    return {
      expiresIn,
      token: jwt.sign(dataStoredInToken, secret, { expiresIn }),
    }
  }
  isPasswordMaching(password: string, password_hash: string): Promise<boolean> {
    return bcrypt.compare(password, password_hash)
  }
  createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`
  }
  getCookieValue(cookie: string, key: CookieKey): string | undefined {
    const regexp = new RegExp(`.*${key}=([^;]*)`)
    const result = regexp.exec(cookie)
    if (result) {
      return result[1]
    }
  }
}

export const authUtils = new AuthUtilsImpl()
