import { describe, expect, it } from 'vitest'
import type { GithubRepo, GithubUser, SectionState } from '../types/github'
import { generateBanner } from './generateBanner'

const user: GithubUser = {
  login: 'octocat',
  name: 'The Octocat',
  avatar_url: '',
  bio: null,
  company: null,
  location: null,
  blog: null,
  email: null,
  public_repos: 8,
  followers: 100,
  following: 9,
}

const repos: GithubRepo[] = [
  {
    id: 1,
    name: 'hello-world',
    full_name: 'octocat/hello-world',
    description: null,
    url: '',
    html_url: '',
    homepage: null,
    language: 'TypeScript',
    stargazers_count: 5,
    forks_count: 0,
    watchers_count: 0,
    topics: [],
  },
]

const sections: SectionState = {
  about: true,
  stats: true,
  skills: true,
  projects: true,
}

describe('generateBanner', () => {
  it('produces a valid SVG for dark and light themes, and the two differ', () => {
    const dark = generateBanner(user, repos, sections, null, [], 'dark')
    const light = generateBanner(user, repos, sections, null, [], 'light')

    expect(dark.startsWith('<svg')).toBe(true)
    expect(light.startsWith('<svg')).toBe(true)
    expect(dark).not.toBe(light)
  })

  it('does not throw when contribution data is missing', () => {
    expect(() =>
      generateBanner(user, repos, sections, null, [], 'dark'),
    ).not.toThrow()
    expect(
      generateBanner(user, repos, sections, null, [], 'dark').startsWith(
        '<svg',
      ),
    ).toBe(true)
  })
})
