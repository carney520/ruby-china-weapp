/**
 * 话题详情
 */
import { get } from '../../request'

const REPLY_LIMIT = 20

// pages/article/article.js
Page({
  /**
   * Page initial data
   */
  data: {
    loading: true,
    repliesLoading: false,
    noMoreReplies: false,
    replies: []
  } as {
    loading: boolean
    repliesLoading: boolean
    id?: string
    topic?: TopicDetail
    meta?: TopicMeta
    replies: Reply[]
    noMoreReplies: boolean
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(query?: { id: string }) {
    this.setData!({ id: query!.id || 38057 })
    this.loadDetail()
    this.loadReplies()
  },

  async loadDetail() {
    try {
      this.setData!({ loading: true })
      const url = `/api/v3/topics/${this.data.id}`
      const detail = await get<{ meta: TopicMeta; topic: TopicDetail }>(url)
      this.setData!({ topic: detail.topic, meta: detail.meta })
      wx.setNavigationBarTitle({ title: detail.topic.title })
    } catch (err) {
      // TODO: 异常处理
    } finally {
      setTimeout(() => {
        this.setData!({ loading: false })
      }, 500)
    }
  },

  async loadReplies() {
    if (this.data.repliesLoading || this.data.noMoreReplies) {
      return
    }

    try {
      this.setData!({ repliesLoading: true })
      const url = `/api/v3/topics/${this.data.id}/replies`
      const params = {
        offset: this.data.replies ? this.data.replies.length : 0,
        limit: REPLY_LIMIT
      }

      const res = await get<{
        replies: Reply[]
        meta: { user_liked_reply_ids: number[] }
      }>(url, params)

      const replies = [
        ...this.data.replies,
        ...res.replies.map(i => {
          i.liked = res.meta.user_liked_reply_ids.indexOf(i.id) !== -1
          return i
        })
      ]
      this.setData!({
        replies,
        noMoreReplies: res.replies.length < REPLY_LIMIT
      })
    } catch (err) {
      // TODO: 异常处理
    } finally {
      this.setData!({ repliesLoading: false })
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

  onReachBottom() {
    this.loadReplies()
  }
})
