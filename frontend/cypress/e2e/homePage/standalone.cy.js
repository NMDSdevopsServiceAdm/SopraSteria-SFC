describe('Home page', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
  });

  it('should have a link to the Benefits Bundle', () => {
    cy.contains('View the ASC-WDS Benefits Bundle').click()
    cy.url().should('include', 'benefits-bundle')
    cy.get('h1').should('contain', 'The ASC-WDS Benefits Bundle');
  });

  it('should have a link to the Certificate', () => {
    cy.contains('Get your ASC-WDS certificate').click()
    cy.url().should('include', 'asc-wds-certificate')
    cy.get('h1').should('contain', 'Get your ASC-WDS certificate');
  });

  it('should have a link to information about the ACS-WDS', () => {
    cy.contains('About ASC-WDS').click()
    cy.url().should('include', 'about-ascwds')
    cy.get('h1').should('contain', 'About ASC-WDS');
  });
});
