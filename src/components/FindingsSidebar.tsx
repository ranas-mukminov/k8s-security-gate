import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Info, AlertCircle, XCircle } from 'lucide-react'
import { Finding, SeverityLevel } from '@/lib/types'
import { ScrollArea } from '@/components/ui/scroll-area'

interface FindingsSidebarProps {
  findings: Finding[]
  onFindingClick: (line: number) => void
}

const severityConfig: Record<SeverityLevel, { color: string; icon: typeof AlertTriangle; bg: string }> = {
  CRITICAL: { 
    color: 'text-destructive', 
    icon: XCircle,
    bg: 'bg-destructive/10 border-destructive'
  },
  HIGH: { 
    color: 'text-destructive', 
    icon: AlertCircle,
    bg: 'bg-destructive/10 border-destructive'
  },
  MEDIUM: { 
    color: 'text-warning', 
    icon: AlertTriangle,
    bg: 'bg-warning/10 border-warning'
  },
  LOW: { 
    color: 'text-info', 
    icon: Info,
    bg: 'bg-info/10 border-info'
  },
}

export function FindingsSidebar({ findings, onFindingClick }: FindingsSidebarProps) {
  if (findings.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-4">🛡️</div>
          <p className="text-muted-foreground">No findings yet</p>
          <p className="text-sm text-muted-foreground mt-2">Scan a manifest to see results</p>
        </div>
      </div>
    )
  }

  const groupedFindings = findings.reduce((acc, finding) => {
    if (!acc[finding.severity]) {
      acc[finding.severity] = []
    }
    acc[finding.severity].push(finding)
    return acc
  }, {} as Record<SeverityLevel, Finding[]>)

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-lg">Security Findings</h3>
        <p className="text-sm text-muted-foreground mt-1">
          {findings.length} issue{findings.length !== 1 ? 's' : ''} detected
        </p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as SeverityLevel[]).map((severity) => {
            const items = groupedFindings[severity]
            if (!items || items.length === 0) return null

            const config = severityConfig[severity]
            const Icon = config.icon

            return (
              <div key={severity} className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${config.color}`} />
                  <span className={`text-sm font-semibold ${config.color}`}>
                    {severity}
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    {items.length}
                  </Badge>
                </div>
                
                {items.map((finding) => (
                  <Card
                    key={finding.id}
                    className={`cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg ${config.bg} border-l-4`}
                    onClick={() => onFindingClick(finding.line)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium font-mono leading-tight flex-1">
                          {finding.message}
                        </p>
                        <Badge variant="outline" className="text-xs font-mono shrink-0">
                          L{finding.line}
                        </Badge>
                      </div>
                      
                      {finding.category && (
                        <p className="text-xs text-muted-foreground mb-2">
                          {finding.category}
                        </p>
                      )}
                      
                      {finding.fix && (
                        <div className="mt-2 pt-2 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-1">Fix:</p>
                          <code className="text-xs bg-background/50 px-2 py-1 rounded block">
                            {finding.fix}
                          </code>
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        {finding.id}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
