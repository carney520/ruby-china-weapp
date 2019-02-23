/**
 * 话题列表
 */
import { get } from '../../request'
import { TopicListType } from '../../constants'

const LIMIT = 30
const title = {
  [TopicListType.Favorites]: '收藏',
  [TopicListType.Topics]: '话题'
}

/**
 * 列表
 */
Page({
  data: {
    topics: []
  } as {
    id?: string
    type?: TopicListType
    topics: Topic[]
    loading?: boolean
    noMore?: boolean
    error?: Error
  },

  onLoad(query?: { [queryKey: string]: string }) {
    this.setData!({
      id: query!['id'],
      type: query!['type']
    })
    wx.setNavigationBarTitle({ title: title[this.data.type!] })
    this.load()
  },

  onReachBottom() {
    this.load()
  },

  async load() {
    const { loading, noMore } = this.data
    if (loading || noMore) {
      return
    }

    try {
      this.setData!({ loading: true, error: null })
      const url = this.getUrl()
      const params = {
        offset: this.data.topics.length,
        limit: LIMIT
      }
      const res = await get<{ topics: Topic[] }>(url, params)
      const noMore = res.topics.length < LIMIT
      this.setData!({ noMore, topics: this.data.topics.concat(res.topics) })
    } catch (error) {
      this.setData!({ error })
    } finally {
      this.setData!({ loading: false })
    }
  },

  getUrl() {
    const { id, type } = this.data
    return type === TopicListType.Favorites
      ? `/api/v3/users/${id}/favorites`
      : `/api/v3/users/${id}/topics`
  }
})
