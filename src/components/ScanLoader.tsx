import { useEffect, useState } from 'react'

const messages = [
  'Initializing security scanner...',
  'Analyzing Kubernetes resources...',
  'Checking container configurations...',
  'Validating security contexts...',
  'Scanning for vulnerabilities...',
  'Evaluating network policies...',
  'Reviewing access controls...',
  'Generating security report...',
]

export function ScanLoader() {
  const [messageIndex, setMessageIndex] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length)
    }, 400)

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 300)

    return () => {
      clearInterval(messageInterval)
      clearInterval(dotsInterval)
    }
  }, [])

  return (
    <div className="flex items-center justify-center h-full bg-background/95">
      <div className="text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 mx-auto rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-primary/20 glow-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <p className="text-primary font-mono text-sm font-semibold">
            {messages[messageIndex]}{dots}
          </p>
          <p className="text-muted-foreground text-xs">
            Running Checkov security analysis
          </p>
        </div>

        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-primary/50"
              style={{
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
