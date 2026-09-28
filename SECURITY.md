# Security Policy

This repository is maintained by **ranas-mukminov** (Ranas Security / [run-as-daemon.dev](https://run-as-daemon.dev)). It is **not** a GitHub-owned project and is outside GitHub’s bug bounty scope.

## Reporting a vulnerability

**Please do not open a public issue for security reports.**

Prefer one of:

1. **GitHub private vulnerability reporting** — use *Security* → *Report a vulnerability* on this repository (enable if not already on).
2. **Email:** `security@run-as-daemon.dev` (or Telegram [@run_as_daemon_dev](https://t.me/run_as_daemon_dev) if email is unavailable).

Include, when possible:

- Affected path / commit / tag
- Impact and a minimal reproduction
- Whether the issue is in the checkov path or the embedded minimal scanner in `scripts/gate.sh`

We aim to acknowledge reports within a few business days.

## Scope notes

- The embedded scanner is a **fallback** when checkov is missing; prefer checkov in CI for production gates.
- Example fixtures under `examples/` may intentionally contain insecure manifests for self-tests.
