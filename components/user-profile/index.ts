import { UserListType } from '../../constants'
/**
 * 用户简介
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    user: {
      type: Object
    }
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    handleOpenFollowing() {
      const user = (this.properties.user as any) as User
      wx.navigateTo({
        url: `../users/users?id=${user.login}&type=${UserListType.Following}`
      })
    },
    handleOpenTopics(evt: WXBaseEvent<{ type: string }>) {
      const user = (this.properties.user as any) as User
      wx.navigateTo({
        url: `../topics/topics?id=${user.login}&type=${
          evt.currentTarget.dataset.type
        }`
      })
    },
    handleOpenFollowers() {
      const user = (this.properties.user as any) as User
      wx.navigateTo({
        url: `../users/users?id=${user.login}&type=${UserListType.Followers}`
      })
    }
  }
})
