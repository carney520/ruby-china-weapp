//index.js
//获取应用实例
import { get } from '../../request'

const SystemInfo = wx.getSystemInfoSync()

Page({
  data: {
    statusBarHeight: SystemInfo.statusBarHeight,
    topics: [],
    loading: false,
    nodeLoading: false,
    showNode: false,
    noMore: false
  } as {
    topics: Topic[]
    statusBarHeight: number
    error?: Error
    loading: boolean
    showNode: boolean
    nodeLoading: boolean
    noMore: boolean
  },

  async onLoad() {
    try {
      wx.showLoading({ title: '加载中' })
      await this.load(true)
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' })
    } finally {
      wx.hideLoading({})
    }
  },

  onHide() {
    this.setData!({showNode: false})
  },

  async onReachBottom() {
    if (this.data.loading || this.data.noMore) {
      return
    }

    try {
      this.setData!({ loading: true, error: null })
      await this.load()
    } catch (error) {
      this.setData!({ error })
    } finally {
      this.setData!({ loading: false })
    }
  },

  async onPullDownRefresh() {
    try {
      await this.load(true)
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' })
    } finally {
      wx.stopPullDownRefresh({})
    }
  },

  async handleRetry() {
    this.onReachBottom()
  },

  handleItemClick(evt: WXBaseEvent<{ id: number }>) {
    wx.navigateTo({
      url: `../detail/detail?id=${evt.currentTarget.dataset.id}`
    })
  },

  handleToggleShowNode() {
    this.setData!({ showNode: !this.data.showNode })
  },

  prevent() {},

  /**
   * 列表加载
   */
  async load(refresh: boolean = false) {
    const limit = refresh ? 30 : 20
    const params = {
      offset: refresh ? 0 : this.data.topics.length,
      limit
    }
    const res = await get<{ topics: Topic[] }>('/api/v3/topics', params)
    const noMore = res.topics.length < limit
    const topics = refresh ? res.topics : this.data.topics.concat(res.topics)
    this.setData!({ topics, noMore })
  }
})
