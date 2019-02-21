//index.js
//获取应用实例
import { get } from '../../request'

interface SortType {
  id: string
  name: string
}

const SystemInfo = wx.getSystemInfoSync()
const SortTypes: SortType[] = [
  { id: 'last_actived', name: '默认' },
  { id: 'excellent', name: '精华💎' },
  { id: 'popular', name: '优质' },
  { id: 'recent', name: '最近发布' },
  { id: 'no_reply', name: '无人问津' }
]

Page({
  data: {
    statusBarHeight: SystemInfo.statusBarHeight,
    topics: [],
    sort: SortTypes[0],
    loading: false,
    nodeLoading: false,
    showNode: false,
    noMore: false,
    sortTypes: SortTypes
  } as {
    sort?: SortType
    currentNode?: NodeDetail
    sortTypes: SortType[]
    topics: Topic[]
    statusBarHeight: number
    error?: Error
    loading: boolean
    showNode: boolean
    nodeLoading: boolean
    nodeLoadError?: Error
    noMore: boolean
    nodes?: [{ name: string; id: string; nodes: NodeDetail[] }]
  },

  async onLoad() {
    try {
      wx.showLoading({ title: '加载中' })
      await this.load(true)
      this.loadNode()
    } catch (err) {
      wx.showToast({ title: err.message, icon: 'none' })
    } finally {
      wx.hideLoading({})
    }
  },

  onHide() {
    this.setData!({ showNode: false })
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

  handleSelectSort(evt: WXBaseEvent<{ value: SortType }>) {
    this.setData!({ showNode: false })
    const sort = evt.currentTarget.dataset.value
    if (this.data.sort && this.data.sort.id === sort.id) {
      return
    }
    this.setData!({ sort, currentNode: null })
    this.load(true)
  },

  handleSelectNode(evt: WXBaseEvent<{ value: NodeDetail }>) {
    this.setData!({ showNode: false })
    const node = evt.currentTarget.dataset.value
    if (this.data.currentNode && this.data.currentNode.id === node.id) {
      return
    }
    this.setData!({ currentNode: node, sort: null })
    this.load(true)
  },

  prevent() {},

  /**
   * 列表加载
   */
  async load(refresh: boolean = false) {
    const limit = refresh ? 30 : 20
    const params = {
      type: this.data.sort ? this.data.sort.id : '',
      offset: refresh ? 0 : this.data.topics.length,
      node_id: this.data.currentNode ? this.data.currentNode.id : '',
      limit
    }
    const res = await get<{ topics: Topic[] }>('/api/v3/topics', params)
    const noMore = res.topics.length < limit
    const topics = refresh ? res.topics : this.data.topics.concat(res.topics)
    this.setData!({ topics, noMore })
  },

  async loadNode() {
    try {
      this.setData!({ nodeLoading: true, nodeLoadError: null })
      const res = await get<{ nodes: NodeDetail[] }>('/api/v3/nodes')
      const groups: { [id: string]: NodeDetail[] } = {}

      for (let node of res.nodes) {
        if (groups[node.section_id]) {
          groups[node.section_id].push(node)
        } else {
          groups[node.section_id] = [node]
        }
      }
      this.setData!({
        nodes: Object.keys(groups)
          .sort()
          .map(id => ({
            id,
            name: groups[id][0].section_name,
            nodes: groups[id].sort((a, b) => a.id - b.id)
          }))
      })
    } catch (err) {
      this.setData!({ nodeLoadError: err })
    } finally {
      this.setData!({ nodeLoading: false })
    }
  }
})
