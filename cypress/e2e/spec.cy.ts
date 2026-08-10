describe("Coredora Loan Application", () => {
  it("loads the loan application successfully", () => {
    cy.visit("/");
    cy.url().should("include", "localhost:3005");
  });
});