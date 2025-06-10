import { test, expect } from '@playwright/test';

test.describe('Tarot Reading Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete a reading session', async ({ page }) => {
    // Start reading
    await page.fill('[data-testid="question-input"]', 'What does my future hold?');
    await page.click('[data-testid="start-reading"]');

    // Wait for cards to load
    await expect(page.locator('[data-testid="card-grid"]')).toBeVisible();
    await expect(page.locator('[data-testid="card"]')).toHaveCount(3);

    // Select a card
    await page.click('[data-testid="card"]:first-child');
    
    // Wait for card details
    await expect(page.locator('[data-testid="card-text"]')).toBeVisible();
    
    // Check chat functionality
    await page.fill('[data-testid="chat-input"]', 'What does this card mean?');
    await page.click('[data-testid="send-message"]');
    
    // Wait for response
    await expect(page.locator('[data-testid="chat-message"]:last-child')).toBeVisible();
    
    // Verify navigation
    await page.click('[data-testid="next-card"]');
    await expect(page.locator('[data-testid="card"].active')).toHaveCount(1);
  });

  test('should handle errors gracefully', async ({ page }) => {
    // Force error state
    await page.route('**/api/reading/**', (route) => 
      route.fulfill({ status: 500 })
    );

    await page.fill('[data-testid="question-input"]', 'Test error handling');
    await page.click('[data-testid="start-reading"]');

    // Check error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // Verify retry functionality
    await page.click('[data-testid="retry-button"]');
    await expect(page.locator('[data-testid="card-grid"]')).toBeVisible();
  });

  test('should persist reading state', async ({ page }) => {
    // Complete initial reading steps
    await page.fill('[data-testid="question-input"]', 'Test persistence');
    await page.click('[data-testid="start-reading"]');
    await page.click('[data-testid="card"]:first-child');

    // Reload page
    await page.reload();

    // Verify state is preserved
    await expect(page.locator('[data-testid="question-display"]'))
      .toHaveText('Test persistence');
    await expect(page.locator('[data-testid="card"].active')).toBeVisible();
  });
}); 