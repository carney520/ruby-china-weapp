// components/topic-item/topic-item.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    topic: {
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
    handleItemClick(evt: WXBaseEvent<{ id: number }>) {
      wx.navigateTo({
        url: `../detail/detail?id=${evt.currentTarget.dataset.id}`
      })
    }
  }
})
