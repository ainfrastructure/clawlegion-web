# Visual Regression Testing

This project uses Playwright's built-in snapshot comparison for visual regression testing.

## Quick Start

```bash
# Run visual regression tests
npm run test:visual

# Update baseline snapshots (after intentional UI changes)
npm run test:visual:update

# Run with browser visible (debugging)
npm run test:visual:headed
```

## How It Works

1. **Baseline Creation**: On first run (or with `--update-snapshots`), Playwright captures screenshots as baselines
2. **Comparison**: Subsequent runs compare current screenshots against baselines
3. **Diff Detection**: Any visual differences beyond the threshold trigger test failures

## Test Coverage

### Full Page Snapshots
- Home page (desktop, mobile, tablet)
- Dashboard (desktop, mobile, tablet)
- Tasks page (desktop, mobile, tablet)
- Agents fleet (desktop, mobile)
- Sessions page (desktop)
- Analytics page (desktop)
- Chat page (desktop)

### Component Snapshots
- Sidebar navigation
- Header component
- Tasks list component

### State Snapshots
- Button hover states
- Input focus states
- Dark theme verification

## Configuration

Visual regression settings in `playwright.config.ts`:

```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,     // Allow minor differences
    threshold: 0.2,          // Color comparison threshold
    animations: 'disabled',  // Consistent screenshots
  },
}
```

## Snapshot Storage

Snapshots are stored in: `e2e/snapshots/`

```
e2e/snapshots/
├── visual-regression.spec.ts/
│   ├── desktop-home.png
│   ├── desktop-dashboard.png
│   ├── mobile-tasks.png
│   └── ...
```

## Updating Baselines

When making intentional UI changes:

1. Make your UI changes
2. Run `npm run test:visual:update`
3. Review the new snapshots in `e2e/snapshots/`
4. Commit the updated snapshots with your PR

## CI Integration

In CI (when `CI=true`):
- Tests fail if visual regressions are detected
- Diff images are saved to `e2e/test-results/`
- Review diffs in the HTML report: `npm run test:e2e:report`

## Troubleshooting

### Flaky Tests
If tests are flaky due to timing:
- Increase `maxDiffPixels` for pages with dynamic content
- Add `await page.waitForLoadState('networkidle')` before screenshots
- Use `animations: 'disabled'` in screenshot options

### Large Diffs on First Run
If you're seeing large diffs on first run, update the baselines:
```bash
npm run test:visual:update
```

### Cross-Platform Differences
Fonts render differently across OS. For consistent results:
- Use CI environment for baseline creation
- Or accept platform-specific baselines with `snapshotPathTemplate`
