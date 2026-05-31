describe('Register Page', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('renders the register page and takes a screenshot', () => {
    cy.contains('StatuScope').should('be.visible');
    cy.screenshot('06-register-page');
  });

  it('shows all form fields', () => {
    cy.contains('Create your account').should('be.visible');
    cy.contains('Use the invite code your hospital provided').should('be.visible');
    cy.get('input[placeholder="Dr. Sarah Chen"]').should('be.visible');
    cy.get('input[placeholder="name@hospital.com"]').should('be.visible');
    cy.get('input[placeholder="INVITE-XXXXX"]').should('be.visible');
    cy.screenshot('07-register-form-fields');
  });

  it('shows empty-field validation error', () => {
    cy.contains('Create account').click();
    cy.contains('Please fill in all required fields').should('be.visible');
    cy.screenshot('08-register-validation-error');
  });

  it('shows password length validation error', () => {
    cy.get('input[placeholder="Dr. Sarah Chen"]').type('Dr. Test');
    cy.get('input[placeholder="name@hospital.com"]').type('test@hospital.com');
    cy.get('input[placeholder="At least 8 characters"]').type('short');
    cy.get('input[placeholder="Repeat your password"]').type('short');
    cy.get('input[placeholder="INVITE-XXXXX"]').type('INVITE-TEST1');
    cy.contains('Create account').click();
    cy.contains('Password must be at least 8 characters').should('be.visible');
    cy.screenshot('09-register-password-length-error');
  });

  it('shows password mismatch error', () => {
    cy.get('input[placeholder="Dr. Sarah Chen"]').type('Dr. Test');
    cy.get('input[placeholder="name@hospital.com"]').type('test@hospital.com');
    cy.get('input[placeholder="At least 8 characters"]').type('securepass1');
    cy.get('input[placeholder="Repeat your password"]').type('differentpass1');
    cy.get('input[placeholder="INVITE-XXXXX"]').type('INVITE-TEST1');
    cy.contains('Create account').click();
    cy.contains('Passwords do not match').should('be.visible');
    cy.screenshot('10-register-password-mismatch');
  });

  it('navigates back to login via sign in link', () => {
    cy.contains('Sign in').click();
    cy.url().should('include', '/login');
    cy.screenshot('11-register-to-login-navigation');
  });
});
