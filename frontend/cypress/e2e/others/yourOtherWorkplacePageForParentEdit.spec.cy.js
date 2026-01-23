import { MockNewEstablishment } from '../../support/mockEstablishmentData';
import {
  approveRegistrationRequestAsAdmin,
  fillInAddress,
  inputLocationOrPostcode,
} from '../../support/page_objects/createNewWorkplaceForms';
import { onHomePage } from '../../support/page_objects/onHomePage';

describe('Parent "Your other workplaces" page as edit user', { tags: '@others' }, () => {
  const workplaceName = 'Cypress test - adding new sub workplace';

  before(() => {
    cy.deleteTestWorkplaceFromDb(workplaceName);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Home').click();
    cy.get('a').contains('Your other workplaces').click();
  });

  afterEach(() => {
    cy.deleteTestWorkplaceFromDb(workplaceName);
  });

  it('should be able to add a sub workplace', () => {
    cy.contains('Add a workplace').click();

    cy.contains('Continue').click();

    cy.contains('Is their main service regulated by the Care Quality Commission?').should('be.visible');
    cy.getByLabel('Yes').check();
    cy.get('button').contains('Continue').click();

    inputLocationOrPostcode(MockNewEstablishment.address.postcode);

    fillInAddress(workplaceName, MockNewEstablishment.address);

    // Employer type
    cy.getByLabel('Voluntary, charity, not for profit').check();
    cy.get('button').contains('Continue').click();

    // Main service
    cy.getByLabel('Domiciliary care services').check();
    cy.get('button').contains('Continue').click();

    // Number of staff
    cy.getByLabel('Number of staff').type(5);
    cy.get('button').contains('Continue').click();

    // Confirm details
    cy.get('button').contains('Submit details').click();

    cy.contains('The workplace details you entered are now being checked by Skills for Care').should('be.visible');
    cy.get('a').contains('Sign out').click();

    approveRegistrationRequestAsAdmin(workplaceName);

    // verify that new sub workplace exists
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
    cy.get('a').contains('Your other workplaces').click();
    cy.get('a').contains(workplaceName).should('be.visible');

    cy.get('a').contains(workplaceName).click();
    onHomePage.clickTab('Workplace');

    cy.contains('Start to add more details about your workplace').should('be.visible');
  });
});
