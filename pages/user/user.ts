/**
 * 用户页
 */
import { get, post } from '../../request'
import { IApp } from '../../app'

const app = getApp<IApp>()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    currentUser: app.globalData.user
  } as {
    id: string
    loading?: boolean
    error?: Error
    meta?: UserMeta
    user?: UserDetail
    currentUser?: UserDetail
  },
  lastAction: null as string | null,

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query?: { [queryKey: string]: string }) {
    app.onUserStateChange(this.handleUserStateChange)
    const id = query!['id'] || 'lanzhiheng'
    this.setData!({ id: id })
  },

  onUnload() {
    app.offUserStateChange(this.handleUserStateChange)
  },

  onReady() {
    this.load()
  },

  onPullDownRefresh() {
    this.load()
  },

  async load() {
    try {
      this.setData!({ loading: true, error: null })
      const url = `/api/v3/users/${this.data.id}`
      const res = await get<{ user: UserDetail; meta: UserMeta }>(url)
      this.setData!({
        meta: res.meta,
        user: res.user
      })
    } catch (error) {
      this.setData!({ error })
    } finally {
      this.setData!({ loading: false })
    }
  },

  checkLogin() {
    if (!!this.data.currentUser) {
      return true
    } else {
      this.lastAction = 'login'
      wx.navigateTo({ url: '../login/login' })
      return false
    }
  },

  async toggleFollow() {
    if (!this.checkLogin()) {
      return
    }

    const followed = !this.data.meta!.followed
    const url = followed
      ? `/api/v3/users/${this.data.id}/follow`
      : `/api/v3/users/${this.data.id}/unfollow`

    try {
      await post(url)
      this.setData!({ 'meta.followed': followed })
    } catch (err) {
      wx.showToast({ icon: 'none', title: err.message })
    }
  },

  async toggleBlock() {
    if (!this.checkLogin()) {
      return
    }

    const blocked = !this.data.meta!.blocked
    const url = blocked
      ? `/api/v3/users/${this.data.id}/block`
      : `/api/v3/users/${this.data.id}/unblock`

    try {
      await post(url)
      this.setData!({ 'meta.blocked': blocked })
    } catch (err) {
      wx.showToast({ icon: 'none', title: err.message })
    }
  },

  handleUserStateChange(user: UserDetail | null) {
    this.setData!({ currentUser: user })
  }
})
