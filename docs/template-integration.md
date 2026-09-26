# Integrating k8s-security-gate with Secure-K3s-GitOps-Template

## Goal

Fail CI when Kubernetes manifests introduce **CRITICAL** or **HIGH** misconfigurations before they reach the cluster.

## Option A — Copy-paste workflow (recommended)

1. Copy [`examples/secure-k3s-gitops-template.yml`](../examples/secure-k3s-gitops-template.yml) into the template as `.github/workflows/k8s-security-gate.yml`.
2. Keep path filters on `cluster/**` and `infrastructure/**` so empty template trees do not fail.
3. On first real manifests under those paths, Checkov runs and **fails the job on CRITICAL/HIGH** (MEDIUM/LOW soft-fail).

> Note: workflow files are shipped under `examples/` (not `.github/workflows/` in this repo) so consumers copy them deliberately — avoids accidental broken CI on empty trees and keeps this repo's Actions surface minimal.

## Option B — Reusable workflow

1. Copy [`examples/workflows/reusable-security-gate.yml`](../examples/workflows/reusable-security-gate.yml) into a repo you own.
2. Call it from the template:

```yaml
jobs:
  gate:
    uses: OWNER/REPO/.github/workflows/reusable-security-gate.yml@main
    with:
      directory: cluster
      soft_fail_on: MEDIUM,LOW
```

## Option C — Local script

```bash
./scripts/gate.sh cluster
# report: .gate-report/report.md + report.json
```

## Example report artifact

```markdown
# K8s Security Gate Report
Fail on: CRITICAL, HIGH
Total findings: 2
Blocking: 2
- **CRITICAL** `CKV_K8S_16` — Deployment/dirty-app:app: Container must not run privileged
- **CRITICAL** `CKV_K8S_9` — Deployment/dirty-app: hostNetwork should be false
```

## Related

- Template: https://github.com/ranas-mukminov/Secure-K3s-GitOps-Template
- Runtime sanity check: https://github.com/ranas-mukminov/Kube-Simple-Audit
