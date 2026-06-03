describe('Page Routing', () => {
  it('redirects unauthenticated users from / to /login', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
    cy.screenshot('12-root-redirect-to-login');
  });

  it('redirects unauthenticated users from /dashboard/doctor to /login', () => {
    cy.visit('/dashboard/doctor', { failOnStatusCode: false });
    cy.url().should('include', '/login');
    cy.screenshot('13-protected-route-redirect');
  });

  it('redirects unauthenticated users from /diagnosis to /login', () => {
    cy.visit('/diagnosis');
    cy.url().should('include', '/login');
    cy.screenshot('14-diagnosis-route-redirect');
  });

  it('redirects unauthenticated users from /analytics to /login', () => {
    cy.visit('/analytics');
    cy.url().should('include', '/login');
    cy.screenshot('15-analytics-route-redirect');
  });
});
