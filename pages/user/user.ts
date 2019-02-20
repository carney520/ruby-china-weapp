import { IApp } from '../../app'

const app = getApp<IApp>()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    currentUser: app.globalData.user
  } as {
    currentUser?: UserDetail
  },
  onLoad() {
    app.onUserStateChange(this.handleUserStateChange)
  },
  onUnload: function() {
    app.offUserStateChange(this.handleUserStateChange)
  },
  onPullDownRefresh: function() {},
  handleLogout() {
    app.logout()
  },
  handleUserStateChange(user: UserDetail | null) {
    this.setData!({ currentUser: user })
  }
})
