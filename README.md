# k8s-security-gate

![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)
![CI](https://img.shields.io/badge/gate-CRITICAL%2FHIGH%20fail-red)

Kubernetes manifest security gate for the **Secure K3s Starter** hub: reusable CI that **fails on CRITICAL and HIGH** findings, plus a local scanner and interactive Spark UI (see `PRD.md`).

**Consumers:** [Secure-K3s-GitOps-Template](https://github.com/ranas-mukminov/Secure-K3s-GitOps-Template) · [Kube-Simple-Audit](https://github.com/ranas-mukminov/Kube-Simple-Audit)

## Quick integrate (copy-paste)

Copy the ready-made workflow into your template/fork as `.github/workflows/k8s-security-gate.yml`:

```bash
# from a clone of this repo:
cp examples/secure-k3s-gitops-template.yml \
  /path/to/Secure-K3s-GitOps-Template/.github/workflows/k8s-security-gate.yml
```

The snippet:

- Scopes to `cluster/**` and `infrastructure/**` YAML (skips when none exist — safe for empty templates)
- Runs Checkov with **soft-fail on MEDIUM/LOW** → job fails only on **CRITICAL/HIGH**
- Uploads a SARIF artifact and writes a GitHub Step Summary

Full guide: [`docs/template-integration.md`](docs/template-integration.md)

## Local one-liner

```bash
./scripts/gate.sh path/to/manifests
# → .gate-report/report.md
```

Requires `checkov` **or** `python3` + `PyYAML`.

## Reusable workflow (optional)

Copy [`examples/workflows/reusable-security-gate.yml`](examples/workflows/reusable-security-gate.yml) into a repo you control under `.github/workflows/`, then call it:

```yaml
jobs:
  gate:
    uses: OWNER/REPO/.github/workflows/reusable-security-gate.yml@main
    with:
      directory: cluster
```

## Example report

See `scripts/gate.sh` output / `.gate-report/report.md`:

```markdown
# K8s Security Gate Report
Fail on: CRITICAL, HIGH
Blocking: 2
- **CRITICAL** `CKV_K8S_16` — … privileged …
```

Fixtures under `examples/fixtures/{clean,dirty}` demonstrate pass/fail.

## Interactive UI

Spark/Vite UI for visualizing Checkov-style findings lives in `src/` (`PRD.md`). The CI snippet above is the production integration path for GitOps templates.

## License

MIT
