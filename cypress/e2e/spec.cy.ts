describe("LendSwift Loan Application", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3005");
  });

  it("loads the homepage", () => {
    cy.url().should("include", "localhost:3005");
    cy.get("body").should("be.visible");
  });

  it("opens the login page", () => {
    cy.visit("http://localhost:3005/login");

    cy.url().should("include", "/login");
    cy.get("body").should("be.visible");
  });

  it("opens the register page", () => {
    cy.visit("http://localhost:3005/register");

    cy.url().should("include", "/register");
    cy.get("body").should("be.visible");
  });

  it("redirects unauthenticated users from loan application to login", () => {
    cy.visit("http://localhost:3005/apply");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fapply");
  });

  it("redirects unauthenticated users from calculator to login", () => {
    cy.visit("http://localhost:3005/calculator");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fcalculator");
  });

  it("opens the loans page", () => {
    cy.visit("http://localhost:3005/loans");

    cy.url().should("include", "/loans");
    cy.get("body").should("be.visible");
  });

  it("redirects unauthenticated users from documents to login", () => {
    cy.visit("http://localhost:3005/documents");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fdocuments");
  });

  it("redirects unauthenticated users from profile to login", () => {
    cy.visit("http://localhost:3005/profile");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fprofile");
  });

  it("redirects unauthenticated users from dashboard to login", () => {
    cy.visit("http://localhost:3005/dashboard");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fdashboard");
  });

  it("login page contains form fields", () => {
    cy.visit("http://localhost:3005/login");

    cy.get("input").should("have.length.at.least", 1);
    cy.get("button").should("have.length.at.least", 1);
  });

  it("register page contains form fields", () => {
    cy.visit("http://localhost:3005/register");

    cy.get("input").should("have.length.at.least", 1);
    cy.get("button").should("have.length.at.least", 1);
  });

  it("calculator route redirects unauthenticated users correctly", () => {
    cy.visit("http://localhost:3005/calculator");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fcalculator");
    cy.get("body").should("be.visible");
  });

  it("loans page loads successfully", () => {
    cy.visit("http://localhost:3005/loans");

    cy.get("body").should("be.visible");
    cy.url().should("include", "/loans");
  });

  it("documents route redirects unauthenticated users correctly", () => {
    cy.visit("http://localhost:3005/documents");

    cy.url().should("include", "/login");
    cy.get("body").should("be.visible");
  });

  it("home page has visible content", () => {
    cy.visit("http://localhost:3005");

    cy.get("body").should("be.visible");
    cy.get("body").invoke("text").should("not.be.empty");
  });

  it("application redirects unauthenticated users to login", () => {
    cy.visit("http://localhost:3005/apply");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fapply");
  });
});