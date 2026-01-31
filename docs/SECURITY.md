# Security Guidelines

## Overview

This document covers security best practices for the Tarot Practice plugin development.

## Key Principles

1. **Least Privilege** - Grant minimum permissions necessary
2. **Defense in Depth** - Multiple layers of security
3. **Fail Securely** - Errors should not expose sensitive data
4. **Keep Dependencies Updated** - Monitor for vulnerabilities

---

## GitHub Actions Security

### Workflow Permissions

All workflows use **explicit permissions** following the principle of least privilege.

**Default:** If no permissions specified, workflows inherit repository defaults (often read-write on everything).

**Our Standard:** Always specify minimum required permissions.

#### Example: Test Workflow

```yaml
permissions:
  contents: read      # Read repository code
  actions: write      # Upload artifacts
```

#### Example: Release Workflow

```yaml
permissions:
  contents: write     # Create releases and upload assets
```

**Why this matters:**
- Limits blast radius if workflow is compromised
- Documents actual needs of the workflow
- Prevents issues if defaults change
- Protects when workflow is copied to other repos

**Available Permission Scopes:**
- `contents` - Repository contents and commits
- `issues` - Issues and comments
- `pull-requests` - Pull requests and comments
- `packages` - Packages
- `actions` - Workflow artifacts
- `deployments` - Deployments
- `pages` - GitHub Pages

**Values:**
- `read` - Read-only access
- `write` - Read and write access
- `none` - No access

### Action Pinning

**Current:** We use major version tags for actions:
```yaml
uses: actions/checkout@v4
uses: actions/setup-node@v4
```

**Why:**
- ✅ Auto-updates with security patches
- ✅ Easy to maintain
- ✅ Recommended by GitHub for most projects

**Alternative (higher security):**
- Pin to exact SHA: `uses: actions/checkout@8e5e7e5ab8b370d6c329ec480221332ada57f0ab`
- More secure but requires manual updates
- Overkill for this project

---

## Dependency Security

### Dependabot Monitoring

**Enabled:** Security updates only

**What we monitor:**
- npm packages with known CVEs
- Transitive dependencies
- Development dependencies (lower priority)

**Response Process:**

1. **Critical/High Severity:**
   - Assess if vulnerability affects runtime code
   - Update immediately if exploitable
   - Test thoroughly before merging

2. **Moderate/Low Severity:**
   - Assess actual risk to project
   - Dismiss if not applicable (e.g., dev server vulnerabilities)
   - Update during normal maintenance if applicable

3. **Dev Dependencies:**
   - Lower priority unless affects build security
   - Can batch with other updates

### Example Assessment

**Alert:** esbuild dev server vulnerability
- **Severity:** Moderate
- **Scope:** Development only
- **Risk:** None (we don't use dev server)
- **Action:** Dismiss with reason "Not using affected feature"

**Alert:** Handlebars template injection
- **Severity:** High
- **Scope:** Runtime (user templates)
- **Risk:** HIGH (we process user input)
- **Action:** Update immediately, test, release patch

### Manual Dependency Audits

Run periodically:

```bash
# Check for vulnerabilities
npm audit

# Check for high/critical only
npm audit --audit-level=high

# Fix automatically (if safe)
npm audit fix

# See what would be fixed
npm audit fix --dry-run
```

---

## Code Security

### Input Validation

**User-provided data that needs validation:**
- Template strings (Handlebars)
- File paths
- Deck JSON files
- Settings values
- Intention text

**Patterns we use:**

```typescript
// File path validation
const sanitizedPath = normalizePath(userPath);
if (!sanitizedPath.startsWith(allowedDir)) {
  throw new Error('Invalid path');
}

// Deck validation
const validationResult = DeckValidator.validate(deckData);
if (!validationResult.isValid) {
  new Notice('Invalid deck: ' + validationResult.errors[0]);
  return;
}

// Settings validation
const settings = {
  ...DEFAULT_SETTINGS,
  ...userSettings  // User overrides
};
```

### Template Security

**Risk:** Handlebars can execute arbitrary JavaScript if configured incorrectly.

**Mitigation:**
```typescript
// ✅ SAFE - No helpers that execute code
Handlebars.registerHelper('escape', (text) => {
  return Handlebars.escapeExpression(text);
});

// ❌ UNSAFE - Don't do this
Handlebars.registerHelper('eval', (code) => {
  return eval(code);  // NEVER
});
```

**Current status:** ✅ We only use safe helpers

### File Operations

**Risk:** Path traversal attacks (accessing files outside intended directories)

**Mitigation:**
```typescript
// Always use Obsidian's vault abstraction
const file = this.app.vault.getAbstractFileByPath(path);
if (file instanceof TFile) {
  // Safe - Obsidian validates paths
  const content = await this.app.vault.read(file);
}

// Don't use direct filesystem access
// ❌ const content = fs.readFileSync(path);  // Unsafe
```

**Current status:** ✅ We use Obsidian API exclusively

---

## Secrets Management

### What Are Secrets?

- API keys
- Access tokens
- Private keys
- Passwords
- Database credentials

### Our Policies

**✅ DO:**
- Use GitHub Secrets for sensitive values
- Use environment variables in local development
- Add secrets to `.gitignore`
- Rotate compromised secrets immediately

**❌ DON'T:**
- Commit secrets to repository
- Log secrets in console/files
- Share secrets in issues or PRs
- Hardcode secrets in code

### GitHub Secret Scanning

**Status:** Enabled (automatic for public repos)

**What it catches:**
- AWS keys
- GitHub tokens
- npm tokens
- API keys from 100+ services

**If secret is detected:**
1. GitHub blocks the push (if push protection enabled)
2. Or GitHub emails you alert
3. Provider may be notified (e.g., AWS auto-revokes leaked keys)

**Response:**
1. Rotate the secret immediately
2. Remove from git history: `git filter-branch` or BFG Repo Cleaner
3. Review what was exposed
4. Update affected services

### Local Development

**For testing with external APIs:**

```bash
# .env file (add to .gitignore)
API_KEY=your-key-here

# Use in code
const apiKey = process.env.API_KEY;
```

**Never do this:**
```typescript
// ❌ WRONG
const apiKey = "sk-1234567890abcdef";  // Hardcoded!
```

---

## Code Scanning (CodeQL)

### What It Checks

GitHub's CodeQL scans for:
- SQL injection
- Cross-site scripting (XSS)
- Path traversal
- Command injection
- Insecure randomness
- Hardcoded credentials
- And more...

### Our Status

**Recommendation:** Enable CodeQL for TypeScript/JavaScript

**Setup:** Add to `.github/workflows/codeql.yml`

**Frequency:** Runs on:
- Every push to master
- Every pull request
- Weekly schedule

### Handling CodeQL Alerts

**When you get an alert:**

1. **Review the finding**
   - Is it a real vulnerability?
   - Is it a false positive?
   - What's the severity?

2. **Assess impact**
   - Can it be exploited?
   - What data is at risk?
   - Who could exploit it?

3. **Fix or dismiss**
   - Fix real vulnerabilities
   - Dismiss false positives with reason
   - Document decision

**Example dismissal reasons:**
- "False positive - this is test code"
- "Not exploitable - input is sanitized upstream"
- "Won't fix - requires user to intentionally harm themselves"

---

## Plugin-Specific Security

### Obsidian API Security

**Trust model:**
- Plugins run with full access to vault
- Users must trust plugins they install
- We have responsibility to be trustworthy

**Our commitments:**
1. No network requests (except loading decks from user-specified URLs)
2. No data collection or telemetry
3. No external dependencies at runtime
4. All file operations via Obsidian API
5. Open source and auditable

### User Data

**What we store:**
- Plugin settings (in Obsidian's config)
- Draw history (in vault files)
- Custom decks (in vault files)

**What we DON'T:**
- Send data to external servers
- Track user behavior
- Phone home
- Access files outside vault

### Deck Security

**Risk:** Malicious deck JSON files

**Validation:**
```typescript
// We validate all deck fields
DeckValidator.validate(deck);
// Checks: required fields, data types, array bounds

// We sanitize deck data
const card = deck.cards[index];
const safeName = Handlebars.escapeExpression(card.name);
```

**Users should only load decks from trusted sources:**
- Official obsidian-tarot-decks repo
- Decks they created themselves
- Decks from verified community members

---

## Security Checklist

### Before Every Release

- [ ] `npm audit` shows no critical/high vulnerabilities
- [ ] All tests pass (`npm test`)
- [ ] No hardcoded secrets in code
- [ ] No new network requests added
- [ ] File operations use Obsidian API only
- [ ] User input is validated/sanitized
- [ ] CHANGELOG documents security fixes (if any)

### Monthly Maintenance

- [ ] Review Dependabot alerts
- [ ] Update dependencies: `npm update`
- [ ] Run `npm audit` and address findings
- [ ] Review CodeQL alerts (if enabled)
- [ ] Check for Obsidian API security updates

### If Vulnerability Discovered

1. **Assess severity** (use CVSS calculator)
2. **Develop fix** on private branch
3. **Test thoroughly**
4. **Release patch** ASAP
5. **Notify users** in release notes
6. **Document** in CHANGELOG
7. **If critical:** Email Obsidian team

### If Credentials Leaked

1. **Revoke immediately**
2. **Remove from git history**
3. **Rotate all related credentials**
4. **Audit what was accessed**
5. **Notify affected parties**
6. **Post-mortem:** How did it happen? How to prevent?

---

## Reporting Security Issues

### For Users Who Find Issues

**Please report security issues privately:**
- Email: [Your Email Here]
- Do NOT create public GitHub issues for security problems

**Include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

**We commit to:**
- Respond within 48 hours
- Provide fix timeline
- Credit reporter (if desired)
- Notify when fixed

### For Contributors

**If you find a security issue while developing:**
1. Don't commit the vulnerable code
2. Report to maintainer privately
3. Wait for assessment before proceeding
4. Help develop fix if possible

---

## Resources

**GitHub Security:**
- [Securing your workflows](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Permission scopes](https://docs.github.com/en/actions/using-jobs/assigning-permissions-to-jobs)
- [Secret scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)

**OWASP:**
- [Top 10 Web Application Risks](https://owasp.org/www-project-top-ten/)
- [Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)

**npm Security:**
- [npm audit docs](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- [npm security best practices](https://docs.npmjs.com/downloading-and-installing-packages-safely)

**Obsidian:**
- [Plugin security review](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines#Security+review)
- [Obsidian API](https://github.com/obsidianmd/obsidian-api)
