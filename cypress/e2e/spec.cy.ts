describe("Coredora Loan Application", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("loads the homepage", () => {
    cy.url().should("eq", "http://localhost:3005/");
    cy.get("body").should("be.visible");
  });

  it("opens the login page", () => {
    cy.visit("/login");

    cy.url().should("include", "/login");
    cy.get("body").should("be.visible");
  });

  it("opens the register page", () => {
    cy.visit("/register");

    cy.url().should("include", "/register");
    cy.get("body").should("be.visible");
  });

  it("opens the loans page", () => {
    cy.visit("/loans");

    cy.url().should("include", "/loans");
    cy.get("body").should("be.visible");
  });

  it("login page contains form fields", () => {
    cy.visit("/login");

    cy.get("input").should("have.length.at.least", 1);
    cy.get("button").should("have.length.at.least", 1);
  });

  it("register page contains form fields", () => {
    cy.visit("/register");

    cy.get("input").should("have.length.at.least", 1);
    cy.get("button").should("have.length.at.least", 1);
  });

  it("loans page loads successfully", () => {
    cy.visit("/loans");

    cy.get("body").should("be.visible");
    cy.url().should("include", "/loans");
  });

  it("home page has visible content", () => {
    cy.visit("/");

    cy.get("body").should("be.visible");
    cy.get("body").invoke("text").should("not.be.empty");
  });

  it("redirects unauthenticated users from loan application to login", () => {
    cy.visit("/apply");

    cy.url({ timeout: 10000 }).should("include", "/login");
  });

  it("redirects unauthenticated users from calculator to login", () => {
    cy.visit("/calculator");

    cy.url({ timeout: 10000 }).should("include", "/login");
  });

  it("redirects unauthenticated users from documents to login", () => {
    cy.visit("/documents");

    cy.url({ timeout: 10000 }).should("include", "/login");
  });

  it("redirects unauthenticated users from profile to login", () => {
    cy.visit("/profile");

    cy.url({ timeout: 10000 }).should("include", "/login");
  });

  it("redirects unauthenticated users from dashboard to login", () => {
    cy.visit("/dashboard");

    cy.url({ timeout: 10000 }).should("include", "/login");
  });

  it("calculator route redirects unauthenticated users correctly", () => {
    cy.visit("/calculator");

    cy.url({ timeout: 10000 }).should("include", "/login");
    cy.get("body").should("be.visible");
  });

  it("documents route redirects unauthenticated users correctly", () => {
    cy.visit("/documents");

    cy.url({ timeout: 10000 }).should("include", "/login");
    cy.get("body").should("be.visible");
  });

  it("application redirects unauthenticated users to login", () => {
    cy.visit("/apply");

    cy.url({ timeout: 10000 }).should("include", "/login");
    cy.get("body").should("be.visible");
  });
});