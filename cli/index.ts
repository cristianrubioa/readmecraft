import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse as parseYaml } from 'yaml'
import type {
  ContribData,
  GithubRepo,
  GithubUser,
  SectionState,
} from '../src/types/github'
import { generateBanner } from '../src/utils/generateBanner'
import { generateMarkdown } from '../src/utils/generateMarkdown'

// ─── env ─────────────────────────────────────────────────────────────────────

function loadEnv(): void {
  const envPath = join(process.cwd(), '.env')
  if (!existsSync(envPath)) return
  const content = readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (!(key in process.env)) process.env[key] = value
  }
}

// ─── config ──────────────────────────────────────────────────────────────────

export interface Config {
  template: string
  theme: 'dark' | 'light'
  projects: string[]
}

function loadConfig(): Config {
  const defaults: Config = { template: 'standard', theme: 'dark', projects: [] }
  const configPath = join(process.cwd(), 'readmecraft.yml')
  if (!existsSync(configPath)) return defaults

  try {
    const raw = parseYaml(readFileSync(configPath, 'utf-8')) as Record<
      string,
      unknown
    >
    return {
      template:
        typeof raw.template === 'string' ? raw.template : defaults.template,
      theme: raw.theme === 'light' ? 'light' : 'dark',
      projects: Array.isArray(raw.projects) ? (raw.projects as string[]) : [],
    }
  } catch {
    return defaults
  }
}

export function resolveConfig(base: Config): Config {
  return {
    template: process.env.TEMPLATE ?? base.template,
    theme:
      process.env.THEME === 'light'
        ? 'light'
        : process.env.THEME === 'dark'
          ? 'dark'
          : base.theme,
    projects: process.env.PROJECTS
      ? process.env.PROJECTS.split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : base.projects,
  }
}

// ─── GitHub API ───────────────────────────────────────────────────────────────

async function fetchUser(
  username: string,
  token?: string,
): Promise<GithubUser> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token) headers.Authorization = `token ${token}`
  const res = await fetch(`https://api.github.com/users/${username}`, {
    headers,
  })
  if (!res.ok)
    throw new Error(`GitHub API error ${res.status}: ${res.statusText}`)
  return res.json() as Promise<GithubUser>
}

async function fetchRepos(
  username: string,
  token?: string,
): Promise<GithubRepo[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }
  if (token) headers.Authorization = `token ${token}`
  const res = await fetch(
    `https://api.github.com/users/${username}/repos?sort=stars&per_page=100`,
    { headers },
  )
  if (!res.ok)
    throw new Error(`GitHub API error ${res.status}: ${res.statusText}`)
  return res.json() as Promise<GithubRepo[]>
}

async function fetchContributions(
  username: string,
): Promise<ContribData | null> {
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
    )
    if (!res.ok) return null
    const data = (await res.json()) as {
      total?: { lastYear?: number }
      contributions?: { date: string; count: number }[]
    }
    if (data?.total?.lastYear != null && Array.isArray(data.contributions)) {
      return {
        total: data.total.lastYear,
        daily: data.contributions.map((c) => ({
          date: c.date,
          count: c.count,
        })),
      }
    }
    return null
  } catch {
    return null
  }
}

// ─── project resolution ───────────────────────────────────────────────────────

export function resolveProjects(
  names: string[],
  repos: GithubRepo[],
): GithubRepo[] {
  if (names.length === 0) return []
  const byName = new Map(repos.map((r) => [r.name, r]))
  return names.reduce<GithubRepo[]>((acc, name) => {
    const repo = byName.get(name)
    if (repo) {
      acc.push(repo)
    } else {
      process.stderr.write(
        `Warning: project "${name}" not found in fetched repos — skipping\n`,
      )
    }
    return acc
  }, [])
}

// ─── push to profile repo ────────────────────────────────────────────────────

async function pushToProfileRepo(username: string, pat: string): Promise<void> {
  const { execSync } = await import('node:child_process')
  const cloneUrl = `https://x-access-token:${pat}@github.com/${username}/${username}.git`
  const profileDir = join(process.cwd(), '_profile-repo')

  execSync(`rm -rf ${profileDir}`)
  execSync(`git clone "${cloneUrl}" "${profileDir}"`)
  execSync(`cp output/README.md output/banner.svg "${profileDir}/"`)

  const status = execSync(
    `git -C "${profileDir}" diff --quiet HEAD -- README.md banner.svg || echo changed`,
    { encoding: 'utf-8' },
  ).trim()

  if (!status) {
    console.log('Profile README is already up to date — skipping commit.')
  } else {
    execSync(`git -C "${profileDir}" config user.name "github-actions[bot]"`)
    execSync(
      `git -C "${profileDir}" config user.email "github-actions[bot]@users.noreply.github.com"`,
    )
    execSync(`git -C "${profileDir}" add README.md banner.svg`)
    execSync(
      `git -C "${profileDir}" commit -m ":memo: [doc] Update profile README"`,
    )
    execSync(`git -C "${profileDir}" push`)
    console.log('Profile README updated successfully.')
  }

  execSync(`rm -rf ${profileDir}`)
}

// ─── main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  loadEnv()

  const username = process.env.GITHUB_USERNAME
  if (!username) {
    console.error(
      'Error: GITHUB_USERNAME is not set. Add it to .env or run: GITHUB_USERNAME=<you> make build',
    )
    process.exit(1)
  }

  const token = process.env.GITHUB_TOKEN
  const isLocal = process.argv.includes('--local')
  const isDryRun = process.argv.includes('--dry-run')

  const config = resolveConfig(loadConfig())

  console.log(`Fetching GitHub data for @${username}...`)
  const [user, repos, contribData] = await Promise.all([
    fetchUser(username, token),
    fetchRepos(username, token),
    fetchContributions(username),
  ])

  if (!contribData) {
    process.stderr.write(
      'Warning: could not fetch contribution data — chart will be omitted\n',
    )
  }

  const sections: SectionState = {
    about: true,
    stats: true,
    skills: true,
    projects: true,
  }
  const selectedRepos =
    config.projects.length > 0 ? resolveProjects(config.projects, repos) : []

  const bannerSvg = generateBanner(
    user,
    repos,
    sections,
    contribData,
    selectedRepos,
    config.theme,
  )
  const markdown = generateMarkdown(user, repos, sections, [], './banner.svg')

  if (isDryRun) {
    process.stdout.write(`${markdown}\n`)
    return
  }

  const outDir = join(process.cwd(), 'output')
  if (!existsSync(outDir)) {
    const { mkdirSync } = await import('node:fs')
    mkdirSync(outDir)
  }
  const bannerPath = join(outDir, 'banner.svg')
  const readmePath = join(outDir, 'README.md')
  writeFileSync(bannerPath, bannerSvg, 'utf-8')
  writeFileSync(readmePath, markdown, 'utf-8')
  console.log(`banner.svg → ${bannerPath}`)
  console.log(`README.md  → ${readmePath}`)

  if (isLocal) return

  const pat = process.env.PROFILE_REPO_TOKEN
  if (!pat) {
    console.error(
      'Error: PROFILE_REPO_TOKEN is not set. Required to push to your profile repo.',
    )
    process.exit(1)
  }

  await pushToProfileRepo(username, pat)
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((err) => {
    console.error('Error:', (err as Error).message)
    process.exit(1)
  })
}
