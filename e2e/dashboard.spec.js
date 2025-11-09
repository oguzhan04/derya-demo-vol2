import { test, expect } from '@playwright/test'

test.describe('AI Control Room Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the dashboard
    await page.goto('http://localhost:5173')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test('should display Active Shipments table', async ({ page }) => {
    // Wait for the "Active Shipments" heading to be visible
    await expect(page.getByText('Active Shipments')).toBeVisible()
    
    // Check that the table exists
    const table = page.locator('table')
    await expect(table).toBeVisible()
  })

  test('should open shipment detail drawer on row click', async ({ page }) => {
    // Wait for shipments table to load
    await expect(page.getByText('Active Shipments')).toBeVisible()
    
    // Wait for at least one table row to be present
    const firstRow = page.locator('table tbody tr').first()
    await expect(firstRow).toBeVisible({ timeout: 10000 })
    
    // Click the first row
    await firstRow.click()
    
    // Check that the drawer appears
    // Look for "Container" text in the drawer header
    await expect(page.getByText(/Container/i)).toBeVisible({ timeout: 3000 })
    
    // Check that phase timeline exists
    await expect(page.getByText(/Phase Timeline/i)).toBeVisible()
    
    // Check that compliance section is visible (if present)
    const complianceSection = page.getByText(/Compliance/i)
    if (await complianceSection.count() > 0) {
      await expect(complianceSection.first()).toBeVisible()
    }
  })

  test('should display Ops AI card with pipeline', async ({ page }) => {
    // Check for Ops AI heading
    await expect(page.getByText('Ops AI')).toBeVisible()
    
    // Check for Shipment Pipeline section
    await expect(page.getByText(/Shipment Pipeline/i)).toBeVisible()
    
    // Check that phase labels are visible (at least one)
    const phaseLabels = ['Intake', 'Compliance', 'Monitoring', 'Arrival', 'Billing']
    const foundPhases = await Promise.all(
      phaseLabels.map(label => page.getByText(label).count())
    )
    const hasPhases = foundPhases.some(count => count > 0)
    expect(hasPhases).toBe(true)
  })

  test('should close drawer when clicking outside', async ({ page }) => {
    // Wait for shipments table
    await expect(page.getByText('Active Shipments')).toBeVisible()
    
    // Click first row to open drawer
    const firstRow = page.locator('table tbody tr').first()
    await firstRow.click()
    
    // Wait for drawer to open
    await expect(page.getByText(/Container/i)).toBeVisible({ timeout: 3000 })
    
    // Click outside the drawer (on the overlay)
    // The drawer is fixed, so we click at a position outside the drawer area
    await page.mouse.click(100, 100)
    
    // Drawer should close (Container text should not be visible)
    await expect(page.getByText(/Container/i)).not.toBeVisible({ timeout: 2000 })
  })
})

