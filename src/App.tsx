import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { YamlEditor } from '@/components/YamlEditor'
import { FindingsSidebar } from '@/components/FindingsSidebar'
import { ScanLoader } from '@/components/ScanLoader'
import { SecurityScoreBadge } from '@/components/SecurityScoreBadge'
import { ScanHistoryDialog } from '@/components/ScanHistoryDialog'
import { ScanJob } from '@/lib/types'
import { processScans } from '@/lib/scanner'
import { Shield, Play, Clock, Menu, X } from 'lucide-react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

const DEFAULT_YAML = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:1.14.2
        ports:
        - containerPort: 80
        securityContext:
          privileged: true
`

function App() {
  const [scans, setScans] = useKV<ScanJob[]>('scan-history', [])
  const [currentScan, setCurrentScan] = useState<ScanJob | null>(null)
  const [yamlContent, setYamlContent] = useState(DEFAULT_YAML)
  const [isScanning, setIsScanning] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (scans && scans.length > 0) {
      const latest = scans[0]
      if (latest.status === 'COMPLETED') {
        setCurrentScan(latest)
        setYamlContent(latest.originalYaml)
      }
    }
  }, [])

  const handleScan = async () => {
    if (!yamlContent.trim()) {
      toast.error('Please enter YAML content to scan')
      return
    }

    const newScan: ScanJob = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      filename: 'manifest.yaml',
      originalYaml: yamlContent,
    }

    setIsScanning(true)
    setCurrentScan(newScan)
    toast.info('Starting security scan...')

    try {
      const completedScan = await processScans(newScan)
      
      setCurrentScan(completedScan)
      setScans((current) => [completedScan, ...(current || [])].slice(0, 20))

      const findingsCount = completedScan.reportJson?.length || 0
      
      if (findingsCount === 0) {
        toast.success('Scan complete - No vulnerabilities detected! 🎉')
      } else {
        toast.warning(`Scan complete - ${findingsCount} issue${findingsCount !== 1 ? 's' : ''} found`)
      }
    } catch (error) {
      toast.error('Scan failed - please try again')
      setCurrentScan({ ...newScan, status: 'FAILED' })
    } finally {
      setIsScanning(false)
    }
  }

  const handleLoadScan = (scan: ScanJob) => {
    setCurrentScan(scan)
    setYamlContent(scan.originalYaml)
    toast.success('Scan loaded from history')
  }

  const handleFindingClick = (line: number) => {
    toast.info(`Navigating to line ${line}`)
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Toaster />
      
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  K8s Security Gate
                </h1>
                <p className="text-sm text-muted-foreground">
                  by Ranas Security
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {currentScan?.score !== undefined && (
                <SecurityScoreBadge score={currentScan.score} />
              )}
              
              <Button
                variant="outline"
                size="default"
                onClick={() => setHistoryOpen(true)}
                className="gap-2"
              >
                <Clock className="w-4 h-4" />
                History
              </Button>

              <Button
                size="default"
                onClick={handleScan}
                disabled={isScanning}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan"
              >
                <Play className="w-4 h-4" />
                {isScanning ? 'Scanning...' : 'Scan Manifest'}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full relative">
            {isScanning && (
              <div className="absolute inset-0 z-10">
                <ScanLoader />
              </div>
            )}
            <YamlEditor
              value={yamlContent}
              onChange={setYamlContent}
              findings={currentScan?.reportJson || []}
              readonly={isScanning}
            />
          </div>
        </div>

        <div
          className={`w-full lg:w-96 border-l border-border bg-card/30 transition-all duration-300 ${
            sidebarOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <FindingsSidebar
            findings={currentScan?.reportJson || []}
            onFindingClick={handleFindingClick}
          />
        </div>
      </div>

      <ScanHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        scans={scans || []}
        onLoadScan={handleLoadScan}
      />
    </div>
  )
}

export default App