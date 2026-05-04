---
name: frontend-pr-screenshot
description: >
  Capture a screenshot of the frontend app and post it to the current
  GitHub pull request. Use when a user asks to post a PR screenshot,
  show the UI in a PR comment, verify visual changes in a PR, or
  include visual evidence after UI work.
allowed-tools: >
  Bash(gh *), Bash(curl *), Bash(npx playwright*), Bash(lsof *),
  Bash(pnpm *), Bash(kill *), Bash(sleep *), Bash(jq *),
  Bash(seq *), Bash(cat *), Bash(date *)
---

# frontend-pr-screenshot

Posts a live screenshot of the frontend chat app to the active GitHub
pull request.

## Workflow

### Step 1 — Verify there is an open PR

```bash
PR_NUMBER=$(gh pr view --json number -q '.number' 2>/dev/null)
```

If this fails (exit code non-zero), there is no open PR for the
current branch. Tell the user to open one first and stop.

```bash
REPO=$(gh repo view --json nameWithOwner -q '.nameWithOwner')
```

### Step 2 — Ensure the dev server is running on port 3000

```bash
# Check if something is already listening on port 3000
if ! lsof -ti:3000 > /dev/null 2>&1; then
  echo "Starting dev server..."
  cd frontend && pnpm run dev &
  DEV_PID=$!
  # Give it up to 30 s to become ready
  READY=0
  for i in $(seq 1 30); do
    curl -sf http://localhost:3000 > /dev/null 2>&1 && READY=1 && break
    sleep 1
  done
  if [ "$READY" -eq 0 ]; then
    echo "Error: dev server did not become reachable within 30 s. Aborting."
    exit 1
  fi
fi
```

### Step 3 — Take a screenshot with Playwright

Use the Playwright CLI — it launches Chromium, navigates to the page,
waits for the chat input to appear (confirming the React app has
fully rendered), then saves the screenshot.

```bash
cd frontend && npx playwright screenshot \
  "http://localhost:3000/chat" \
  /tmp/frontend-screenshot.png \
  --wait-for-selector "[aria-label='Message']"
```

If Playwright is not installed, run:

```bash
pnpm exec playwright install chromium --with-deps
```

### Step 4 — Upload the PNG to GitHub's CDN

GitHub's issue-assets upload endpoint hosts the image and returns a
permanent URL that can be embedded in a PR comment.

```bash
TOKEN=$(gh auth token)
UPLOAD_RESPONSE=$(curl -s -X POST \
  "https://uploads.github.com/repos/${REPO}/issues/${PR_NUMBER}/assets\
?name=frontend-screenshot.png" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: image/png" \
  --data-binary "@/tmp/frontend-screenshot.png")

IMAGE_URL=$(echo "$UPLOAD_RESPONSE" | jq -r '.browser_download_url')
```

Verify `IMAGE_URL` is not `null` or empty before proceeding. If the
upload fails, tell the user what the API returned and stop — do not
post a broken comment.

### Step 5 — Post the screenshot as a PR comment

```bash
gh pr comment "$PR_NUMBER" --body "$(cat <<EOF
## Frontend Screenshot

![App screenshot](${IMAGE_URL})

> Captured from \`/chat\` — $(date -u '+%Y-%m-%d %H:%M UTC')
EOF
)"
```

### Step 6 — Clean up (optional)

If you started the dev server in Step 2, you may stop it:

```bash
[ -n "$DEV_PID" ] && kill "$DEV_PID" 2>/dev/null || true
```

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `gh pr view` fails | No open PR. Ask the user to open one first. |
| Screenshot is blank | Add `--timeout 15000` to the screenshot command. |
| Upload returns 404 | Check `REPO` with `gh repo view`. |
| Upload returns 403 | Re-authenticate: `gh auth login`. |
| `jq` not available | `brew install jq` or `apt-get install jq`. |
