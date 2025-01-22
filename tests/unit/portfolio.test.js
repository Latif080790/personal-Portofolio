import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';

describe('Portfolio Filtering', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="portfolio-filters">
        <button class="filter-btn" data-filter="all">All</button>
        <button class="filter-btn" data-filter="web">Web</button>
      </div>
      <div class="portfolio-grid">
        <div class="portfolio-item" data-category="web">Web Project</div>
        <div class="portfolio-item" data-category="app">App Project</div>
      </div>
    `;
  });

  test('should show all items when "all" filter is clicked', () => {
    const allButton = document.querySelector('[data-filter="all"]');
    fireEvent.click(allButton);
    
    const items = document.querySelectorAll('.portfolio-item');
    items.forEach(item => {
      expect(item.style.display).not.toBe('none');
    });
  });

  test('should filter items by category', () => {
    const webButton = document.querySelector('[data-filter="web"]');
    fireEvent.click(webButton);
    
    const webItems = document.querySelectorAll('[data-category="web"]');
    const appItems = document.querySelectorAll('[data-category="app"]');
    
    webItems.forEach(item => expect(item.style.display).not.toBe('none'));
    appItems.forEach(item => expect(item.style.display).toBe('none'));
  });

  test('should update active button state', () => {
    const buttons = document.querySelectorAll('.filter-btn');
    const webButton = document.querySelector('[data-filter="web"]');
    
    fireEvent.click(webButton);
    expect(webButton).toHaveClass('active');
    
    buttons.forEach(button => {
      if (button !== webButton) {
        expect(button).not.toHaveClass('active');
      }
    });
  });
});
