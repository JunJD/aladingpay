import { useRef, useEffect, useState } from 'react'

interface UsePollingOptions {
  interval?: number
  timeout?: number
  onTimeout?: () => void
}

export function usePolling(
  callback: () => Promise<boolean>,
  options: UsePollingOptions = {}
) {
  const {
    interval = 3000,
    timeout = 120,
    onTimeout
  } = options

  const [countdown, setCountdown] = useState(timeout)
  const [querying, setQuerying] = useState(false)
  const pollingRef = useRef(false)
  const timerRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (pollingRef.current && countdown > 0) {
      timerRef.current = setInterval(() => {
        setCountdown(prev => prev - 1)
      }, 1000)

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown, pollingRef.current])

  useEffect(() => {
    if (countdown <= 0) {
      pollingRef.current = false
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      onTimeout?.()
    }
  }, [countdown, onTimeout])

  useEffect(() => {
    return () => {
      pollingRef.current = false
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startPolling = async () => {
    if (!pollingRef.current || countdown <= 0) return

    try {
      setQuerying(true)
      const shouldStop = await callback()

      if (shouldStop) {
        pollingRef.current = false
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }
        return
      }

      if (pollingRef.current && countdown > 0) {
        setTimeout(() => startPolling(), interval)
      }
    } catch (error) {
      console.error('Polling error:', error)
    } finally {
      setQuerying(false)
    }
  }

  const start = () => {
    pollingRef.current = true
    startPolling()
  }

  const stop = () => {
    pollingRef.current = false
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  return {
    start,
    stop,
    querying,
    countdown,
    setCountdown,
    isPolling: pollingRef.current
  }
} 