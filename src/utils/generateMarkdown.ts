import type { GithubUser, GithubRepo, SectionState } from '../types/github'

export function generateMarkdown(
  user: GithubUser,
  repos: GithubRepo[],
  sections: SectionState,
  selectedRepos: number[]
): string {
  const lines: string[] = []

  // Header
  lines.push(`# ${user.name || user.login}`)
  lines.push('')

  if (user.bio) {
    lines.push(user.bio)
    lines.push('')
  }

  // About section
  if (sections.about) {
    lines.push('## 👋 About Me')
    const aboutItems = []
    if (user.location) aboutItems.push(`📍 Location: ${user.location}`)
    if (user.company) aboutItems.push(`🏢 Company: ${user.company}`)
    if (user.blog) aboutItems.push(`🌐 Website: [${user.blog}](${user.blog})`)
    if (user.email) aboutItems.push(`📧 Email: ${user.email}`)

    aboutItems.forEach((item) => lines.push(`- ${item}`))
    lines.push('')
  }

  // Stats section
  if (sections.stats) {
    lines.push('## 📊 GitHub Stats')
    lines.push(`- **Repositories**: ${user.public_repos}`)
    lines.push(`- **Followers**: ${user.followers}`)
    lines.push(`- **Following**: ${user.following}`)
    lines.push('')
  }

  // Featured Projects section - sorted by stars descending
  if (sections.projects && selectedRepos.length > 0) {
    lines.push('## 🚀 Featured Projects')
    const sortedRepos = selectedRepos
      .map((repoId) => repos.find((r) => r.id === repoId))
      .filter((r) => r !== undefined)
      .sort((a, b) => (b?.stargazers_count || 0) - (a?.stargazers_count || 0))
    
    sortedRepos.forEach((repo) => {
      if (repo) {
        lines.push(`### [${repo.name}](${repo.html_url})`)
        if (repo.description) {
          lines.push(repo.description)
        }
        const meta = []
        if (repo.language) meta.push(`${repo.language}`)
        if (repo.stargazers_count > 0) meta.push(`⭐ ${repo.stargazers_count}`)
        if (repo.forks_count > 0) meta.push(`🔀 ${repo.forks_count}`)
        if (meta.length > 0) {
          lines.push(`*${meta.join(' • ')}*`)
        }
        lines.push('')
      }
    })
  }

  // Skills section
  if (sections.skills) {
    const languages = new Set<string>()
    repos.forEach((repo) => {
      if (repo.language) {
        languages.add(repo.language)
      }
    })

    if (languages.size > 0) {
      lines.push('## 💻 Skills & Languages')
      const skillsList = Array.from(languages)
        .sort()
        .map((lang) => `\`${lang}\``)
      lines.push(skillsList.join(' • '))
      lines.push('')
    }
  }

  return lines.join('\n')
}
