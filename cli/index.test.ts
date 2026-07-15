import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { GithubRepo } from '../src/types/github'
import { type Config, resolveConfig, resolveProjects } from './index'

function repo(name: string): GithubRepo {
  return {
    id: 1,
    name,
    full_name: `octocat/${name}`,
    description: null,
    url: '',
    html_url: '',
    homepage: null,
    language: null,
    stargazers_count: 0,
    forks_count: 0,
    watchers_count: 0,
    topics: [],
  }
}

describe('resolveConfig', () => {
  const base: Config = { template: 'standard', theme: 'dark', projects: [] }

  beforeEach(() => {
    delete process.env.TEMPLATE
    delete process.env.THEME
    delete process.env.PROJECTS
  })

  afterEach(() => {
    delete process.env.TEMPLATE
    delete process.env.THEME
    delete process.env.PROJECTS
  })

  it('overrides base config with env vars when set', () => {
    process.env.TEMPLATE = 'detailed'
    process.env.THEME = 'light'
    process.env.PROJECTS = 'repo1, repo2'

    const result = resolveConfig(base)

    expect(result).toEqual({
      template: 'detailed',
      theme: 'light',
      projects: ['repo1', 'repo2'],
    })
  })

  it('falls back to base config when env vars are unset', () => {
    expect(resolveConfig(base)).toEqual(base)
  })

  it('falls back to base theme when THEME is invalid', () => {
    process.env.THEME = 'solarized'

    expect(resolveConfig(base).theme).toBe(base.theme)
  })
})

describe('resolveProjects', () => {
  const repos = [repo('alpha'), repo('beta'), repo('gamma')]

  it('returns matched repos in the requested order', () => {
    expect(resolveProjects(['gamma', 'alpha'], repos)).toEqual([
      repo('gamma'),
      repo('alpha'),
    ])
  })

  it('skips names not found without throwing', () => {
    expect(() => resolveProjects(['alpha', 'missing'], repos)).not.toThrow()
    expect(resolveProjects(['alpha', 'missing'], repos)).toEqual([
      repo('alpha'),
    ])
  })

  it('returns an empty array for an empty names list', () => {
    expect(resolveProjects([], repos)).toEqual([])
  })
})
