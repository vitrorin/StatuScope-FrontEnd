describe('Responsive Layout', () => {
  it('login page looks correct at 1440px wide', () => {
    cy.viewport(1440, 900);
    cy.visit('/login');
    cy.contains('StatuScope').should('be.visible');
    cy.screenshot('16-login-desktop-1440');
  });

  it('login page looks correct at 1280px wide', () => {
    cy.viewport(1280, 800);
    cy.visit('/login');
    cy.screenshot('17-login-desktop-1280');
  });

  it('login page collapses correctly at 768px (tablet)', () => {
    cy.viewport(768, 1024);
    cy.visit('/login');
    cy.contains('StatuScope').should('be.visible');
    cy.contains('Welcome Again!').should('be.visible');
    cy.screenshot('18-login-tablet-768');
  });

  it('register page looks correct at 1440px wide', () => {
    cy.viewport(1440, 900);
    cy.visit('/register');
    cy.contains('Create your account').should('be.visible');
    cy.screenshot('19-register-desktop-1440');
  });

  it('register page looks correct at 768px (tablet)', () => {
    cy.viewport(768, 1024);
    cy.visit('/register');
    cy.contains('Create your account').should('be.visible');
    cy.screenshot('20-register-tablet-768');
  });
});
