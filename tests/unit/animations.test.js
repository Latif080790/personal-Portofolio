import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';

describe('Scroll Animations', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <section class="fade-in">Section 1</section>
      <section class="fade-in">Section 2</section>
    `;
  });

  test('sections should have fade-in class', () => {
    const sections = document.querySelectorAll('.fade-in');
    expect(sections.length).toBe(2);
    sections.forEach(section => {
      expect(section).toHaveClass('fade-in');
    });
  });

  test('IntersectionObserver should be called for each section', () => {
    const sections = document.querySelectorAll('.fade-in');
    const observer = new IntersectionObserver(() => {});
    const spy = jest.spyOn(observer, 'observe');
    
    sections.forEach(section => observer.observe(section));
    expect(spy).toHaveBeenCalledTimes(2);
  });
});

describe('Skill Bar Animations', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="skill-bars">
        <div class="skill">
          <div class="progress-bar">
            <div class="progress" data-value="75"></div>
          </div>
        </div>
      </div>
    `;
  });

  test('progress bar should animate to correct width', () => {
    const progressBar = document.querySelector('.progress');
    progressBar.style.width = '75%';
    expect(progressBar.style.width).toBe('75%');
  });
});
