import { useEffect, useState } from 'react'
import { CopyButton } from './components/CopyButton'
import { GithubForm } from './components/GithubForm'
import { SectionEditor } from './components/SectionEditor'
import { useDarkMode } from './hooks/useDarkMode'
import { useGithubContributions } from './hooks/useGithubContributions'
import { useGithubRepos } from './hooks/useGithubRepos'
import { useGithubUser } from './hooks/useGithubUser'
import { standardTemplate } from './templates/standard'
import type { GithubRepo, SectionState, TemplateName } from './types/github'
import {
  MAX_SELECTED_REPOS,
  PROJECTS_PER_PAGE,
  styles,
  TEMPLATES_ORDER,
} from './utils/constants'
import { generateBanner } from './utils/generateBanner'
import { generateMarkdown } from './utils/generateMarkdown'
import { TEMPLATE_CONFIGS } from './utils/templateConfig'

function App() {
  const [isDark, setIsDark] = useDarkMode()
  const [bannerTheme, setBannerTheme] = useState<'dark' | 'light'>(() =>
    isDark ? 'dark' : 'light',
  )
  const [searchUsername, setSearchUsername] = useState<string | null>(null)
  const [selectedTemplate, setSelectedTemplate] =
    useState<TemplateName>('standard')
  const [sections, setSections] = useState<SectionState>(
    standardTemplate.sections,
  )
  const [selectedRepos, setSelectedRepos] = useState<number[]>([])
  const [projectsPage, setProjectsPage] = useState(0)

  const {
    user,
    loading: userLoading,
    error: userError,
  } = useGithubUser(searchUsername)
  const {
    repos,
    loading: reposLoading,
    error: reposError,
  } = useGithubRepos(searchUsername)
  const contribData = useGithubContributions(searchUsername)

  const loading = userLoading || reposLoading
  const error = userError || reposError

  const handleSearch = (username: string) => {
    setSearchUsername(username)
    setSelectedRepos([])
    setProjectsPage(0)
  }

  const handleReset = () => {
    setSearchUsername(null)
    setSelectedRepos([])
    setProjectsPage(0)
    setBannerTheme(isDark ? 'dark' : 'light')
  }

  const handleTemplateChange = (template: TemplateName) => {
    setSelectedTemplate(template)
    setSections(TEMPLATE_CONFIGS[template])
    if (template === 'detailed' && repos.length > 0) {
      const firstFive = repos
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 5)
        .map((r) => r.id)
      setSelectedRepos(firstFive)
    } else {
      setSelectedRepos([])
    }
  }

  const handleSectionChange = (
    section: keyof SectionState,
    enabled: boolean,
  ) => {
    setSections((prev) => ({ ...prev, [section]: enabled }))
  }

  const handleRepoToggle = (repoId: number) => {
    setSelectedRepos((prev) =>
      prev.includes(repoId)
        ? prev.filter((id) => id !== repoId)
        : prev.length < MAX_SELECTED_REPOS
          ? [...prev, repoId]
          : prev,
    )
  }

  const [bannerBlobUrl, setBannerBlobUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !repos.length) return
    const projectRepos: GithubRepo[] =
      selectedRepos.length > 0
        ? selectedRepos
            .map((id) => repos.find((r) => r.id === id))
            .filter((r): r is GithubRepo => r !== undefined)
        : [...repos]
            .sort((a, b) => b.stargazers_count - a.stargazers_count)
            .slice(0, 3)
    const svg = generateBanner(
      user,
      repos,
      sections,
      contribData,
      projectRepos,
      bannerTheme,
    )
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    setBannerBlobUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [user, repos, sections, contribData, selectedRepos, bannerTheme])

  const markdown =
    user && repos.length
      ? generateMarkdown(user, repos, sections, selectedRepos, './banner.svg')
      : ''

  const handleDownload = () => {
    if (!bannerBlobUrl) return
    const a = document.createElement('a')
    a.href = bannerBlobUrl
    a.download = 'banner.svg'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 text-slate-900 dark:text-slate-100 transition-colors flex flex-col">
      {/* Header */}
      <header
        className="backdrop-blur-lg bg-slate-50/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50"
        style={{ height: 'var(--header-h, 4rem)' }}
      >
        <div className="max-w-6xl mx-auto px-6 h-full">
          <div className="flex items-center justify-between h-full">
            <h1
              className="font-semibold tracking-wide leading-none"
              style={{ fontSize: 'var(--app-name-size, 1.75rem)' }}
            >
              ReadmeCraft
            </h1>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDark((d) => !d)}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                aria-label="Toggle dark mode"
              >
                <i
                  className={
                    isDark ? 'fas fa-sun text-lg' : 'fas fa-moon text-lg'
                  }
                />
              </button>
              {user && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  aria-label="Search new user"
                  title="Search new user"
                >
                  <i className="fas fa-rotate-right text-lg" />
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main
        className={`w-full flex-1 flex flex-col items-center justify-start px-6 ${!user ? 'pt-40' : 'pt-8'}`}
      >
        {!user ? (
          <div className="text-center space-y-8 w-full">
            <p className="text-2xl font-light text-slate-700 dark:text-slate-300">
              Generate your GitHub profile README
            </p>
            <div className="flex justify-center w-full">
              <GithubForm onSubmit={handleSearch} loading={loading} />
            </div>
            {error && (
              <div className="max-w-lg mx-auto p-4 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-slate-300 text-center text-sm">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-6xl w-full mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* User Card */}
                <div className="backdrop-blur-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <img
                    src={user.avatar_url}
                    alt={user.login}
                    className="w-28 h-28 rounded-full mx-auto mb-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg"
                  />
                  <h2 className="text-3xl font-light mb-2">
                    {user.name || user.login}
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                    @{user.login}
                  </p>
                  {user.bio && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
                      {user.bio}
                    </p>
                  )}
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    {user.location && <div>📍 {user.location}</div>}
                    {user.company && <div>🏢 {user.company}</div>}
                  </div>
                </div>

                {/* Template Selector */}
                <div className={`${styles.card} p-6`}>
                  <p className={`${styles.text.base} mb-4`}>Template</p>
                  <div className="grid grid-cols-3 gap-3">
                    {TEMPLATES_ORDER.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => handleTemplateChange(t as TemplateName)}
                        className={`px-3 py-3 rounded-2xl text-xs font-light transition-all ${
                          selectedTemplate === t
                            ? 'bg-transparent text-slate-900 dark:text-slate-100 border-2 border-slate-400 dark:border-slate-500'
                            : 'bg-transparent text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section Editor */}
                <div className={`${styles.card} p-6`}>
                  <p className={`${styles.text.sm} mb-4`}>Sections</p>
                  <SectionEditor
                    sections={sections}
                    onSectionChange={handleSectionChange}
                  />
                </div>

                {/* Featured Projects */}
                {repos.length > 0 && (
                  <div className={`${styles.card} p-6`}>
                    <div className="flex items-center justify-between mb-4">
                      <p className={styles.text.sm}>Featured Projects</p>
                      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
                        {selectedRepos.length} / {MAX_SELECTED_REPOS}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {repos
                        .sort((a, b) => b.stargazers_count - a.stargazers_count)
                        .slice(
                          projectsPage * PROJECTS_PER_PAGE,
                          (projectsPage + 1) * PROJECTS_PER_PAGE,
                        )
                        .map((repo) => {
                          const isChecked = selectedRepos.includes(repo.id)
                          const isDisabled =
                            !isChecked &&
                            selectedRepos.length >= MAX_SELECTED_REPOS
                          return (
                            <label
                              key={repo.id}
                              className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${
                                isDisabled
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isDisabled}
                                onChange={() => handleRepoToggle(repo.id)}
                                className="w-5 h-5 rounded-md accent-slate-500"
                              />
                              <span className="text-sm font-light flex-1 truncate text-slate-700 dark:text-slate-300">
                                {repo.name}
                              </span>
                              {repo.stargazers_count > 0 && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                  ⭐{repo.stargazers_count}
                                </span>
                              )}
                            </label>
                          )
                        })}
                    </div>
                    {Math.ceil(repos.length / PROJECTS_PER_PAGE) > 1 && (
                      <div className="flex gap-2 mt-4 justify-center">
                        <button
                          type="button"
                          onClick={() =>
                            setProjectsPage(Math.max(0, projectsPage - 1))
                          }
                          disabled={projectsPage === 0}
                          className="px-3 py-2 rounded-lg text-xs font-light bg-slate-100 dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          <i className="fas fa-chevron-left" />
                        </button>
                        <span className="text-xs text-slate-500 dark:text-slate-400 self-center">
                          {projectsPage + 1} /{' '}
                          {Math.ceil(repos.length / PROJECTS_PER_PAGE)}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setProjectsPage(
                              Math.min(
                                Math.ceil(repos.length / PROJECTS_PER_PAGE) - 1,
                                projectsPage + 1,
                              ),
                            )
                          }
                          disabled={
                            projectsPage >=
                            Math.ceil(repos.length / PROJECTS_PER_PAGE) - 1
                          }
                          className="px-3 py-2 rounded-lg text-xs font-light bg-slate-100 dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          <i className="fas fa-chevron-right" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column — 3 stacked cards */}
              <div className="lg:col-span-3 flex flex-col gap-6 h-full">
                {/* 1. Preview card — flex-1 */}
                <div className="flex-1 min-h-0 backdrop-blur-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden flex flex-col shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
                    <h3 className="text-lg font-light text-slate-900 dark:text-slate-100">
                      Preview
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setBannerTheme((t) =>
                            t === 'dark' ? 'light' : 'dark',
                          )
                        }
                        className="px-5 py-2.5 rounded-2xl text-sm font-light bg-transparent border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        aria-label="Toggle banner theme"
                        title={
                          bannerTheme === 'dark'
                            ? 'Switch to light banner'
                            : 'Switch to dark banner'
                        }
                      >
                        <i
                          className={
                            bannerTheme === 'dark'
                              ? 'fas fa-moon'
                              : 'fas fa-sun'
                          }
                        />
                      </button>
                      {bannerBlobUrl && (
                        <button
                          type="button"
                          onClick={handleDownload}
                          className="px-5 py-2.5 rounded-2xl text-sm font-light bg-transparent border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                        >
                          <i className="fas fa-download mr-1.5" />
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 overflow-auto bg-slate-50 dark:bg-slate-900 p-4">
                    {bannerBlobUrl && (
                      <img
                        src={bannerBlobUrl}
                        alt="Generated GitHub profile banner preview"
                        width="100%"
                        style={{ borderRadius: '8px', display: 'block' }}
                      />
                    )}
                  </div>
                </div>

                {/* 2. README.md code card */}
                <div className="shrink-0 backdrop-blur-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-light text-slate-900 dark:text-slate-100">
                      README.md
                    </h3>
                    <CopyButton text={markdown} label="Copy" />
                  </div>
                  <pre className="px-6 py-4 text-xs font-mono bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 overflow-x-auto leading-relaxed">
                    {markdown}
                  </pre>
                </div>

                {/* 3. How to use card */}
                <div className="shrink-0 backdrop-blur-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50">
                  <h3 className="text-lg font-light text-slate-900 dark:text-slate-100 mb-4">
                    How to use
                  </h3>
                  <p className="text-sm font-light text-slate-400 dark:text-slate-500 mb-2">
                    Manual
                  </p>
                  <ol className="space-y-2 text-sm font-light text-slate-600 dark:text-slate-400">
                    <li className="flex gap-3">
                      <span className="text-slate-400 dark:text-slate-600 shrink-0">
                        1.
                      </span>
                      <span>
                        Click{' '}
                        <strong className="font-medium text-slate-700 dark:text-slate-300">
                          Download
                        </strong>{' '}
                        to save{' '}
                        <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                          banner.svg
                        </code>
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-slate-400 dark:text-slate-600 shrink-0">
                        2.
                      </span>
                      <span>
                        Click{' '}
                        <strong className="font-medium text-slate-700 dark:text-slate-300">
                          Copy
                        </strong>{' '}
                        to copy the{' '}
                        <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                          README.md
                        </code>{' '}
                        snippet
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="text-slate-400 dark:text-slate-600 shrink-0">
                        3.
                      </span>
                      <span>
                        Commit both to your{' '}
                        <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                          {user.login}/{user.login}
                        </code>{' '}
                        repo
                      </span>
                    </li>
                  </ol>
                  <div className="mt-4 space-y-0">
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                      <p className="text-sm font-light text-slate-400 dark:text-slate-500 mb-2">
                        Auto-update with CLI
                      </p>
                      <ol className="space-y-2 text-sm font-light text-slate-600 dark:text-slate-400">
                        <li className="flex gap-3">
                          <span className="text-slate-400 dark:text-slate-600 shrink-0">
                            1.
                          </span>
                          <span>
                            Run{' '}
                            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              make setup
                            </code>{' '}
                            and set{' '}
                            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              GITHUB_USERNAME
                            </code>{' '}
                            and{' '}
                            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              PROFILE_REPO_TOKEN
                            </code>{' '}
                            in{' '}
                            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              .env
                            </code>
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-slate-400 dark:text-slate-600 shrink-0">
                            2.
                          </span>
                          <span>
                            Edit{' '}
                            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              readmecraft.yml
                            </code>{' '}
                            to configure template, theme and projects
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-slate-400 dark:text-slate-600 shrink-0">
                            3.
                          </span>
                          <span>
                            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              make build
                            </code>{' '}
                            — preview in{' '}
                            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              output/
                            </code>
                          </span>
                        </li>
                        <li className="flex gap-3">
                          <span className="text-slate-400 dark:text-slate-600 shrink-0">
                            4.
                          </span>
                          <span>
                            <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              make generate
                            </code>{' '}
                            — push to your profile repo
                          </span>
                        </li>
                      </ol>
                    </div>
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700 mt-4">
                      <p className="text-sm font-light text-slate-400 dark:text-slate-500 mb-2">
                        Auto-update with GitHub Actions
                      </p>
                      <p className="text-sm font-light text-slate-600 dark:text-slate-400">
                        Fork the repo and add{' '}
                        <code className="text-xs bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                          PROFILE_REPO_TOKEN
                        </code>{' '}
                        as a repository secret — runs every 15 days.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="backdrop-blur-lg bg-slate-50/80 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-slate-500 dark:text-slate-400 font-light">
          <p>
            Made with <span className="text-red-500">♥</span> by{' '}
            <a
              href="https://github.com/cristianrubioa"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              @cristianrubioa
            </a>{' '}
            ·{' '}
            <a
              href="https://crubio.fyi"
              className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              crubio.fyi
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
