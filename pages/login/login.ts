/**
 * 登录页面
 */
import { login } from '../../request'
import { IApp } from '../../app'

const app = getApp<IApp>()
const LOGIN_ACCOUNT_KEY = '__account__'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    account: wx.getStorageSync(LOGIN_ACCOUNT_KEY) || '',
    loading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async handleSubmit(
    evt: WxSubmitEvent<{ account: string; password: string }>
  ) {
    const { account, password } = evt.detail.value
    if (account.trim() === '') {
      wx.showToast({ icon: 'none', title: '请输入账号' })
      return
    }

    if (password.trim() === '') {
      wx.showToast({ icon: 'none', title: '请输入密码' })
      return
    }

    try {
      this.setData!({ loading: true })
      await login(account, password)
      await app.updateUserInfo()
      wx.setStorage({ key: LOGIN_ACCOUNT_KEY, data: account })
      wx.navigateBack({ delta: 1 })
      wx.showToast({ title: '登录成功' })
    } catch (err) {
      wx.showToast({ icon: 'none', title: err.message })
    } finally {
      this.setData!({ loading: false })
    }
  }
})
