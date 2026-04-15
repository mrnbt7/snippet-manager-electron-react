# GitHub Setup & Deployment Guide

Step-by-step instructions to configure GitHub for automated builds and releases.

---

## Step 1 — Create the GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `snippet-manager-electron-react`
3. Visibility: **Public** (or Private — Actions work on both)
4. Do **not** initialize with README (you already have one)
5. Click **Create repository**

## Step 2 — Push Your Code

```bash
cd snippet-manager-electron-react

git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/mrnbt7/snippet-manager-electron-react.git
git push -u origin main
```

> Replace `mrnbt7` with your GitHub username.

## Step 3 — Verify GitHub Actions Runs

1. Go to your repo on GitHub
2. Click the **Actions** tab
3. You should see a **Build & Release** workflow running (triggered by the push to `main`)
4. Wait for it to complete — all 3 jobs (Windows, macOS, Linux) should pass ✅
5. Click into the run → **Artifacts** section to see the uploaded installers

If the workflow doesn't appear, ensure `.github/workflows/build.yml` was pushed.

## Step 4 — Configure Repository Settings

### 4a. Workflow Permissions

The workflow needs write access to create releases:

1. Go to **Settings → Actions → General**
2. Scroll to **Workflow permissions**
3. Select **Read and write permissions**
4. Check **Allow GitHub Actions to create and approve pull requests** (optional)
5. Click **Save**

### 4b. Branch Protection (Recommended)

Protect `main` so only passing builds get merged:

1. Go to **Settings → Branches**
2. Click **Add branch protection rule**
3. Branch name pattern: `main`
4. Enable:
   - ✅ **Require a pull request before merging**
   - ✅ **Require status checks to pass before merging**
   - Click **Search for status checks** → select `build (windows-latest, win)`, `build (macos-latest, mac)`, `build (ubuntu-latest, linux)`
   - ✅ **Require branches to be up to date before merging**
5. Click **Create**

## Step 5 — Create Your First Release

### 5a. Tag the commit

```bash
git tag v0.1.0
git push origin v0.1.0
```

### 5b. Watch the build

1. Go to **Actions** tab
2. The **Build & Release** workflow will run with all 3 platform jobs
3. After the build jobs complete, the **release** job will:
   - Download all artifacts
   - Create a GitHub Release at tag `v0.1.0`
   - Attach all installers

### 5c. Verify the release

1. Go to **Releases** (right sidebar on repo page, or Code → Releases)
2. You should see `v0.1.0` with:
   - Auto-generated release notes
   - Attached files:
     - `Snippet Manager Setup x.x.x.exe` (Windows NSIS installer)
     - `Snippet Manager x.x.x.exe` (Windows portable)
     - `Snippet Manager-x.x.x.dmg` (macOS)
     - `Snippet Manager-x.x.x-mac.zip` (macOS ZIP)
     - `Snippet-Manager-x.x.x.AppImage` (Linux)
     - `snippet-manager_x.x.x_amd64.deb` (Linux Debian)

## Step 6 — Subsequent Releases

For every new release, just tag and push:

```bash
# Make your changes
git add .
git commit -m "feat: add new feature"
git push origin main

# When ready to release
git tag v0.2.0
git push origin v0.2.0
```

### Versioning Convention

Follow [Semantic Versioning](https://semver.org/):

| Tag | When |
|-----|------|
| `v0.1.0` → `v0.2.0` | New features (minor) |
| `v0.2.0` → `v0.2.1` | Bug fixes (patch) |
| `v0.x.x` → `v1.0.0` | First stable release (major) |

> **Tip:** Update `version` in `package.json` to match the tag before tagging:
> ```bash
> npm version 0.2.0 --no-git-tag-version
> git add package.json package-lock.json
> git commit -m "chore: bump version to 0.2.0"
> git tag v0.2.0
> git push origin main --tags
> ```

---

## Troubleshooting

### Workflow not running

| Symptom | Fix |
|---------|-----|
| No workflow appears in Actions tab | Ensure `.github/workflows/build.yml` is on the `main` branch |
| Workflow runs but skips release job | Release job only runs on tag push (`v*`). Push a tag. |
| Tag push doesn't trigger workflow | Ensure the tag starts with `v` (e.g. `v1.0.0`, not `1.0.0`) |

### Build failures

| Error | Fix |
|-------|-----|
| `npm ci` fails | Ensure `package-lock.json` is committed |
| `electron-builder` fails on macOS | macOS code signing requires certificates. For unsigned builds, this is expected to produce warnings but still outputs `.dmg` |
| `EACCES` or permission errors | Check **Settings → Actions → General → Workflow permissions** is set to Read and write |
| Release job fails with 403 | Ensure `permissions: contents: write` is in the workflow YAML |

### macOS Code Signing (Optional)

For signed macOS builds, add these repository secrets:

1. **Settings → Secrets and variables → Actions → New repository secret**
2. Add:
   - `CSC_LINK` — Base64-encoded `.p12` certificate
   - `CSC_KEY_PASSWORD` — Certificate password
   - `APPLE_ID` — Apple Developer account email
   - `APPLE_APP_SPECIFIC_PASSWORD` — App-specific password from appleid.apple.com
   - `APPLE_TEAM_ID` — Your Apple Developer Team ID

> Without these, macOS builds will be unsigned but still functional. Users will need to right-click → Open on first launch.

### Windows Code Signing (Optional)

For signed Windows builds, add:

1. `WIN_CSC_LINK` — Base64-encoded `.pfx` certificate
2. `WIN_CSC_KEY_PASSWORD` — Certificate password

> Without these, Windows builds will trigger SmartScreen warnings. Users click "More info → Run anyway".

---

## Summary

| Step | Action | One-time? |
|------|--------|-----------|
| 1 | Create GitHub repo | ✅ |
| 2 | Push code | ✅ |
| 3 | Verify Actions run | ✅ |
| 4a | Set workflow permissions | ✅ |
| 4b | Set branch protection | ✅ |
| 5 | Tag + push for release | Every release |
| 6 | Download from Releases page | Every release |
