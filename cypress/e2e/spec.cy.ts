describe('LendSwift Loan Application', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3005');
  });

  it('loads the homepage', () => {
    cy.url().should('include', 'localhost:3005');
  });

  it('opens the login page', () => {
    cy.visit('http://localhost:3005/login');
    cy.url().should('include', '/login');
  });

  it('opens the register page', () => {
    cy.visit('http://localhost:3005/register');
    cy.url().should('include', '/register');
  });

  it('opens the loan application route', () => {
    cy.visit('http://localhost:3005/apply');
    cy.url().should('include', '/login');
  });

  it('opens the loan calculator', () => {
    cy.visit('http://localhost:3005/calculator');
    cy.url().should('include', '/calculator');
  });

  it('opens the loans page', () => {
    cy.visit('http://localhost:3005/loans');
    cy.url().should('include', '/loans');
  });

  it('opens the documents page', () => {
    cy.visit('http://localhost:3005/documents');
    cy.url().should('include', '/documents');
  });

  it('opens the profile page', () => {
    cy.visit('http://localhost:3005/profile');
    cy.url().should('include', '/profile');
  });

  it('opens the dashboard page', () => {
    cy.visit('http://localhost:3005/dashboard');
    cy.url().should('include', '/dashboard');
  });

  it('login page contains form fields', () => {
    cy.visit('http://localhost:3005/login');

    cy.get('input').should('have.length.at.least', 1);
  });

  it('register page contains form fields', () => {
    cy.visit('http://localhost:3005/register');

    cy.get('input').should('have.length.at.least', 1);
  });

  it('calculator page loads successfully', () => {
    cy.visit('http://localhost:3005/calculator');

    cy.get('body').should('be.visible');
  });

  it('loans page loads successfully', () => {
    cy.visit('http://localhost:3005/loans');

    cy.get('body').should('be.visible');
  });

  it('documents page loads successfully', () => {
    cy.visit('http://localhost:3005/documents');

    cy.get('body').should('be.visible');
  });

  it('home page has visible content', () => {
    cy.visit('http://localhost:3005');

    cy.get('body').should('be.visible');
  });

  it('application redirects unauthenticated users to login', () => {
    cy.visit('http://localhost:3005/apply');

    cy.url().should('include', '/login');
  });
});