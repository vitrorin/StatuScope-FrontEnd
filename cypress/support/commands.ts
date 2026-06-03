// ***********************************************
// cypress/support/commands.ts
// Custom Cypress commands for StatuScope E2E tests
// ***********************************************

// Silence uncaught React/Expo errors that are not test failures
Cypress.on('uncaught:exception', () => false);
