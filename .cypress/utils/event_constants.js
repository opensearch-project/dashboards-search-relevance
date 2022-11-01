export const delay = 1000;

export const landOnSearchRelevance = () => {
  cy.visit(
    `${Cypress.env('opensearchDashboards')}/app/searchRelevance#/`
  );
  cy.wait(delay);
};
