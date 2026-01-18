# Migration Plan: vscode-wrap-console-log

Fork of [midnightsyntax/vscode-wrap-console-log](https://github.com/midnightsyntax/vscode-wrap-console-log) to publish on Open VSX with Python support.

---

## Phase 1: Repository Setup

### 1.1 Branch Rename (master → main)

```bash
git branch -m master main
git push -u origin main
git push origin --delete master
# Update default branch in GitHub repo settings
```

### 1.2 Create GitHub Repo

- Create `jayblack388/vscode-wrap-console-log` (or choose a new name)
- Set default branch to `main`
- Enable Actions → "Allow GitHub Actions to create and approve pull requests"
- Add secret: `OVSX_PAT`

---

## Phase 2: Infrastructure Files

### 2.1 Add `.github/` Structure

```
.github/
├── workflows/release.yml
├── release-please-config.json
└── release-please-manifest.json
```

### 2.2 Add LICENSE (MIT)

Copy from existing extensions or generate.

### 2.3 Update .gitignore

```
out/
node_modules/
*.vsix
.vscode-test/
.secrets
```

### 2.4 Update .vscodeignore

```
.vscode/**
.github/**
node_modules/**
.git/**
.gitignore
yarn.lock
package-lock.json
**/*.map
.secrets
src/**
tsconfig.json
```

---

## Phase 3: Modernize package.json

### 3.1 Update Metadata

| Field | Old | New |
|-------|-----|-----|
| `publisher` | `midnightsyntax` | `jayblack388` |
| `repository.url` | `github.com/midnightsyntax/...` | `github.com/jayblack388/...` |
| `license` | (missing) | `MIT` |
| `engines.vscode` | `^1.5.0` | `^1.74.0` |
| `engines.node` | (missing) | `>=18.0.0` |

### 3.2 Modernize Dependencies

**Remove:**
- `vscode` (deprecated package)

**Update:**
- `typescript`: `^3.1.4` → `^5.0.0`
- `@types/node`: `^8.10.25` → `^20.0.0`

**Add:**
- `@types/vscode`: `^1.74.0`
- `@vscode/vsce`: `^2.22.0`
- `ovsx`: `^0.8.0`
- `commitizen`: `^4.3.0`
- `cz-conventional-changelog`: `^3.3.0`

### 3.3 Update Scripts

**Remove:**
- `postinstall` (was for deprecated vscode package)

**Update:**
```json
{
  "scripts": {
    "compile": "tsc -p ./",
    "watch": "tsc -watch -p ./",
    "package": "yarn compile && vsce package --no-yarn",
    "commit": "cz"
  }
}
```

### 3.4 Add Commitizen Config

```json
{
  "config": {
    "commitizen": {
      "path": "./node_modules/cz-conventional-changelog"
    }
  }
}
```

---

## Phase 4: Code Modernization

### 4.1 Fix TypeScript Issues

The extension uses the old `vscode` npm package pattern. Need to:

1. Remove `import` via npm package
2. Use `@types/vscode` for types only
3. Access vscode API via the `vscode` namespace (already done, just remove the package dependency)

### 4.2 Remove Deprecated Patterns

- Remove `fs.readFileSync` for package.json (use `vscode.extensions.getExtension().packageJSON` instead)
- Fix initialization to not rely on deprecated patterns

---

## Phase 5: Python Support (Feature)

### 5.1 Design Decision

**Option A: Per-language settings**
```json
{
  "wrap-console-log.languageDefaults": {
    "python": { "logFunctionName": "print", "logString": "$func($var)" },
    "go": { "logFunctionName": "fmt.Println", "logString": "$func($var)" },
    "rust": { "logFunctionName": "println!", "logString": "$func(\"{:?}\", $var)" }
  }
}
```

**Option B: Auto-detect with override**
- Detect `document.languageId` at runtime
- Apply built-in defaults for known languages
- Allow user override via existing settings

**Recommendation:** Option B—less config burden, sensible defaults.

### 5.2 Implementation

1. Add language detection in `handle()` function:
   ```typescript
   const languageId = currentEditor.document.languageId;
   ```

2. Create language defaults map:
   ```typescript
   const LANGUAGE_DEFAULTS: Record<string, { func: string; template: string }> = {
     javascript: { func: 'console.log', template: '$func($var)' },
     typescript: { func: 'console.log', template: '$func($var)' },
     python: { func: 'print', template: '$func($var)' },
     go: { func: 'fmt.Println', template: '$func($var)' },
     rust: { func: 'println!', template: '$func("{:?}", $var)' },
     // ... more languages
   };
   ```

3. Modify `getSetting()` to check language-specific override first, then fall back to user settings, then language defaults, then global defaults.

### 5.3 New Settings (Optional)

```json
{
  "wrap-console-log.useLanguageDefaults": {
    "type": "boolean",
    "default": true,
    "description": "Automatically use language-appropriate log functions (print for Python, fmt.Println for Go, etc.)"
  }
}
```

---

## Phase 6: Testing & Release

### 6.1 Local Testing

```bash
yarn install
yarn package
cursor --install-extension *.vsix
```

### 6.2 Reset Version for Fork

Set version to `2.0.0` (major bump signals fork with breaking changes/new features).

Update `.github/release-please-manifest.json`:
```json
{ ".": "2.0.0" }
```

### 6.3 Initial Release

1. Push to `main`
2. Release-please creates PR
3. Merge PR → publishes to Open VSX

---

## Checklist

### Infrastructure
- [ ] Rename branch master → main (local + remote)
- [ ] Create GitHub repo under jayblack388
- [ ] Add `.github/workflows/release.yml`
- [ ] Add `.github/release-please-config.json`
- [ ] Add `.github/release-please-manifest.json`
- [ ] Add `LICENSE` file
- [ ] Update `.gitignore`
- [ ] Update `.vscodeignore`
- [ ] Add `OVSX_PAT` secret to repo

### package.json
- [ ] Update `publisher` to `jayblack388`
- [ ] Update `repository.url`
- [ ] Add `license: "MIT"`
- [ ] Update `engines.vscode` to `^1.74.0`
- [ ] Add `engines.node: ">=18.0.0"`
- [ ] Remove `vscode` devDependency
- [ ] Add `@types/vscode`
- [ ] Update `typescript` to v5
- [ ] Update `@types/node` to v20
- [ ] Add `@vscode/vsce`, `ovsx`, `commitizen`, `cz-conventional-changelog`
- [ ] Update scripts
- [ ] Add commitizen config
- [ ] Set version to `2.0.0`

### Code
- [ ] Remove `fs.readFileSync` for package.json access
- [ ] Add language detection
- [ ] Add language defaults map
- [ ] Test Python files use `print()`
- [ ] Test JS/TS files still use `console.log()`

### Documentation
- [ ] Update README with fork notice
- [ ] Update README with new Python/language features
- [ ] Reset CHANGELOG.md for fork

---

## Execution Order

1. **Phase 1** - Branch rename (do first to avoid conflicts)
2. **Phase 3** - package.json updates (so `yarn install` works)
3. **Phase 2** - Infrastructure files
4. **Phase 4** - Code modernization (fix deprecated patterns)
5. **Phase 5** - Python support feature
6. **Phase 6** - Test and release
