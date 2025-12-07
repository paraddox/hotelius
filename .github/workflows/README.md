# GitHub Actions CI/CD Workflows

This directory contains the CI/CD workflows for the Hotelius project.

## Workflows Overview

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Pull requests to `main` and `develop` branches
- Pushes to `main` branch

**Jobs:**

#### `lint-and-test`
- **Purpose**: Run linting, type checking, unit tests, and build
- **Node Version**: 20.x
- **Timeout**: 15 minutes
- **Steps**:
  1. Checkout code
  2. Setup Node.js with npm caching
  3. Cache `node_modules` for faster builds
  4. Install dependencies (only if cache miss)
  5. Run linting (`npm run lint`)
  6. Run type checking (`npx tsc --noEmit`)
  7. Run unit tests (`npm test -- --run`)
  8. Build application (`npm run build`)

#### `code-quality`
- **Purpose**: Run test coverage and upload to Codecov
- **Node Version**: 20.x
- **Timeout**: 10 minutes
- **Steps**:
  1. Checkout code with full history
  2. Setup Node.js with npm caching
  3. Cache `node_modules`
  4. Install dependencies (only if cache miss)
  5. Run test coverage (`npm run test:coverage`)
  6. Upload coverage to Codecov (requires `CODECOV_TOKEN` secret)

### 2. E2E Workflow (`e2e.yml`)

**Triggers:**
- Pushes to `main` branch
- Pull requests to `main` branch
- Manual workflow dispatch

**Jobs:**

#### `e2e-tests`
- **Purpose**: Run Playwright E2E tests
- **Node Version**: 20.x
- **Timeout**: 20 minutes
- **Sharding**: Tests run in parallel across 2 shards for faster execution
- **Steps**:
  1. Checkout code
  2. Setup Node.js with npm caching
  3. Cache `node_modules`
  4. Install dependencies (only if cache miss)
  5. Get installed Playwright version
  6. Cache Playwright browsers
  7. Install Playwright browsers and dependencies
  8. Build application
  9. Run Playwright tests with sharding
  10. Upload Playwright reports and test results as artifacts

#### `merge-reports`
- **Purpose**: Merge Playwright reports from all shards
- **Depends On**: `e2e-tests`
- **Runs**: Always (even if E2E tests fail)
- **Steps**:
  1. Checkout code
  2. Setup Node.js
  3. Install dependencies
  4. Download all Playwright reports from shards
  5. Merge reports into a single HTML report
  6. Upload merged report as artifact

## Configuration

### Required Secrets

Add these secrets in your GitHub repository settings (`Settings > Secrets and variables > Actions`):

1. **CODECOV_TOKEN** (Optional)
   - Required for code coverage reporting
   - Get from: https://codecov.io/

2. **Environment Variables for Build** (if needed)
   - Uncomment and add as secrets if your build requires them:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Any other environment variables needed for build/tests

### Caching Strategy

The workflows implement multiple caching layers for optimal performance:

1. **npm cache** (via `setup-node@v4`)
   - Caches npm's download cache
   - Key: Based on package-lock.json

2. **node_modules cache** (via `actions/cache@v4`)
   - Caches installed dependencies
   - Key: `${{ runner.os }}-node-${{ node-version }}-${{ hashFiles('**/package-lock.json') }}`
   - Fallback: Previous node_modules for same Node version

3. **Playwright browsers cache** (via `actions/cache@v4`)
   - Caches downloaded browser binaries
   - Key: `${{ runner.os }}-playwright-${{ playwright-version }}`

### Performance Optimizations

1. **Parallel Job Execution**: CI and code quality checks run in parallel
2. **Test Sharding**: E2E tests split across 2 shards (can be increased)
3. **Conditional Dependencies**: Only installs when cache misses
4. **Artifact Retention**: Reports kept for 30 days
5. **Timeout Protection**: Each job has a timeout to prevent hanging

## Usage

### Running Workflows

Workflows run automatically on:
- Every push to `main`
- Every pull request to `main` or `develop`

You can also manually trigger the E2E workflow:
1. Go to `Actions` tab in GitHub
2. Select `E2E Tests` workflow
3. Click `Run workflow`

### Viewing Results

1. **CI Results**: Check the PR status or commit status
2. **Test Reports**: Download artifacts from the workflow run
   - `playwright-report-merged`: Combined E2E test results
   - `test-results-*`: Individual test run results
3. **Coverage**: View on Codecov dashboard (if configured)

### Troubleshooting

#### Workflow Failures

1. **Linting fails**: Run `npm run lint` locally to see errors
2. **Type checking fails**: Run `npx tsc --noEmit` locally
3. **Tests fail**: Run `npm test` or `npm run test:e2e` locally
4. **Build fails**: Check environment variables and secrets

#### Cache Issues

If you suspect cache issues:
1. Clear caches manually in GitHub Actions settings
2. Update `package-lock.json` to invalidate caches
3. Check cache restore logs in workflow runs

#### E2E Test Issues

1. **Flaky tests**: Review test results artifacts
2. **Browser issues**: Check Playwright browser installation logs
3. **Timeout**: Increase timeout in workflow or optimize tests

## Customization

### Adjusting Test Sharding

To increase parallelization, modify the `shard` matrix in `e2e.yml`:

```yaml
strategy:
  matrix:
    shard: [1/4, 2/4, 3/4, 4/4]  # 4 shards instead of 2
```

### Adding More Node Versions

To test against multiple Node versions, modify the matrix:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x, 22.x]
```

### Environment Variables

Uncomment and configure environment variables in both workflows as needed:

```yaml
env:
  CI: true
  NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

## Best Practices

1. **Keep workflows fast**: Target < 10 minutes for CI, < 20 minutes for E2E
2. **Use caching**: All dependencies and browsers are cached
3. **Fail fast**: Workflows fail on first error to save resources
4. **Meaningful names**: Each step has a clear, descriptive name
5. **Artifact retention**: Balance storage costs with debugging needs
6. **Security**: Never commit secrets, use GitHub Secrets

## Maintenance

### Regular Updates

1. Update action versions quarterly:
   - `actions/checkout@v4`
   - `actions/setup-node@v4`
   - `actions/cache@v4`
   - `codecov/codecov-action@v4`

2. Update Node.js version when upgrading project dependencies

3. Review and optimize caching strategy as project grows

### Monitoring

Monitor workflow performance:
1. Check average run times in Actions tab
2. Review cache hit rates in logs
3. Track artifact storage usage
4. Monitor timeout occurrences

## Support

For issues or questions:
1. Check workflow logs for detailed error messages
2. Review this README for configuration help
3. Consult GitHub Actions documentation
4. Check project's issue tracker
