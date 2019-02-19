/**
 * 话题详情
 */
import { get } from '../../request'

// pages/article/article.js
Page({
  /**
   * Page initial data
   */
  data: {
    loading: true
  } as {
    loading?: boolean
    id: string
    topic?: TopicDetail
    meta?: TopicMeta
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(query?: { id: string }) {
    this.setData!({ id: query!.id || 38118 })
    this.loadDetail()
  },

  async loadDetail() {
    try {
      this.setData!({ loading: true })
      const url = `/api/v3/topics/${this.data.id}`
      const detail = await get<{ meta: TopicMeta; topic: TopicDetail }>(url)
      this.setData!({ topic: detail.topic, meta: detail.meta })
    } catch (err) {
      // TODO: 异常处理
    } finally {
      setTimeout(() => {
        this.setData!({ loading: false })
      }, 500)
    }
  },

  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function() {},

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function() {},

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function() {},

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function() {},

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function() {},

  /**
   * Called when page reach bottom
   */
  onReachBottom: function() {}
})
