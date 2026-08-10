
describe("LendSwift Loan Application", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("loads the homepage", () => {
    cy.url().should("include", "localhost:3005");
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

  it("redirects unauthenticated users from loan application to login", () => {
    cy.visit("/apply");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fapply");
  });

  it("redirects unauthenticated users from calculator to login", () => {
    cy.visit("/calculator");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fcalculator");
  });

  it("opens the loans page", () => {
    cy.visit("/loans");

    cy.url().should("include", "/loans");
    cy.get("body").should("be.visible");
  });

  it("redirects unauthenticated users from documents to login", () => {
    cy.visit("/documents");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fdocuments");
  });

  it("redirects unauthenticated users from profile to login", () => {
    cy.visit("/profile");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fprofile");
  });

  it("redirects unauthenticated users from dashboard to login", () => {
    cy.visit("/dashboard");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fdashboard");
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

  it("calculator route redirects unauthenticated users correctly", () => {
    cy.visit("/calculator");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fcalculator");
    cy.get("body").should("be.visible");
  });

  it("loans page loads successfully", () => {
    cy.visit("/loans");

    cy.get("body").should("be.visible");
    cy.url().should("include", "/loans");
  });

  it("documents route redirects unauthenticated users correctly", () => {
    cy.visit("/documents");

    cy.url().should("include", "/login");
    cy.get("body").should("be.visible");
  });

  it("home page has visible content", () => {
    cy.visit("/");

    cy.get("body").should("be.visible");
    cy.get("body").invoke("text").should("not.be.empty");
  });

  it("application redirects unauthenticated users to login", () => {
    cy.visit("/apply");

    cy.url().should("include", "/login");
    cy.url().should("include", "redirect=%2Fapply");
  });
});
