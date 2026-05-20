import { useState, useEffect } from 'react'
import type { ContribData } from '../types/github'

export function useGithubContributions(username: string | null) {
  const [contribData, setContribData] = useState<ContribData | null>(null)

  useEffect(() => {
    if (!username) return
    setContribData(null)
    fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.total?.lastYear != null && Array.isArray(data.contributions)) {
          setContribData({
            total: data.total.lastYear,
            daily: data.contributions.map((c: { date: string; count: number }) => ({
              date: c.date,
              count: c.count,
            })),
          })
        }
      })
      .catch(() => {})
  }, [username])

  return contribData
}
