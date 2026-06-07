# CI/CD Testing Integration

## What Happens Now

### 🏷️ When You Tag a Release
```bash
git tag 1.8.6
git push origin 1.8.6
```

**GitHub Actions automatically:**
1. ✅ Runs all 28 tests
2. ✅ Builds the plugin (if tests pass)
3. ✅ Creates GitHub release with artifacts
4. ❌ Stops release if tests fail

**This prevents shipping broken code!**

### 📝 When You Push to Master
```bash
git push origin main
```

**GitHub Actions automatically:**
1. ✅ Runs all tests
2. ✅ Generates coverage report
3. ✅ Uploads coverage as artifact
4. ✅ Shows green ✓ or red ✗ badge

**You get immediate feedback on every push!**

### 🔀 When Someone Opens a Pull Request

**GitHub Actions automatically:**
1. ✅ Runs all tests on the PR branch
2. ✅ Shows test results in PR
3. ✅ Blocks merge if tests fail (optional)

**Protects main branch from breaking changes!**

## Viewing Test Results

### In GitHub UI
1. Go to **Actions** tab in your repo
2. See all workflow runs
3. Click any run to see detailed logs
4. Download coverage reports from artifacts

### Status Badge (Optional)
Add this to your README.md:
```markdown
![Tests](https://github.com/w8s/obsidian-tarot-practice/actions/workflows/test.yml/badge.svg)
```

Shows: ![Tests](badge-passing.svg) or ![Tests](badge-failing.svg)

## What Gets Tested

Every run tests:
- ✅ Deck validation (7 tests)
- ✅ Template rendering (10 tests)
- ✅ Card drawing/RNG (11 tests)

**Total: 28 tests in ~5 seconds**

## Workflow Files

### `.github/workflows/release.yml`
- Triggers: On git tag push
- Runs: Tests → Build → Release
- **Tests must pass or release is cancelled**

### `.github/workflows/test.yml`
- Triggers: On push to main or PRs
- Runs: Tests + Coverage
- Saves: Coverage report as artifact

## Benefits

### 🛡️ **Safety Net**
Can't accidentally ship broken code. Tests run before release.

### ⚡ **Fast Feedback**
Know within minutes if your changes broke something.

### 📊 **Coverage Tracking**
Coverage reports show what's tested over time.

### 🤝 **Collaboration**
PR tests ensure contributors don't break things.

## Example: What Happens on Tag

```bash
# You create a tag
git tag 1.8.6
git push origin 1.8.6

# GitHub Actions runs:
✓ Checkout code
✓ Install Node.js 20
✓ npm ci (install deps)
✓ npm test (run 28 tests) ← NEW!
✓ npm run build (compile plugin)
✓ Create release with files

# If tests fail:
✗ npm test (3 tests failed)
❌ Build cancelled
❌ Release cancelled
```

## Testing Locally Before Push

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Only push if green! ✅
git push
```

## Disabling Tests (Not Recommended)

If you ever need to bypass tests:

```yaml
# In release.yml, comment out:
# - name: Run tests
#   run: npm test
```

**But don't do this!** Tests are your safety net.

## Future Enhancements (Optional)

### Add Coverage Threshold
```yaml
- name: Run tests with coverage
  run: npm run test:coverage -- --coverage.thresholds.lines=70
```
Fails if coverage drops below 70%.

### Add Test Status to README
```markdown
![Tests](https://github.com/w8s/obsidian-tarot-practice/actions/workflows/test.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-70%25-brightgreen)
```

### Run Tests on Multiple Platforms
```yaml
strategy:
  matrix:
    os: [ubuntu-latest, windows-latest, macos-latest]
    node: [18, 20]
```

But honestly, current setup is perfect for now! ✅

---

**Bottom line:** Tests now run automatically on every tag. You can't ship broken code even if you try! 🎉
