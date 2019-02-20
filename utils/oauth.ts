/**
 * Oauth for miniprogram
 */
import { stringify } from 'qs'
import { base64Encode } from './base64'

/**
 * OAuth配置
 */
export interface Credentials {
  auth: {
    tokenHost: string
    authorizeHost?: string
    authorizePath?: string
    tokenPath?: string
    revokePath?: string
    expirationWindow?: number
  }
  client?: {
    id: string
    secret: string
    secretParamName?: string
    idParamName?: string
  }
  request?: {
    authorizationMethod: 'header' | 'body'
    bodyFormat?: 'form' | 'json'
  }
}

/**
 * OAuth2 规范的token响应
 */
export interface Token {
  access_token: string
  token_type: string
  created_at?: number // second
  expires_in: number // second
  refresh_token?: string
  scope?: string
}

type Record = { [key: string]: string | undefined }

interface CredentialsNormalized {
  auth: {
    tokenHost: string
    authorizeHost: string
    authorizePath: string
    tokenPath: string
    revokePath: string
    expirationWindow: number
  }
  client: {
    id: string
    secret: string
    secretParamName: string
    idParamName: string
  }
  request: {
    authorizationMethod: 'header' | 'body'
    bodyFormat: 'form' | 'json'
  }
}

const DEFAULT_AUTH = {
  authorizePath: '/oauth/authorize',
  tokenPath: '/oauth/token',
  revokePath: '/oauth/revoke',
  expirationWindow: 300
}

const DEFAULT_CLIENT = {
  secretParamName: 'client_secret',
  idParamName: 'client_id'
}

const DEFAULT_REQUEST = {
  authorizationMethod: 'header',
  bodyFormat: 'form'
}

const STORAGE_KEY = '__token__'

/**
 * 表示一个Token对象
 */
export class OAuthToken {
  private token: Token
  public constructor(token: Token) {
    this.token = { ...token }
    if (this.token.created_at == null) {
      this.token.created_at = Date.now() / 1000
    }
  }

  /**
   * 判断当前token是否过期
   */
  public expired() {
    const { created_at, expires_in } = this.token
    const expiredTime = created_at! + expires_in
    return Date.now() / 1000 >= expiredTime
  }

  public getToken() {
    return this.token.access_token
  }

  public getRawToken() {
    return this.token
  }

  // TODO: revoke
}

export default class OAuth {
  public static RequestError = class {
    constructor(
      public status: number,
      public message: string,
      public data: any
    ) {}
  }

  public clientCredentials = {
    getToken: async (params: { scope?: string } = {}) => {
      const options: Record = { ...params, grant_type: 'client_credentials' }
      const token = await this.request(this.tokenPath, options)
      return this.createToken(token)
    }
  }

  public password = {
    getToken: async (params: {
      username: string
      password: string
      scope?: string
    }) => {
      const options: Record = { ...params, grant_type: 'password' }
      const token = await this.request(this.tokenPath, options)
      return this.createToken(token)
    }
  }

  private credentials: CredentialsNormalized
  private get tokenPath() {
    return this.credentials.auth.tokenHost + this.credentials.auth.tokenPath
  }

  public constructor(credentials: Credentials) {
    this.credentials = this.normalizedCredentials(credentials)
  }

  /**
   * 获取缓存的Token
   */
  public retrieveToken(): OAuthToken | undefined {
    return this.getToken()
  }

  /**
   * 判断是否可以刷新. 客户端是无法获取到refreshToken的
   */
  public refreshable(token: OAuthToken) {
    const raw = token.getRawToken()
    const expiredTime = raw.created_at! + raw.expires_in
    const now = Date.now() / 1000

    return (
      raw.refresh_token &&
      expiredTime - now < this.credentials.auth.expirationWindow
    )
  }

  public async tryRefresh(token: OAuthToken, params: Record = {}) {
    if (this.refreshable(token)) {
      this.refresh(token, params)
    }
  }

  /**
   * 刷新Token
   */
  public async refresh(token: OAuthToken, params: Record = {}) {
    const raw = token.getRawToken()
    const finalParams = {
      ...params,
      grant_type: 'refresh_token',
      refresh_token: raw.refresh_token
    }
    const newToken = await this.request(this.tokenPath, finalParams)
    const tokenObject = new OAuthToken(newToken)
    this.saveToken(tokenObject)
    return tokenObject
  }

  private createToken(token: Token) {
    const tokenObject = new OAuthToken(token)
    this.saveToken(tokenObject)
    return tokenObject
  }

  /**
   * 规范化选项
   */
  private normalizedCredentials(
    credentials: Credentials
  ): CredentialsNormalized {
    const normalized: any = {
      ...credentials
    }

    normalized.auth = {
      ...DEFAULT_AUTH,
      authorizeHost: credentials.auth.tokenHost,
      ...credentials.auth
    }

    normalized.request = {
      ...DEFAULT_REQUEST,
      ...(credentials.request || {})
    }

    normalized.client = {
      ...DEFAULT_CLIENT,
      ...(credentials.client || {})
    }

    return normalized as CredentialsNormalized
  }

  private request(url: string, options: Record) {
    const headers: Record = {}
    const payload: Record = { ...options }
    const { id, secret, idParamName, secretParamName } = this.credentials.client

    if (this.credentials.request.authorizationMethod === 'header') {
      // 通过报头鉴权
      const basicHeader = getAuthorizationHeaderToken(id, secret)
      headers['Authorization'] = `Basic ${basicHeader}`
    } else {
      // 通过body鉴权
      payload[idParamName] = id
      payload[secretParamName] = secret
    }

    // 表述格式
    if (this.credentials.request.bodyFormat === 'form') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded'
      return this.rawRequest(url, headers, stringify(payload))
    } else {
      headers['Content-Type'] = 'application/json'
      return this.rawRequest(url, headers, payload)
    }
  }

  private saveToken(token: OAuthToken) {
    wx.setStorageSync(STORAGE_KEY, token.getRawToken())
  }

  private getToken(): OAuthToken | undefined {
    const data = wx.getStorageSync(STORAGE_KEY)
    if (data) {
      return new OAuthToken(data)
    }
    return undefined
  }

  public clearToken() {
    wx.removeStorageSync(STORAGE_KEY)
  }

  // TODO: 支持配置
  private rawRequest(url: string, header: Record, payload: any) {
    return new Promise<any>((res, rej) => {
      wx.request({
        url,
        method: 'POST',
        header,
        data: payload,
        success: result => {
          const { statusCode } = result
          if (statusCode == 200) {
            res(result.data)
          } else {
            rej(
              new OAuth.RequestError(
                statusCode,
                statusCode.toString(),
                result.data
              )
            )
          }
        },
        fail: err => {
          rej(new Error(err.errMsg))
        }
      })
    })
  }
}

function urlEncode(value: string) {
  return encodeURIComponent(value).replace(/%20/g, '+')
}

function getAuthorizationHeaderToken(clientID: string, clientSecret: string) {
  const encodedCredentials = `${urlEncode(clientID)}:${urlEncode(clientSecret)}`

  return base64Encode(encodedCredentials)
}
