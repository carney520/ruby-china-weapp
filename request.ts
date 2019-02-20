import OAuth from './utils/oauth'
import { IApp } from './app'
import { reenterablePromise } from './utils/util'

export type Method = wx.RequestOption['method']
export class RequestError {
  constructor(
    public status: number,
    public message: string,
    public data: any
  ) {}
}

export const HOST = 'https://ruby-china.org'
export const CLIENT_ID = '3e336ed1'
export const CLIENT_SECRET =
  'fbfd23686dd18b414d01fe1e2dbf7d842a82baf59b0406d2622167cf4e0b5060'

export const auth = new OAuth({
  auth: {
    tokenHost: HOST
  },
  client: {
    id: CLIENT_ID,
    secret: CLIENT_SECRET
  }
})

const requestClientToken = reenterablePromise(() =>
  auth.clientCredentials.getToken()
)

const ErrorMessage: { [key: string]: string } = {
  400: '参数不符合 API 的要求',
  401: '用户认证失败',
  403: '无操作权限',
  404: '资源不存在',
  500: '服务器异常',
  'request:fail': '网络连接异常, 请稍后重试'
}

/**
 * 登录
 */
export async function login(username: string, password: string) {
  try {
    await auth.password.getToken({ username, password })
  } catch (err) {
    if (err instanceof OAuth.RequestError) {
      err.message =
        err.status === 401
          ? '用户名或密码错误'
          : ErrorMessage[err.message] || err.message
    }
    throw err
  }
}

/**
 * 接口请求
 */
export default async function request<R = any>(
  method: Method,
  path: string,
  params: { [key: string]: string } = {},
  retry: boolean = true
): Promise<R> {
  let token = auth.retrieveToken()

  if (token == null || token.expired()) {
    token = await requestClientToken()
  }

  const url = `${HOST}${path}`
  params['access_token'] = token.getToken()

  return new Promise<R>((res, rej) => {
    wx.request({
      url,
      method,
      data: params,
      success: result => {
        const { statusCode } = result
        if (statusCode === 200 || statusCode === 201) {
          res(result.data as R)
        } else if (statusCode === 401 && retry) {
          // 重试
          const app = getApp<IApp>()
          app.logout()
          request(method, path, params, false).then(res, rej)
        } else {
          rej(
            new RequestError(
              statusCode,
              ErrorMessage[statusCode] || statusCode.toString(),
              result.data
            )
          )
        }
      },
      fail: err => {
        const errStr = err.errMsg.trim()
        rej(new Error(ErrorMessage[errStr] || errStr))
      }
    })
  })
}

export function get<R = any>(path: string, params?: any) {
  return request<R>('GET', path, params)
}

export function post<R = any>(path: string, params?: any) {
  return request<R>('POST', path, params)
}
