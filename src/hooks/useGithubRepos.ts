import { useState, useEffect } from 'react'
import type { GithubRepo } from '../types/github'

export function useGithubRepos(username: string | null) {
  const [repos, setRepos] = useState<GithubRepo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) {
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)

    fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=100`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch repositories')
        }
        return res.json()
      })
      .then((data: GithubRepo[]) => {
        setRepos(data)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch repos')
        setRepos([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [username])

  return { repos, loading, error }
}
