import { useEffect, useState } from 'react'
import type { GithubUser } from '../types/github'

export function useGithubUser(username: string | null) {
  const [user, setUser] = useState<GithubUser | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!username) {
      setUser(null)
      setError(null)
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)

    fetch(`https://api.github.com/users/${username}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('User not found')
        }
        return res.json()
      })
      .then((data: GithubUser) => {
        setUser(data)
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to fetch user')
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [username])

  return { user, loading, error }
}
