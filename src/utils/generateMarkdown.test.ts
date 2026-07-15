import { describe, expect, it } from 'vitest'
import type { GithubRepo, GithubUser, SectionState } from '../types/github'
import { generateMarkdown } from './generateMarkdown'

const user = {} as GithubUser
const repos: GithubRepo[] = []
const sections: SectionState = {
  about: true,
  skills: true,
  stats: true,
  projects: true,
}

describe('generateMarkdown', () => {
  it('embeds the banner image when a bannerSrc is given', () => {
    const md = generateMarkdown(user, repos, sections, [], './banner.svg')

    expect(md).toContain('<img src="./banner.svg"')
  })

  it('omits the banner block when bannerSrc is null', () => {
    const md = generateMarkdown(user, repos, sections, [], null)

    expect(md).not.toContain('<img')
  })
})
