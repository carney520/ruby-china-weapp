//index.js
//获取应用实例
import { get } from '../../request'

export interface User {
  id: number
  login: string
  name: string
  avatar_url: string
}

export interface Topic {
  id: number
  title: string
  node_name: string
  node_id: number
  excellent: boolean
  deleted: boolean
  replies_count: number
  likes_count: number
  created_at: string
  replied_at: string
  updated_at: string
  user: User
}

const SystemInfo = wx.getSystemInfoSync()

Page({
  data: {
    statusBarHeight: SystemInfo.statusBarHeight,
    topics: [],
    loading: false,
    noMore: false
  } as {
    topics: Topic[]
    statusBarHeight: number
    error?: Error
    loading: boolean
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
