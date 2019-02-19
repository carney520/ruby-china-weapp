interface User {
  id: number
  login: string
  name: string
  avatar_url: string
}

interface Topic {
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
  last_reply_user_id: number
  last_reply_user_login: string
}

interface TopicMeta {
  favorited: boolean
  followed: boolean
  liked: boolean
}

interface TopicDetail extends Topic {
  // 阅读数
  hits: number
  // markdown
  body: string
  // html
  body_html: string
}
