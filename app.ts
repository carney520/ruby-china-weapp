//app.ts
import { get, auth } from './request'

export type UserStateListener = (user: UserDetail | null) => void
export interface IApp {
  globalData: {
    user?: UserDetail
  }
  // 触发更新用户信息
  updateUserInfo(): Promise<void>
  logout(): void
  // 监听登入和登出
  onUserStateChange(callback: UserStateListener): void
  offUserStateChange(callback: UserStateListener): void
}

const USER_INFO_KEY = '__user__'

App({
  userStateListeners: [] as UserStateListener[],
  globalData: {
    user: wx.getStorageSync(USER_INFO_KEY) || undefined
  } as IApp['globalData'],

  async onLaunch() {
    try {
      await this.updateUserInfo()
    } catch (err) {
      // 用户信息更新失败
      console.warn('用户信息更新失败', err)
    }
  },

  onUserStateChange(callback: UserStateListener) {
    this.userStateListeners.push(callback)
  },

  offUserStateChange(callback: UserStateListener) {
    const idx = this.userStateListeners.indexOf(callback)
    if (idx !== -1) {
      this.userStateListeners.splice(idx, 1)
    }
  },

  notifyUserStateChange() {
    this.userStateListeners.forEach(i => i(this.globalData.user || null))
  },

  async updateUserInfo() {
    const url = `/api/v3/users/me`
    const res = await get<{ user?: UserDetail }>(url)
    this.globalData.user = res.user
    this.notifyUserStateChange()
    wx.setStorageSync(USER_INFO_KEY, res.user)
  },

  logout() {
    auth.clearToken()
    wx.removeStorageSync(USER_INFO_KEY)
    this.globalData.user = undefined
    this.notifyUserStateChange()
  }
})
