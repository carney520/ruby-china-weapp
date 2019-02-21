interface User {
  id: number
  login: string
  name: string
  avatar_url: string
}

interface UserMeta {
  blocked: boolean
  followed: boolean
}

interface UserDetail {
  avatar_url: string
  bio?: string
  company?: string
  created_at: string
  email: string
  favorites_count: number
  followers_count: number
  following_count: number
  replies_count: number
  topics_count: number
  github?: string
  id: number
  level: string
  level_name: string
  location: string
  login: string
  name: string
  // 一段话的简单个人介绍
  tagline?: string
  twitter?: string
  website?: string
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

interface Reply {
  action?: string
  body: string
  body_html: string
  created_at: string
  deleted: boolean
  id: number
  likes_count: number
  target_type?: string
  topic_id: number
  updated_at: string
  user: User
  // 已喜欢
  liked: boolean
}

interface NodeDetail {
  id: number
  name: string
  section_id: number
  section_name: string
  sort: number
  summary: string
  topics_count: number
  updated_at: string
}
