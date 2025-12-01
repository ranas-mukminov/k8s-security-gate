import { Finding, ScanJob, SeverityLevel } from './types'
import yaml from 'js-yaml'

const SEVERITY_WEIGHTS: Record<SeverityLevel, number> = {
  CRITICAL: 20,
  HIGH: 12,
  MEDIUM: 6,
  LOW: 2,
}

export function calculateSecurityScore(findings: Finding[]): number {
  if (!findings || findings.length === 0) return 100

  const totalPenalty = findings.reduce((sum, finding) => {
    return sum + SEVERITY_WEIGHTS[finding.severity]
  }, 0)

  const score = Math.max(0, 100 - totalPenalty)
  return Math.round(score)
}

export function simulateScan(yamlContent: string): Finding[] {
  try {
    const parsed = yaml.load(yamlContent) as any
    const findings: Finding[] = []

    if (!parsed) return findings

    if (parsed.kind === 'Deployment' || parsed.kind === 'Pod') {
      const containers = parsed.spec?.template?.spec?.containers || parsed.spec?.containers || []
      
      containers.forEach((container: any, idx: number) => {
        const baseLineEstimate = 10 + idx * 15

        if (container.securityContext?.privileged === true) {
          findings.push({
            id: `CKV_K8S_16`,
            severity: 'CRITICAL',
            line: baseLineEstimate + 5,
            message: 'Container should not run in privileged mode',
            fix: 'Remove "privileged: true" from securityContext',
            category: 'Container Security'
          })
        }

        if (!container.securityContext?.runAsNonRoot) {
          findings.push({
            id: `CKV_K8S_40`,
            severity: 'HIGH',
            line: baseLineEstimate + 2,
            message: 'Container should not run as root',
            fix: 'Add "securityContext: { runAsNonRoot: true }"',
            category: 'Container Security'
          })
        }

        if (!container.securityContext?.readOnlyRootFilesystem) {
          findings.push({
            id: `CKV_K8S_6`,
            severity: 'MEDIUM',
            line: baseLineEstimate + 3,
            message: 'Container should use read-only root filesystem',
            fix: 'Add "readOnlyRootFilesystem: true" to securityContext',
            category: 'Container Security'
          })
        }

        if (container.imagePullPolicy !== 'Always') {
          findings.push({
            id: `CKV_K8S_15`,
            severity: 'LOW',
            line: baseLineEstimate + 1,
            message: 'Image pull policy should be Always',
            fix: 'Set "imagePullPolicy: Always"',
            category: 'Image Security'
          })
        }

        if (!container.resources?.limits) {
          findings.push({
            id: `CKV_K8S_11`,
            severity: 'MEDIUM',
            line: baseLineEstimate + 7,
            message: 'Container should have resource limits defined',
            fix: 'Add "resources.limits" section with CPU and memory limits',
            category: 'Resource Management'
          })
        }

        if (!container.livenessProbe) {
          findings.push({
            id: `CKV_K8S_8`,
            severity: 'LOW',
            line: baseLineEstimate + 8,
            message: 'Container should have liveness probe',
            fix: 'Add "livenessProbe" configuration',
            category: 'Reliability'
          })
        }
      })

      if (!parsed.spec?.template?.spec?.automountServiceAccountToken === false) {
        findings.push({
          id: `CKV_K8S_35`,
          severity: 'MEDIUM',
          line: 8,
          message: 'Service account token should not be automatically mounted',
          fix: 'Set "automountServiceAccountToken: false" in pod spec',
          category: 'Access Control'
        })
      }
    }

    if (parsed.kind === 'Service' && parsed.spec?.type === 'LoadBalancer') {
      findings.push({
        id: `CKV_K8S_22`,
        severity: 'MEDIUM',
        line: 6,
        message: 'LoadBalancer service exposes workload publicly',
        fix: 'Consider using ClusterIP or NodePort instead',
        category: 'Network Security'
      })
    }

    return findings
  } catch (error) {
    return []
  }
}

export async function processScans(scanJob: ScanJob): Promise<ScanJob> {
  await new Promise(resolve => setTimeout(resolve, 2000))

  const findings = simulateScan(scanJob.originalYaml)
  const score = calculateSecurityScore(findings)

  return {
    ...scanJob,
    status: 'COMPLETED',
    reportJson: findings,
    score,
  }
}
