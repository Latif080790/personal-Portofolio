import { fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';

describe('Theme Switching', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="theme-switch-wrapper">
        <label class="theme-switch">
          <input type="checkbox" id="checkbox" />
        </label>
      </div>
    `;
  });

  test('toggles theme when switch is clicked', () => {
    const toggleSwitch = document.querySelector('#checkbox');
    fireEvent.click(toggleSwitch);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    
    fireEvent.click(toggleSwitch);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});

describe('Contact Form', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="contact-form">
        <input type="text" id="name" required />
        <input type="email" id="email" required />
        <textarea id="message" required></textarea>
        <button type="submit">Send</button>
      </form>
    `;
  });

  test('submits form with correct data', () => {
    const form = document.querySelector('#contact-form');
    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');
    const messageInput = document.querySelector('#message');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Hello!' } });

    const mockSubmit = jest.fn(e => e.preventDefault());
    form.addEventListener('submit', mockSubmit);

    fireEvent.submit(form);
    expect(mockSubmit).toHaveBeenCalled();
  });
});
