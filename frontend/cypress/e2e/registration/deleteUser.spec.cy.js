import { StandAloneEstablishment } from '../../support/mockEstablishmentData';

describe('delete a user from workplace', { tags: '@registration' }, () => {
  const mockUserForDeletion = 'Mock new user for deletion';

  before(() => {
    cy.deleteTestUserFromDb(mockUserForDeletion);
    cy.addTestUser(mockUserForDeletion, 'mock-new-user', StandAloneEstablishment.id);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
  });

  it(`should be able to remove a user from the workplace`, () => {
    cy.contains('Users').click();

    cy.url().should('contain', '/users');
    cy.get('h1').should('contain', 'User');

    cy.contains('a', mockUserForDeletion).click();

    cy.get('h1').should('contain', 'User details');

    cy.contains('a', 'Delete this user').click();

    const expectedMessage = `You're about to delete ${mockUserForDeletion} as a user`;
    cy.contains(expectedMessage).should('exist');

    cy.contains('button', 'Delete this user').click();

    cy.url().should('contain', '/users');
    cy.get('h1').should('contain', 'User');
    cy.contains('.govuk-inset-text.success', `${mockUserForDeletion} has been deleted as a user`).should('be.visible');

    cy.contains('a', mockUserForDeletion).should('not.exist');
  });
});
