#!/usr/bin/env bash
# k8s-security-gate — fail on CRITICAL/HIGH findings in Kubernetes manifests.
# Usage: ./scripts/gate.sh [path]
# Exit 0 = no critical/high; 1 = findings or error.
set -euo pipefail

SCAN_PATH="${1:-.}"
FAIL_ON="${FAIL_ON:-CRITICAL,HIGH}"
REPORT_DIR="${REPORT_DIR:-.gate-report}"
mkdir -p "$REPORT_DIR"

info() { echo "ℹ️  $*"; }
fail() { echo "❌ $*" >&2; exit 1; }

run_minimal_scanner() {
  info "checkov not found — using embedded minimal scanner (python3)"
  command -v python3 >/dev/null 2>&1 || fail "Need checkov or python3"
  python3 - "$SCAN_PATH" "$FAIL_ON" "$REPORT_DIR" <<'PY'
import json, sys
from pathlib import Path

scan_path, fail_on, report_dir = sys.argv[1], set(sys.argv[2].upper().split(",")), Path(sys.argv[3])
try:
    import yaml
except ImportError:
    print("PyYAML missing; install checkov or: pip install pyyaml", file=sys.stderr)
    sys.exit(2)

findings = []

def containers_from(doc):
    kind = doc.get("kind")
    if kind == "Pod":
        spec = doc.get("spec", {}) or {}
    elif kind in ("Deployment", "StatefulSet", "DaemonSet", "ReplicaSet", "Job"):
        spec = doc.get("spec", {}).get("template", {}).get("spec", {}) or {}
    elif kind == "CronJob":
        spec = (
            doc.get("spec", {})
            .get("jobTemplate", {})
            .get("spec", {})
            .get("template", {})
            .get("spec", {})
        ) or {}
    else:
        return [], {}
    # Include init/ephemeral — privileged initContainers otherwise bypass the gate.
    containers = (
        (spec.get("containers") or [])
        + (spec.get("initContainers") or [])
        + (spec.get("ephemeralContainers") or [])
    )
    return containers, spec

def scan_file(path: Path):
    text = path.read_text(encoding="utf-8", errors="replace")
    for doc in yaml.safe_load_all(text):
        if not isinstance(doc, dict):
            continue
        containers, pod_spec = containers_from(doc)
        meta = f"{doc.get('kind')}/{doc.get('metadata', {}).get('name', '?')}"
        if pod_spec.get("hostNetwork") is True:
            findings.append({"file": str(path), "resource": meta, "severity": "CRITICAL", "id": "CKV_K8S_9", "message": "hostNetwork should be false"})
        if pod_spec.get("hostPID") is True:
            findings.append({"file": str(path), "resource": meta, "severity": "CRITICAL", "id": "CKV_K8S_17", "message": "hostPID should be false"})
        for c in containers:
            name = c.get("name", "?")
            sc = c.get("securityContext") or {}
            if sc.get("privileged") is True:
                findings.append({"file": str(path), "resource": f"{meta}:{name}", "severity": "CRITICAL", "id": "CKV_K8S_16", "message": "Container must not run privileged"})
            if sc.get("allowPrivilegeEscalation") is True:
                findings.append({"file": str(path), "resource": f"{meta}:{name}", "severity": "HIGH", "id": "CKV_K8S_20", "message": "allowPrivilegeEscalation should be false"})
            if sc.get("runAsNonRoot") is not True:
                findings.append({"file": str(path), "resource": f"{meta}:{name}", "severity": "HIGH", "id": "CKV_K8S_40", "message": "Container should set runAsNonRoot: true"})

root = Path(scan_path)
files = (list(root.rglob("*.yml")) + list(root.rglob("*.yaml"))) if root.is_dir() else [root]
for f in files:
    if f.is_file():
        try:
            scan_file(f)
        except Exception as e:
            findings.append({"file": str(f), "resource": "-", "severity": "HIGH", "id": "PARSE", "message": f"Parse error: {e}"})

blocking = [f for f in findings if f["severity"] in fail_on]
report = {"fail_on": sorted(fail_on), "findings": findings, "blocking": blocking}
(report_dir / "report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
md = [
    "# K8s Security Gate Report",
    "",
    f"Fail on: {', '.join(sorted(fail_on))}",
    f"Total findings: {len(findings)}",
    f"Blocking: {len(blocking)}",
    "",
]
for f in findings:
    md.append(f"- **{f['severity']}** `{f['id']}` — {f['resource']} ({f['file']}): {f['message']}")
if not findings:
    md.append("_No findings._")
(report_dir / "report.md").write_text("\n".join(md) + "\n", encoding="utf-8")
print("\n".join(md))
sys.exit(1 if blocking else 0)
PY
}

run_checkov() {
  info "Running checkov on $SCAN_PATH (fail on $FAIL_ON)"
  SOFT_ON="$(
    printf '%s\n' CRITICAL HIGH MEDIUM LOW \
      | grep -vxF -f <(echo "$FAIL_ON" | tr ',' '\n') \
      | paste -sd, - || true
  )"
  ARGS=( -d "$SCAN_PATH" --framework kubernetes --output cli --output sarif --output-file-path "$REPORT_DIR" --compact )
  if [[ -n "${SOFT_ON}" ]]; then
    ARGS+=( --soft-fail-on "$SOFT_ON" )
  fi
  checkov "${ARGS[@]}"
}

if command -v checkov >/dev/null 2>&1; then
  run_checkov
else
  run_minimal_scanner
fi
