import { performance } from 'perf_hooks';

describe('Performance Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="portfolio-grid">
        ${Array(50).fill().map((_, i) => `
          <div class="portfolio-item" data-category="${i % 3 === 0 ? 'web' : i % 3 === 1 ? 'app' : 'design'}">
            Project ${i}
          </div>
        `).join('')}
      </div>
    `;
  });

  test('portfolio filtering should complete within 50ms', () => {
    const start = performance.now();
    const items = document.querySelectorAll('.portfolio-item');
    
    items.forEach(item => {
      if (item.getAttribute('data-category') === 'web') {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
    
    const end = performance.now();
    expect(end - start).toBeLessThan(50);
  });

  test('should handle large number of DOM updates efficiently', () => {
    const start = performance.now();
    
    // Simulate multiple rapid DOM updates
    for (let i = 0; i < 100; i++) {
      const div = document.createElement('div');
      div.className = 'test-item';
      document.body.appendChild(div);
    }
    
    const end = performance.now();
    expect(end - start).toBeLessThan(100);
  });
});
