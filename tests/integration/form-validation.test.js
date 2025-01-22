import { fireEvent, waitFor } from '@testing-library/dom';
import '@testing-library/jest-dom';

describe('Form Validation Integration', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <form id="contact-form">
        <input type="text" id="name" required minlength="2" />
        <input type="email" id="email" required />
        <textarea id="message" required minlength="10"></textarea>
        <button type="submit">Send</button>
      </form>
    `;
  });

  test('should validate all fields before submission', async () => {
    const form = document.querySelector('#contact-form');
    const nameInput = document.querySelector('#name');
    const emailInput = document.querySelector('#email');
    const messageInput = document.querySelector('#message');

    // Test empty form submission
    fireEvent.submit(form);
    expect(form.checkValidity()).toBeFalsy();

    // Test invalid email
    fireEvent.change(nameInput, { target: { value: 'John' } });
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.change(messageInput, { target: { value: 'Hello!' } });
    fireEvent.submit(form);
    expect(form.checkValidity()).toBeFalsy();

    // Test short message
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(messageInput, { target: { value: 'Hi' } });
    fireEvent.submit(form);
    expect(form.checkValidity()).toBeFalsy();

    // Test valid submission
    fireEvent.change(messageInput, { target: { value: 'This is a proper message' } });
    fireEvent.submit(form);
    expect(form.checkValidity()).toBeTruthy();
  });

  test('should handle special characters in input', () => {
    const messageInput = document.querySelector('#message');
    const specialChars = '<script>alert("xss")</script>';
    
    fireEvent.change(messageInput, { target: { value: specialChars } });
    expect(messageInput.value).not.toContain('<script>');
  });
});
