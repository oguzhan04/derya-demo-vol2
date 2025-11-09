# Testing Guide

This document explains how to run the automated tests and demo scripts for the Derya AI Control Room.

## Quick Start

```bash
# Run backend unit tests
npm test

# Run demo lifecycle script (requires server running)
npm run demo:lifecycle

# Run e2e tests (requires dev server running)
npm run test:e2e
```

## Backend Tests (Jest)

The backend tests verify the phase lifecycle state machine logic.

**Location:** `tests/phaseLifecycle.test.js`

**What it tests:**
- Phase initialization
- Compliance check logic (pass/fail scenarios)
- Phase transitions
- Invalid data handling

**Run:**
```bash
npm test
```

**Example output:**
```
PASS  tests/phaseLifecycle.test.js
  Phase Lifecycle State Machine
    Phase 1 - Intake
      ✓ should initialize phase data with correct defaults
      ✓ should mark intake as done and move to compliance
    Phase 2 - Compliance
      ✓ should pass compliance check with all required fields
      ✓ should fail compliance check with missing required fields
      ✓ should flag invalid HS codes
      ✓ should flag high-risk ports
    Phase Transitions
      ✓ should transition from compliance to monitoring when compliant
      ✓ should stay in compliance when issues are found
```

## Demo Lifecycle Script

The demo script simulates a full shipment lifecycle by calling backend endpoints in sequence.

**Location:** `scripts/runDemoLifecycle.js`

**What it does:**
1. Finds a test shipment (prefers one in compliance/monitoring/arrival phase)
2. Advances it through phases using debug endpoints
3. Logs the state at each step
4. Shows final summary

**Prerequisites:**
- Backend server must be running on `http://localhost:3001`
- At least one shipment must exist (upload an arrival notice first)

**Run:**
```bash
# In one terminal, start the server:
npm run dev:server

# In another terminal, run the demo:
npm run demo:lifecycle
```

**Example output:**
```
============================================================
🚀 Derya AI - Shipment Lifecycle Demo
============================================================

Step 1: Finding Test Shipment
📦 Container: MAEU1234567
   Current Phase: compliance
   Phase Progress:
     ✓ intake: done
     ⏳ compliance: in_progress
     ○ monitoring: pending
     ○ arrival: pending
     ○ billing: pending
   Compliance Status: issues

Step 2: Advancing Through Phases
📍 Current phase: Compliance
   → Advancing to Monitoring...
✅ Mark Compliance Done completed

Final State
📦 Container: MAEU1234567
   Current Phase: monitoring
   Completed Phases: 2/5
   Compliance: ok
```

## E2E Tests (Playwright)

The e2e tests verify the UI interactions work correctly.

**Location:** `e2e/dashboard.spec.js`

**What it tests:**
- Active Shipments table renders
- Shipment detail drawer opens on row click
- Ops AI card displays correctly
- Drawer closes when clicking outside

**Prerequisites:**
- Dev server must be running (Playwright will start it automatically if configured)
- Backend server must be running on `http://localhost:3001`

**Run:**
```bash
npm run test:e2e
```

**Note:** The first run will download Playwright browsers (~300MB).

**Manual setup (if auto-start doesn't work):**
```bash
# Terminal 1: Start backend
npm run dev:server

# Terminal 2: Start frontend
npm run dev

# Terminal 3: Run e2e tests
npm run test:e2e
```

## Test Structure

```
.
├── tests/
│   └── phaseLifecycle.test.js    # Backend unit tests
├── e2e/
│   └── dashboard.spec.js         # E2E UI tests
├── scripts/
│   └── runDemoLifecycle.js       # Demo lifecycle script
├── jest.config.js                 # Jest configuration
└── playwright.config.js          # Playwright configuration
```

## Troubleshooting

### Backend tests fail
- Make sure you're using Node.js 18+ (ES modules support)
- Check that Jest is installed: `npm install`

### Demo script can't connect
- Verify server is running: `curl http://localhost:3001/api/shipments`
- Check that you have at least one shipment in the system

### E2E tests fail
- Ensure both frontend and backend servers are running
- Check browser console for errors
- Try running with `--headed` flag to see what's happening:
  ```bash
  npx playwright test --headed
  ```

## Writing New Tests

### Backend Test Example
```javascript
import { describe, it, expect } from '@jest/globals'

describe('My Feature', () => {
  it('should do something', () => {
    expect(true).toBe(true)
  })
})
```

### E2E Test Example
```javascript
import { test, expect } from '@playwright/test'

test('should do something', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Hello')).toBeVisible()
})
```

## CI/CD Integration

For CI/CD pipelines, you can run:

```bash
# Run all tests
npm test && npm run test:e2e

# Or separately
npm test              # Backend tests
npm run test:e2e      # E2E tests (requires servers)
```

Note: E2E tests require both servers to be running, so in CI you'll need to:
1. Start backend server
2. Start frontend server
3. Run Playwright tests

