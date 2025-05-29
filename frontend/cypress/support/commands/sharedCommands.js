Cypress.Commands.add('getByLabel', (label) => {
  cy.contains('label', label)
    .invoke('attr', 'for')
    .then((id) => {
      cy.get('#' + id);
    });
});

Cypress.Commands.add('addJobRoles', (jobRoles) => {
  if (jobRoles?.length > 0) {
    // select job roles
    cy.contains('button', 'Show all job roles').click();

    jobRoles.forEach((jobRole) => {
      cy.getByLabel(jobRole.job).click();
    });

    cy.contains('button', 'Continue').click();
  }
});

Cypress.Commands.add('updateJobRoleTotal', (jobRoles, action) => {
  let jobTotal = 0;
  if (action === 'type') {
    jobRoles.forEach((jobRole) => {
      cy.getByLabel(jobRole.job).as('label');
      cy.get('@label').clear();
      cy.get('@label').type(jobRole.total);
      jobTotal += jobRole.total;
    });
    cy.get('button').first().focus();
    cy.get('[data-testid="total-number"]').contains(jobTotal);
  } else {
    cy.get('[data-testid="total-number"]').contains(jobRoles.length);
  }
});
