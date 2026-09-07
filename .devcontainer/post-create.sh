#!/usr/bin/env bash
# Runs once after the dev container is created.
# Installs the same tools and dependencies required for development and CI
# (see .github/workflows/qa.yml for the equivalent CI steps).
set -euo pipefail

# ──────────────────────────────────────────────────────────────────────────────
# uv — Python package / project manager (version locked to backend/pyproject.toml)
# ──────────────────────────────────────────────────────────────────────────────
UV_VERSION=$(
  python3 - <<'PY'
from pathlib import Path
import sys
import tomllib

try:
    pyproject = tomllib.loads(Path("backend/pyproject.toml").read_text())
    version = pyproject["tool"]["uv"]["required-version"]
except (FileNotFoundError, tomllib.TOMLDecodeError, KeyError, TypeError):
    print(
        "ERROR: could not read [tool.uv].required-version from backend/pyproject.toml",
        file=sys.stderr,
    )
    raise SystemExit(1)

print(str(version).removeprefix("=="))
PY
)
curl -fsSLO --retry 3 --retry-delay 2 --retry-all-errors \
  "https://github.com/astral-sh/uv/releases/download/${UV_VERSION}/uv-installer.sh"
echo "a3196b75f697a1adaa5e4af34ffba7629c710931ab1dac33bab59ecf228080bb  uv-installer.sh" | sha256sum -c
UV_VERSION="${UV_VERSION}" sh uv-installer.sh
rm uv-installer.sh
export PATH="$HOME/.local/bin:$PATH"
# Verify the installed version matches the pinned version
INSTALLED_UV_VERSION=$(uv --version)
echo "${INSTALLED_UV_VERSION}" | grep -qF "${UV_VERSION}" || {
  echo "ERROR: uv version mismatch — expected ${UV_VERSION}, got ${INSTALLED_UV_VERSION}"
  exit 1
}

# ──────────────────────────────────────────────────────────────────────────────
# pnpm — Node.js package manager (version locked to frontend/package.json)
# ──────────────────────────────────────────────────────────────────────────────
PNPM_VERSION=$(
  python3 - <<'PY'
from pathlib import Path
import json
import re
import sys

try:
    package_json = json.loads(Path("frontend/package.json").read_text())
    package_manager = package_json["packageManager"]
    match = re.fullmatch(r"pnpm@([^+]+)(?:\+sha512\..+)?", package_manager)
    if match is None:
        raise ValueError("packageManager must pin pnpm with an exact version")
except (FileNotFoundError, json.JSONDecodeError, KeyError, TypeError, ValueError) as error:
    print(f"ERROR: could not read pnpm version from frontend/package.json: {error}", file=sys.stderr)
    raise SystemExit(1)

print(match.group(1))
PY
)
PNPM_MACHINE=$(uname -m)
case "$PNPM_MACHINE" in
  x86_64)
    PNPM_ARCH="x64"
    PNPM_SHA256="9705e5704b4679fb503c963a18d1ac4f105e39aafafca8a2ed346facdf820cd0"
    ;;
  aarch64 | arm64)
    PNPM_ARCH="arm64"
    PNPM_SHA256="95e71a2a30bbc0b77511f95cf096779068dcad6ffcbbfdf0cd4dde9de2b2b97c"
    ;;
  *)
    echo "ERROR: unsupported pnpm architecture: $PNPM_MACHINE" >&2
    exit 1
    ;;
esac
PNPM_ARCHIVE="/tmp/pnpm-linux-${PNPM_ARCH}.tar.gz"
curl -fsSL --retry 3 --retry-delay 2 --retry-all-errors \
  "https://github.com/pnpm/pnpm/releases/download/v${PNPM_VERSION}/pnpm-linux-${PNPM_ARCH}.tar.gz" \
  -o "$PNPM_ARCHIVE"
echo "${PNPM_SHA256}  ${PNPM_ARCHIVE}" | sha256sum -c
tar -xzf "$PNPM_ARCHIVE" -C /tmp pnpm
sudo install -m 0755 /tmp/pnpm /usr/local/bin/pnpm
rm "$PNPM_ARCHIVE" /tmp/pnpm
INSTALLED_PNPM_VERSION=$(pnpm --version)
if [ "$INSTALLED_PNPM_VERSION" != "$PNPM_VERSION" ]; then
  echo "ERROR: pnpm version mismatch — expected ${PNPM_VERSION}, got ${INSTALLED_PNPM_VERSION}" >&2
  exit 1
fi

# ──────────────────────────────────────────────────────────────────────────────
# ls-lint — file-naming linter
# ──────────────────────────────────────────────────────────────────────────────
KERNEL=$(uname -s | tr '[:upper:]' '[:lower:]')
MACHINE=$(uname -m)
case "$MACHINE" in
  x86_64)  ARCH="amd64" ;;
  aarch64) ARCH="arm64" ;;
  *) echo "Unsupported architecture: $MACHINE" && exit 1 ;;
esac
curl -fsSL --retry 3 --retry-delay 2 --retry-all-errors \
  "https://github.com/loeffel-io/ls-lint/releases/download/v2.3.1/ls-lint-${KERNEL}-${ARCH}" \
  -o /tmp/ls-lint
case "${KERNEL}-${ARCH}" in
  linux-amd64)
    echo "b5a0d2e4427ad039fbc574551f17679f38f142b25d15e0e538769f8cf15af397  /tmp/ls-lint" | sha256sum -c
    ;;
  linux-arm64)
    echo "2abdb71243c619f0bb29587be5c228bec84c107985f2c066139ef0ec35fd3a99  /tmp/ls-lint" | sha256sum -c
    ;;
  *)
    echo "ERROR: no checksum available for ${KERNEL}-${ARCH}; refusing to install unverified binary" >&2
    rm /tmp/ls-lint
    exit 1
    ;;
esac
sudo install -m 0755 /tmp/ls-lint /usr/local/bin/ls-lint
rm /tmp/ls-lint

# ──────────────────────────────────────────────────────────────────────────────
# Backend — Python dependencies (uv installs the pinned Python version too)
# ──────────────────────────────────────────────────────────────────────────────
cd backend
uv python install
uv sync --frozen
cd ..

# ──────────────────────────────────────────────────────────────────────────────
# Frontend — Node.js dependencies + Playwright browser binaries
# ──────────────────────────────────────────────────────────────────────────────
cd frontend
# confirmModulesPurge=false: when a local checkout is mounted into the
# container, any node_modules built on the host (different OS/arch) must be
# purged and reinstalled for Linux. Without a TTY, pnpm would otherwise abort
# rather than prompt for confirmation.
pnpm install --frozen-lockfile --config.confirmModulesPurge=false
pnpm exec playwright install --with-deps
cd ..

# ──────────────────────────────────────────────────────────────────────────────
# .env — provide a starter env file if none exists yet
# ──────────────────────────────────────────────────────────────────────────────
if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo ""
  echo "⚠️  Created backend/.env from .env.example."
  echo "    Fill in your Azure OpenAI credentials before running the app."
fi

# ──────────────────────────────────────────────────────────────────────────────
# Git hooks — install pre-commit / pre-push hooks via prek
# ──────────────────────────────────────────────────────────────────────────────
cd backend
uv run prek install
cd ..
