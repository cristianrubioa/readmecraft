import type {
  ContribData,
  GithubRepo,
  GithubUser,
  SectionState,
} from '../types/github'

const LANG_COLORS: Record<string, string> = {
  Python: '#3572A5',
  JavaScript: '#f1e05a',
  TypeScript: '#2b7489',
  'C++': '#f34b7d',
  C: '#555555',
  'C#': '#178600',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Shell: '#89e051',
  HTML: '#e34c26',
  CSS: '#563d7c',
  'Jupyter Notebook': '#DA5B0B',
  Assembly: '#6E4C13',
  Dart: '#00B4AB',
  Vue: '#41b883',
  R: '#198CE7',
  Scala: '#c22d40',
  Elixir: '#6e4a7e',
  Haskell: '#5e5086',
  Lua: '#000080',
  Zig: '#ec915c',
  HCL: '#844FBA',
  MATLAB: '#e16737',
}

const THEMES = {
  dark: {
    bg: '#161b22',
    accent: '#39d353',
    textBold: '#e6edf3',
    subtext: '#8b949e',
    italic: '#c9d1d9',
    divider: '#30363d',
    label: '#484f58',
    langText: '#c9d1d9',
    langCount: '#6e7681',
    star: '#f1c232',
  },
  light: {
    bg: '#ffffff',
    accent: '#2da44e',
    textBold: '#24292f',
    subtext: '#57606a',
    italic: '#57606a',
    divider: '#d0d7de',
    label: '#6e7781',
    langText: '#24292f',
    langCount: '#57606a',
    star: '#e3a008',
  },
} as const

type BannerTheme = keyof typeof THEMES

function xe(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function trunc(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s
}

function topLangs(repos: GithubRepo[]): [string, number][] {
  const m = new Map<string, number>()
  for (const r of repos)
    if (r.language) m.set(r.language, (m.get(r.language) ?? 0) + 1)
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
}

function weeklyBuckets(daily: { date: string; count: number }[]): number[] {
  const weeks: number[] = []
  for (let i = 0; i < daily.length; i += 7) {
    weeks.push(daily.slice(i, i + 7).reduce((s, d) => s + d.count, 0))
  }
  return weeks
}

function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return ''
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`
  const n = pts.length
  for (let i = 0; i < n - 1; i++) {
    const p0 = i === 0 ? pts[0] : pts[i - 1]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = i + 2 < n ? pts[i + 2] : pts[n - 1]
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`
  }
  return d
}

export function generateBanner(
  user: GithubUser,
  repos: GithubRepo[],
  sections: SectionState = {
    about: true,
    stats: true,
    skills: true,
    projects: true,
  },
  contribData: ContribData | null = null,
  selectedRepos: GithubRepo[] = [],
  theme: BannerTheme = 'dark',
): string {
  const t = THEMES[theme]
  const W = 900
  const PAD = 24
  const totalStars = repos.reduce((s, r) => s + r.stargazers_count, 0)
  const langs = sections.skills ? topLangs(repos) : []

  const rows: string[] = []
  let cy = 44
  let chartTop = 0
  const CHART_H = 80

  // Username
  rows.push(
    `<text x="${PAD}" y="${cy}" font-family="Consolas,'Courier New',monospace" font-size="28" font-weight="700" fill="${t.accent}">${xe(user.login)}</text>`,
  )
  cy += 30

  // Stats: followers · repos · contributions · ⭐ stars
  if (sections.stats) {
    let statsText =
      `<text x="${PAD}" y="${cy}" font-family="Consolas,monospace" font-size="13.5">` +
      `<tspan font-weight="700" fill="${t.textBold}">${user.followers}</tspan><tspan fill="${t.subtext}"> followers   </tspan>` +
      `<tspan font-weight="700" fill="${t.textBold}">${user.public_repos}</tspan><tspan fill="${t.subtext}"> repos   </tspan>`
    if (contribData != null) {
      statsText += `<tspan font-weight="700" fill="${t.textBold}">${contribData.total}</tspan><tspan fill="${t.subtext}"> contributions   </tspan>`
    }
    statsText +=
      `<tspan fill="${t.star}">⭐</tspan><tspan fill="${t.subtext}"> </tspan>` +
      `<tspan font-weight="700" fill="${t.textBold}">${totalStars}</tspan><tspan fill="${t.subtext}"> stars</tspan>` +
      `</text>`
    rows.push(statsText)
    cy += 26
  }

  // Location / company / bio
  if (sections.about) {
    const meta: string[] = []
    if (user.location) meta.push(`\u{1F4CD} ${xe(user.location)}`)
    if (user.company) meta.push(`\u{1F3E2} ${xe(trunc(user.company, 32))}`)
    if (meta.length) {
      rows.push(
        `<text x="${PAD}" y="${cy}" font-family="Consolas,monospace" font-size="13" fill="${t.subtext}">${meta.join('   ')}</text>`,
      )
      cy += 26
    }
    const bio = user.bio ? trunc(user.bio, 88) : ''
    if (bio) {
      rows.push(
        `<text x="${PAD}" y="${cy}" font-family="Consolas,monospace" font-size="13" fill="${t.italic}" font-style="italic">"${xe(bio)}"</text>`,
      )
      cy += 26
    }
  }

  // Divider + TOP LANGUAGES
  if (langs.length > 0) {
    cy += 4
    const divY = cy
    cy += 18
    const labelY = cy
    cy += 22
    const dotsY = cy
    const CW = 7.5
    let lx = PAD
    let dotsSvg = ''
    for (const [lang, count] of langs) {
      const color = LANG_COLORS[lang] ?? '#888888'
      const entry = `${lang} (${count})`
      const entryW = 14 + entry.length * CW + 14
      if (lx + entryW > W - PAD) break
      dotsSvg += `<circle cx="${lx + 5}" cy="${dotsY}" r="5" fill="${color}"/>`
      dotsSvg += `<text x="${lx + 14}" y="${dotsY + 4}" font-family="Consolas,'Courier New',monospace" font-size="13"><tspan fill="${t.langText}" font-weight="600">${xe(lang)}</tspan> <tspan fill="${t.langCount}">(${count})</tspan></text>`
      lx += entryW
    }
    rows.push(
      `<line x1="${PAD}" y1="${divY}" x2="${W - PAD}" y2="${divY}" stroke="${t.divider}" stroke-width="1"/>`,
    )
    rows.push(
      `<text x="${PAD}" y="${labelY}" font-family="Consolas,monospace" font-size="10" fill="${t.label}" letter-spacing="1.5">TOP LANGUAGES</text>`,
    )
    rows.push(dotsSvg)
    cy += 16
  }

  // Contribution line chart
  const hasChart = contribData != null && contribData.daily.length >= 7
  if (hasChart) {
    cy += 12
    rows.push(
      `<line x1="${PAD}" y1="${cy}" x2="${W - PAD}" y2="${cy}" stroke="${t.divider}" stroke-width="1"/>`,
    )
    cy += 16

    const chartX = PAD
    const chartW = W - 2 * PAD
    chartTop = cy

    const weeks = weeklyBuckets(contribData?.daily)
    const maxVal = Math.max(...weeks, 1)
    const n = Math.max(weeks.length - 1, 1)
    const pts: [number, number][] = weeks.map((sum, i) => [
      chartX + (i * chartW) / n,
      chartTop + CHART_H - (sum / maxVal) * CHART_H * 0.92,
    ])

    const line = smoothPath(pts)
    const fillPath =
      line +
      ` L ${pts[pts.length - 1][0].toFixed(1)} ${(chartTop + CHART_H).toFixed(1)}` +
      ` L ${chartX} ${(chartTop + CHART_H).toFixed(1)} Z`

    rows.push(`<path d="${fillPath}" fill="url(#chartFill)"/>`)
    rows.push(
      `<path d="${line}" fill="none" stroke="${t.accent}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>`,
    )

    const MONTHS = [
      'jan',
      'feb',
      'mar',
      'apr',
      'may',
      'jun',
      'jul',
      'aug',
      'sep',
      'oct',
      'nov',
      'dec',
    ]
    const labelY = chartTop + CHART_H + 14
    let lastMonth = -1
    for (let i = 0; i < weeks.length; i++) {
      const dayEntry = contribData?.daily[i * 7]
      if (!dayEntry) continue
      const month = new Date(`${dayEntry.date}T00:00:00`).getMonth()
      if (month !== lastMonth) {
        const x = chartX + (i * chartW) / n
        rows.push(
          `<text x="${x.toFixed(1)}" y="${labelY}" font-family="Consolas,monospace" font-size="10" fill="${t.label}">${MONTHS[month]}</text>`,
        )
        lastMonth = month
      }
    }

    cy = labelY + 8
  }

  // Featured Projects table
  if (sections.projects && selectedRepos.length > 0) {
    cy += 12
    rows.push(
      `<line x1="${PAD}" y1="${cy}" x2="${W - PAD}" y2="${cy}" stroke="${t.divider}" stroke-width="1"/>`,
    )
    cy += 20

    rows.push(
      `<text x="${PAD}" y="${cy}" font-family="Consolas,'Courier New',monospace" font-size="13" font-weight="700" fill="${t.accent}">\u{1F680} FEATURED PROJECTS</text>`,
    )
    cy += 24

    const colStars = PAD + 520
    const colLang = PAD + 660

    rows.push(
      `<text x="${PAD}" y="${cy}" font-family="Consolas,monospace" font-size="10" fill="${t.label}" letter-spacing="1.5">PROJECT</text>` +
        `<text x="${colStars}" y="${cy}" font-family="Consolas,monospace" font-size="10" fill="${t.label}" letter-spacing="1.5">STARS</text>` +
        `<text x="${colLang}" y="${cy}" font-family="Consolas,monospace" font-size="10" fill="${t.label}" letter-spacing="1.5">LANGUAGE</text>`,
    )
    cy += 8
    rows.push(
      `<line x1="${PAD}" y1="${cy}" x2="${W - PAD}" y2="${cy}" stroke="${t.divider}" stroke-width="1"/>`,
    )
    cy += 18

    for (const repo of selectedRepos) {
      const name = trunc(repo.name, 55)
      const stars =
        repo.stargazers_count > 0 ? `⭐ ${repo.stargazers_count}` : '—'
      const lang = repo.language ?? '—'
      rows.push(
        `<text x="${PAD}" y="${cy}" font-family="Consolas,monospace" font-size="13" fill="${t.langText}">${xe(name)}</text>` +
          `<text x="${colStars}" y="${cy}" font-family="Consolas,monospace" font-size="13" fill="${t.textBold}">${xe(stars)}</text>` +
          `<text x="${colLang}" y="${cy}" font-family="Consolas,monospace" font-size="13" fill="${t.subtext}">${xe(lang)}</text>`,
      )
      cy += 22
    }
  }

  const H = cy + 18

  const defs = hasChart
    ? `<defs>
    <linearGradient id="chartFill" x1="0" y1="${chartTop}" x2="0" y2="${chartTop + CHART_H}" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${t.accent}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${t.accent}" stop-opacity="0"/>
    </linearGradient>
  </defs>`
    : ''

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  ${defs}
  <rect width="${W}" height="${H}" fill="${t.bg}"/>
  ${rows.join('\n  ')}
</svg>`
}
