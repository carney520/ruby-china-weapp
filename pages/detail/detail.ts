/**
 * 话题详情
 */
import request, { get, post } from '../../request'
import { IApp } from '../../app'

const REPLY_LIMIT = 20
const app = getApp<IApp>()

Page({
  data: {
    loading: true,
    repliesLoading: false,
    noMoreReplies: false,
    currentUser: app.globalData.user,
    replies: []
  } as {
    loading: boolean
    repliesLoading: boolean
    id?: string
    topic?: TopicDetail
    meta?: TopicMeta
    replies: Reply[]
    noMoreReplies: boolean
    currentUser?: UserDetail
  },

  onLoad(query?: { id: string }) {
    app.onUserStateChange(this.handleUserStateChange)
    this.setData!({ id: query!.id || 38057 })
    this.loadDetail()
    this.loadReplies()
  },

  onUnload: function() {
    app.offUserStateChange(this.handleUserStateChange)
  },

  onReady: function() {},

  onPullDownRefresh: function() {},

  onReachBottom() {
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

  async checkLogin() {
    if (!!this.data.currentUser) {
      return true
    } else {
      wx.navigateTo({ url: '../login/login' })
      return false
    }
  },

  async handleToggleLiked() {
    if (!this.checkLogin()) {
      return
    }
    try {
      const url = `/api/v3/likes`
      const liked = !this.data.meta!.liked
      const params = { obj_type: 'topic', obj_id: this.data.id }
      const { count } = await request<{ count: number }>(
        liked ? 'POST' : 'DELETE',
        url,
        params
      )
      this.setData!({ 'topic.likes_count': count, 'meta.liked': liked })
    } catch (err) {
      wx.showToast({ title: `赞失败: ${err.message}`, icon: 'none' })
    }
  },

  async handleToggleFavorited() {
    if (!this.checkLogin()) {
      return
    }

    try {
      const favorited = !this.data.meta!.favorited
      const url = favorited
        ? `/api/v3/topics/${this.data.id}/favorite`
        : `/api/v3/topics/${this.data.id}/unfavorite`
      await post(url)
      this.setData!({ 'meta.favorited': favorited })
    } catch (err) {
      wx.showToast({ title: `收藏失败: ${err.message}`, icon: 'none' })
    }
  },

  async handleToggleFollowed() {
    if (!this.checkLogin()) {
      return
    }
    try {
      const followed = !this.data.meta!.followed
      const url = followed
        ? `/api/v3/topics/${this.data.id}/follow`
        : `/api/v3/topics/${this.data.id}/unfollow`
      await post(url)
      this.setData!({ 'meta.followed': followed })
    } catch (err) {
      wx.showToast({ title: `关注失败: ${err.message}`, icon: 'none' })
    }
  },

  handleUserStateChange(user: UserDetail | null) {
    this.setData!({ currentUser: user })
  }
})
