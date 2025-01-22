describe('Accessibility Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
  });

  it('should have no detectable accessibility violations', () => {
    cy.checkA11y();
  });

  it('should have proper heading structure', () => {
    cy.get('h1').should('have.length', 1);
    cy.get('h2').each(($heading) => {
      cy.wrap($heading).should('be.visible');
    });
  });

  it('should have proper focus management', () => {
    cy.get('nav a').first().focus();
    cy.focused().should('have.attr', 'href', '#about');
    cy.tab();
    cy.focused().should('have.attr', 'href', '#skills');
  });

  it('should maintain contrast ratio in dark mode', () => {
    cy.get('#checkbox').click();
    cy.checkA11y();
  });
});
