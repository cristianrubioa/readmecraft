export interface GithubUser {
  login: string
  name: string | null
  avatar_url: string
  bio: string | null
  company: string | null
  location: string | null
  blog: string | null
  email: string | null
  public_repos: number
  followers: number
  following: number
}

export interface GithubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  url: string
  html_url: string
  homepage: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  watchers_count: number
  topics: string[]
}

export type TemplateName = 'standard' | 'detailed' | 'minimal'

export interface SectionState {
  about: boolean
  skills: boolean
  stats: boolean
  projects: boolean
}

export interface Template {
  name: TemplateName
  title: string
  description: string
  sections: SectionState
}
