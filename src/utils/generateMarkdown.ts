import type { GithubUser, GithubRepo, SectionState } from '../types/github'

export function generateMarkdown(
  _user: GithubUser,
  _repos: GithubRepo[],
  _sections: SectionState,
  _selectedRepos: number[],
  bannerSrc: string | null = './banner.svg'
): string {
  const lines: string[] = []

  if (bannerSrc) {
    lines.push(`<div align="center"><img src="${bannerSrc}" width="100%"/></div>`)
    lines.push('')
  }

  return lines.join('\n')
}
