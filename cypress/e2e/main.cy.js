describe('Personal Website', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should load the homepage', () => {
    cy.get('header h1').should('contain', 'Welcome to TERASID');
  });

  it('should toggle dark mode', () => {
    cy.get('#checkbox').click();
    cy.get('html').should('have.attr', 'data-theme', 'dark');
  });

  it('should navigate to sections', () => {
    cy.get('nav a[href="#about"]').click();
    cy.hash().should('eq', '#about');
    
    cy.get('nav a[href="#portfolio"]').click();
    cy.hash().should('eq', '#portfolio');
  });

  it('should filter portfolio items', () => {
    cy.get('.filter-btn[data-filter="web"]').click();
    cy.get('.portfolio-item[data-category="web"]').should('be.visible');
    cy.get('.portfolio-item[data-category="app"]').should('not.be.visible');
  });

  it('should submit contact form', () => {
    cy.get('#name').type('Test User');
    cy.get('#email').type('test@example.com');
    cy.get('#message').type('Hello, this is a test message');
    cy.get('#contact-form').submit();
    cy.on('window:alert', (text) => {
      expect(text).to.contains('Thank you for your message');
    });
  });
});
