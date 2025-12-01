import { Badge } from '@/components/ui/badge'
import { useEffect, useState } from 'react'

interface SecurityScoreBadgeProps {
  score: number
}

export function SecurityScoreBadge({ score }: SecurityScoreBadgeProps) {
  const [displayScore, setDisplayScore] = useState(0)

  useEffect(() => {
    const duration = 800
    const steps = 30
    const increment = score / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(timer)
      } else {
        setDisplayScore(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [score])

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'bg-accent text-accent-foreground'
    if (s >= 50) return 'bg-warning text-warning-foreground'
    return 'bg-destructive text-destructive-foreground'
  }

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'Good'
    if (s >= 50) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-right">
        <p className="text-xs text-muted-foreground">Security Score</p>
        <p className="text-sm font-semibold">{getScoreLabel(score)}</p>
      </div>
      <Badge 
        className={`text-2xl font-bold px-4 py-2 ${getScoreColor(score)} glow-cyan transition-all`}
      >
        {displayScore}
      </Badge>
    </div>
  )
}
