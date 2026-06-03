describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('renders the login page and takes a screenshot', () => {
    cy.contains('StatuScope').should('be.visible');
    cy.screenshot('01-login-page');
  });

  it('shows brand elements correctly', () => {
    cy.contains('THE MEDICAL RADAR').should('be.visible');
    cy.contains('Welcome Again!').should('be.visible');
    cy.contains('Please enter your credentials').should('be.visible');
    cy.screenshot('02-login-brand');
  });

  it('shows empty-field validation error', () => {
    cy.contains('Login to the system').click();
    cy.contains('Please enter your email and password').should('be.visible');
    cy.screenshot('03-login-validation-error');
  });

  it('shows invalid credentials error', () => {
    cy.get('input[placeholder="name@hospital.com"]').type('bad@test.com');
    cy.get('input[placeholder="********"]').type('wrongpassword');
    cy.contains('Login to the system').click();
    cy.contains('Invalid email or password', { timeout: 10000 }).should('be.visible');
    cy.screenshot('04-login-invalid-credentials');
  });

  it('navigates to register page via sign up link', () => {
    cy.contains('Sign up').click();
    cy.url().should('include', '/register');
    cy.screenshot('05-login-to-register-navigation');
  });
});
