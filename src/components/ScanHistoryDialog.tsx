import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScanJob } from '@/lib/types'
import { Clock, FileCode, CheckCircle, XCircle, Loader } from 'lucide-react'

interface ScanHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  scans: ScanJob[]
  onLoadScan: (scan: ScanJob) => void
}

export function ScanHistoryDialog({ open, onOpenChange, scans, onLoadScan }: ScanHistoryDialogProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-accent" />
      case 'FAILED':
        return <XCircle className="w-4 h-4 text-destructive" />
      case 'PROCESSING':
      case 'PENDING':
        return <Loader className="w-4 h-4 text-primary animate-spin" />
      default:
        return null
    }
  }

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-muted text-muted-foreground'
    if (score >= 80) return 'bg-accent text-accent-foreground'
    if (score >= 50) return 'bg-warning text-warning-foreground'
    return 'bg-destructive text-destructive-foreground'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Scan History
          </DialogTitle>
          <DialogDescription>
            View and restore previous security scans
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {scans.length === 0 ? (
            <div className="text-center py-12">
              <FileCode className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No scans yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Your scan history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan) => (
                <Card
                  key={scan.id}
                  className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg hover:border-primary/50"
                  onClick={() => {
                    onLoadScan(scan)
                    onOpenChange(false)
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <FileCode className="w-4 h-4 text-primary shrink-0" />
                          <p className="font-semibold font-mono text-sm truncate">
                            {scan.filename}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(scan.createdAt)}
                          </span>
                          
                          {scan.reportJson && (
                            <span>
                              {scan.reportJson.length} finding{scan.reportJson.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {scan.score !== undefined ? (
                          <Badge className={`${getScoreColor(scan.score)} font-bold`}>
                            {scan.score}
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            {getStatusIcon(scan.status)}
                            <span className="text-xs text-muted-foreground">
                              {scan.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
