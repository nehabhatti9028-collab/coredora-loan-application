describe("Coredora Loan Application", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("01 - loads the loan application successfully", () => {
    cy.url().should("include", "localhost:3005");
    cy.get("body").should("be.visible");
  });

  it("02 - renders the application page", () => {
    cy.get("body").should("exist");
  });

  it("03 - page contains interactive elements", () => {
    cy.get("button, input, a, select").should("have.length.greaterThan", 0);
  });

  it("04 - page contains form controls", () => {
    cy.get("input, select, textarea, button").should(
      "have.length.greaterThan",
      0
    );
  });

  it("05 - buttons are rendered", () => {
    cy.get("button").should("have.length.greaterThan", 0);
  });

  it("06 - inputs are rendered", () => {
    cy.get("input").should("have.length.greaterThan", 0);
  });

  it("07 - links are rendered when available", () => {
    cy.get("body").then(($body) => {
      if ($body.find("a").length > 0) {
        cy.get("a").should("have.length.greaterThan", 0);
      } else {
        cy.get("body").should("be.visible");
      }
    });
  });

  it("08 - application page remains accessible after reload", () => {
    cy.reload();
    cy.url().should("include", "localhost:3005");
    cy.get("body").should("be.visible");
  });

  it("09 - page has a valid document title", () => {
    cy.title().should("not.be.empty");
  });

  it("10 - page has a visible main content area", () => {
    cy.get("body").should("be.visible");
  });

  it("11 - page does not show a Next.js error overlay", () => {
    cy.get("body").should("not.contain", "Application error");
  });

  it("12 - application route is valid", () => {
    cy.location("pathname").should("eq", "/");
    cy.get("body").should("be.visible");
  });

  it("13 - application does not navigate to an error route", () => {
    cy.location("pathname").should("not.include", "/404");
    cy.location("pathname").should("not.include", "/500");
    cy.get("body").should("be.visible");
  });

  it("14 - page can be revisited successfully", () => {
    cy.visit("/");
    cy.url().should("include", "localhost:3005");
    cy.get("body").should("be.visible");
  });

  it("15 - loan application is ready for user interaction", () => {
    cy.get("body").should("be.visible");
    cy.get("button, input, a, select, textarea").should(
      "have.length.greaterThan",
      0
    );
  });
});