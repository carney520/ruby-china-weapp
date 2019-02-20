/**
 * 回复页面
 */
import { post } from '../../request'

Page({
  data: {} as {
    id: number
    title: string
    loading: boolean
  },

  onLoad(query?: { [queryKey: string]: string }) {
    this.setData!({
      id: parseInt(query!['id']),
      title: decodeURIComponent(query!['title'])
    })
  },

  async handleSubmit(evt: WxSubmitEvent<{ reply: string }>) {
    const { reply } = evt.detail.value
    if (reply.trim() === '') {
      return
    }

    try {
      this.setData!({ loading: true })
      const url = `/api/v3/topics/${this.data.id}/replies`
      await post(url, { body: reply })
      wx.showToast({ title: `回复成功` })
      wx.navigateBack({ delta: 1 })
    } catch (err) {
      wx.showToast({ icon: 'none', title: `回复失败: ${err.message}` })
    } finally {
      this.setData!({ loading: false })
    }
  }
})
