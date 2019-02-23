/**
 * 用户列表展示
 */
import { get } from '../../request'
import { UserListType } from '../../constants'

const LIMIT = 30
const title = {
  [UserListType.Following]: '正在关注',
  [UserListType.Followers]: '关注者'
}

Page({
  data: {
    users: []
  } as {
    id?: string
    type?: UserListType
    loading?: boolean
    noMore?: boolean
    users: User[]
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

  handleOpenUser(evt: WXBaseEvent<{ id: string }>) {
    wx.navigateTo({ url: `../user/user?id=${evt.currentTarget.dataset.id}` })
  },

  async load() {
    const url = this.getUrl()

    try {
      this.setData!({ loading: true, error: null })
      const params = {
        offset: this.data.users.length,
        limit: LIMIT
      }
      const res = await get<{ [key: string]: User[] }>(url, params)
      const list = res[this.data.type!]
      const noMore = list.length < LIMIT
      this.setData!({ noMore, users: this.data.users.concat(list) })
    } catch (error) {
      this.setData!({ error })
    } finally {
      this.setData!({ loading: false })
    }
  },

  getUrl() {
    const { id, type } = this.data
    return type === UserListType.Following
      ? `/api/v3/users/${id}/following`
      : `/api/v3/users/${id}/followers`
  }
})
