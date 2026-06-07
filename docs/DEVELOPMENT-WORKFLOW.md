# Development Workflow

## Quick Reference

**Solo developer workflow:**
```bash
git checkout -b fix/bug-name
# ... fix and test ...
git checkout main && git merge fix/bug-name --no-ff
git push origin main
```

**With contributors:**
```bash
# Create issue first, then branch, then PR
```

---

## Bug Fix Workflow

### Discovery Phase

When you find a bug:

1. **Can you fix it right now?**
   - ✅ Yes → Go to "Fast Fix Flow" below
   - ❌ No → Create GitHub Issue to track it

2. **Is it user-reported?**
   - ✅ Yes → Create GitHub Issue (even if fixing immediately)
   - ❌ No → Your choice (Issues help track patterns)

### Fast Fix Flow (Solo Developer)

Use this for bugs you're fixing immediately:

```bash
# 1. Create fix branch
git checkout -b fix/descriptive-name
# Examples: fix/deck-validation, fix/template-crash, fix/mobile-shuffle

# 2. Write a test that catches the bug (if possible)
# Add test to tests/unit/
npm test  # Should fail!

# 3. Fix the bug
# Edit code...

# 4. Verify fix
npm test              # Should pass now!
npm run build         # No build errors
npm run deploy        # Test in Obsidian (desktop + mobile if possible)

# 5. Commit with clear message
git commit -m "Fix: Deck validator crashes on empty cards array

- Add null check for cards array
- Add test for empty array case
- Fixes deck loading errors on malformed JSON"

# 6. Merge to main
git checkout main
git merge fix/descriptive-name --no-ff
git push origin main

# 7. Clean up
git branch -d fix/descriptive-name

# 8. Release (if needed)
# Update version in manifest.json and package.json
git add manifest.json package.json
git commit -m "Bump version to 1.8.7"
git tag 1.8.7
git push origin 1.8.7
```

### Issue Tracking Flow (For Later or User Bugs)

Use GitHub Issues when:
- Bug requires investigation
- Can't fix immediately
- User reported it
- Want to track patterns

```bash
# 1. Create Issue on GitHub
Title: "Deck validation crashes on empty cards array"
Description:
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - System info (if user-reported)

# 2. Create branch referencing issue number
git checkout -b fix/issue-42-deck-validation

# 3. Fix following "Fast Fix Flow" steps 2-5

# 4. Merge with issue reference
git checkout main
git merge fix/issue-42-deck-validation --no-ff
git commit --amend -m "Fix #42: Deck validation crashes on empty cards array

- Add null check for cards array
- Add test for empty array case"

git push origin main

# Issue #42 automatically closes when pushed
```

### Pull Request Flow (With Contributors)

When others contribute or you want formal review:

```bash
# 1. Contributor creates issue (or you assign them one)

# 2. Contributor creates branch
git checkout -b fix/issue-42-deck-validation

# 3. Contributor fixes and pushes
git push origin fix/issue-42-deck-validation

# 4. Contributor opens PR
# PR title: "Fix #42: Deck validation crashes on empty cards array"
# GitHub auto-links to issue

# 5. CI tests run automatically
# ✅ All tests must pass

# 6. You review PR
# - Check code quality
# - Verify tests exist
# - Test locally if needed

# 7. Merge via GitHub UI
# Select "Create a merge commit" (equivalent to --no-ff)
# Delete branch via GitHub

# 8. Pull main locally
git checkout main
git pull origin main
```

---

## Testing Requirements

**Before merging any bug fix:**

✅ All existing tests pass: `npm test`
✅ Build succeeds: `npm run build`
✅ Plugin works in Obsidian: `npm run deploy` + manual test
✅ Ideally: New test added that catches the bug

**CI/CD Protection:**
- Tests run automatically on push
- Tests run before release builds
- Can't tag a release with failing tests

---

## Commit Message Format

Use clear, descriptive commit messages:

```bash
# Bug fixes
git commit -m "Fix: Brief description

Longer explanation of what was broken and how you fixed it"

# Features
git commit -m "Add: Brief description

Explanation of what the feature does"

# Refactoring
git commit -m "Refactor: Brief description

Why you changed it"

# Documentation
git commit -m "Docs: Brief description"

# Tests
git commit -m "Test: Brief description"
```

**Good examples:**
```
Fix: Deck validator crashes on empty cards array
Add: ZIP deck import functionality
Refactor: Extract deck preparation logic to separate module
Docs: Add template variable examples
Test: Add coverage for card drawing edge cases
```

**Bad examples:**
```
fix bug          # Which bug?
update           # Update what?
oops             # What was the mistake?
WIP              # Don't commit WIP to main
```

---

## Branch Naming

**Conventions:**
- `fix/` - Bug fixes
- `feature/` - New features
- `refactor/` - Code refactoring
- `docs/` - Documentation only
- `test/` - Test additions

**Examples:**
```bash
fix/deck-validation
fix/issue-42-template-crash
feature/zip-import
feature/issue-15-querent-tags
refactor/deck-preparation
docs/template-variables
test/spread-formatter
```

**Keep names:**
- Short but descriptive
- Lowercase with hyphens
- Reference issue numbers when relevant

---

## Release Workflow

### Versioning

Follow [Semantic Versioning](https://semver.org/):
- **Major (1.0.0 → 2.0.0):** Breaking changes
- **Minor (1.8.0 → 1.9.0):** New features, backward compatible
- **Patch (1.8.6 → 1.8.7):** Bug fixes only

### Release Steps

```bash
# 1. Ensure main is clean
git checkout main
git status  # Should be clean

# 2. Update CHANGELOG.md
# Add new version section at top with changes

# 3. Update version numbers
# Edit manifest.json and package.json
# Both should have same version

# 4. Commit version bump
git add CHANGELOG.md manifest.json package.json
git commit -m "Bump version to 1.8.7"

# 5. Create and push tag
git tag 1.8.7
git push origin main
git push origin 1.8.7

# 6. CI automatically:
#    - Runs tests
#    - Builds plugin
#    - Creates GitHub release
#    - Uploads artifacts
```

### If Release Fails

If tests fail during release:

```bash
# 1. Delete tag locally and remotely
git tag -d 1.8.7
git push origin :refs/tags/1.8.7

# 2. Fix the issue on a branch
git checkout -b fix/release-tests

# 3. Fix and merge
# ... follow bug fix workflow ...

# 4. Try release again
git tag 1.8.7
git push origin 1.8.7
```

---

## GitHub Integration

### Automatic Issue Closing

Reference issues in commits to auto-close them:

```bash
git commit -m "Fix #42: Deck validation crashes on empty cards array"
# When pushed, Issue #42 automatically closes

# Keywords that work:
# fix #42, fixes #42, fixed #42
# close #42, closes #42, closed #42
# resolve #42, resolves #42, resolved #42
```

### Issue Labels (Optional)

Consider using labels for organization:
- `bug` - Something isn't working
- `enhancement` - New feature request
- `good first issue` - Easy for new contributors
- `help wanted` - Extra attention needed
- `question` - Further information requested
- `wontfix` - Will not be worked on

### Milestones (Optional)

Group issues by version:
- Milestone: v1.9.0
  - Issue #42: ZIP import
  - Issue #47: Querent tags
  - Issue #51: Custom deck paths

---

## Example Scenarios

### Scenario 1: Quick Bug Fix

```bash
# You notice template rendering breaks on missing variables

git checkout -b fix/template-missing-vars
# Add test that fails with missing variable
# Fix the code
npm test  # Passes
git commit -m "Fix: Template crashes on missing variables"
git checkout main
git merge fix/template-missing-vars --no-ff
git push origin main
git branch -d fix/template-missing-vars
```

### Scenario 2: User Reports Bug

```bash
# User creates Issue #55: "Mobile shuffle crashes on iOS 15"

# 1. Investigate
git checkout -b fix/issue-55-ios15-shuffle
# Try to reproduce on iOS 15

# 2. Can't reproduce?
# Add comment to issue asking for more info
# Keep branch around for when they respond

# 3. Fixed?
git commit -m "Fix #55: Mobile shuffle crashes on iOS 15

Crypto API not available in older iOS WebViews.
Added polyfill fallback for iOS <16."

git checkout main
git merge fix/issue-55-ios15-shuffle --no-ff
git push origin main
# Issue #55 auto-closes
```

### Scenario 3: Breaking Change

```bash
# You're removing deprecated settings in v2.0.0

git checkout -b feature/remove-deprecated-settings
# Make changes
# Update migration logic
# Write tests
git commit -m "Remove deprecated settings (BREAKING)

- Remove old template system
- All users must migrate to new template format
- Added automatic migration on first load"

git checkout main
git merge feature/remove-deprecated-settings --no-ff

# Update to v2.0.0 (major version bump)
# Edit manifest.json: "version": "2.0.0"
# Edit CHANGELOG.md with breaking changes notice
git add manifest.json CHANGELOG.md
git commit -m "Bump version to 2.0.0"
git tag 2.0.0
git push origin main
git push origin 2.0.0
```

---

## Best Practices

### ✅ Do:
- Create branches for all work
- Use `--no-ff` merges to preserve history
- Write descriptive commit messages
- Add tests for bugs when possible
- Test in Obsidian before merging
- Keep main stable and deployable
- Tag releases with detailed notes

### ❌ Don't:
- Commit directly to main
- Push broken code to main
- Merge without testing
- Use vague commit messages
- Delete branches until merged
- Skip version bumps on releases
- Force-push to main

---

## Tools & Commands

### Useful Git Commands

```bash
# Check current branch
git branch

# See what's changed
git status
git diff

# View commit history
git log --oneline --graph --all

# Undo last commit (keep changes)
git reset --soft HEAD~1

# Undo last commit (discard changes)
git reset --hard HEAD~1

# View remote branches
git branch -r

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# Stash uncommitted changes
git stash
git stash pop
```

### Useful npm Commands

```bash
# Run tests
npm test
npm run test:ui       # Interactive UI
npm run test:coverage # With coverage

# Build
npm run build         # Production build
npm run dev           # Watch mode

# Deploy to Obsidian
npm run deploy        # Copy to vault

# Check for issues
npm run lint          # Run ESLint
```

---

## Getting Help

**Resources:**
- [Git Branching Guide](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [GitHub Issues](https://guides.github.com/features/issues/)
- [GitHub Pull Requests](https://docs.github.com/en/pull-requests)

**Project Docs:**
- [Testing Setup](TESTING-SETUP.md)
- [CI/CD Integration](CI-CD-TESTING.md)
- [Development Notes](AGENTS.md)
