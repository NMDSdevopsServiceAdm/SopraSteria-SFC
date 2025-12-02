/* eslint-disable no-undef */
/// <reference types="cypress" />
import { ParentEstablishment, MockNewEstablishment } from '../../support/mockEstablishmentData';
import {
  approveRegistrationRequestAsAdmin,
  fillInAddress,
  inputLocationOrPostcode,
} from '../../support/page_objects/createNewWorkplaceForms';
import { fillUserRegistrationForm, createUserWithinWorkplace } from '../../support/page_objects/userRegistrationForms';

describe('parent requesting to change data owner', () => {
  const subsidiaryWorkplaceName = 'Workplace for data ownership';
  const userFullName = 'Test new user for cypress';
  const loginId = 'cypress-test-user-0002';
  const mockPassword = 'Some-very-super-strong-p@ssw0rd';

  before(() => {
    cy.deleteOwnershipRequest(subsidiaryWorkplaceName);
    cy.deleteTestUserFromDb(userFullName);
    cy.deleteTestWorkplaceFromDb(subsidiaryWorkplaceName);

    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Home').click();
    cy.get('a').contains('Your other workplaces').click();

    cy.contains('Add a workplace').click();

    cy.contains('Continue').click();

    cy.contains('Is their main service regulated by the Care Quality Commission?').should('be.visible');
    cy.getByLabel('Yes').check();
    cy.get('button').contains('Continue').click();

    inputLocationOrPostcode(MockNewEstablishment.address.postcode);

    fillInAddress(subsidiaryWorkplaceName, MockNewEstablishment.address);

    cy.getByLabel('Voluntary, charity, not for profit').check();
    cy.get('button').contains('Continue').click();

    cy.getByLabel('Domiciliary care services').check();
    cy.get('button').contains('Continue').click();

    cy.getByLabel('Number of staff').type(5);
    cy.get('button').contains('Continue').click();

    cy.get('button').contains('Submit details').click();

    cy.contains('The workplace details you entered are now being checked by Skills for Care').should('be.visible');
    cy.get('a').contains('Sign out').click();

    approveRegistrationRequestAsAdmin(subsidiaryWorkplaceName);

    //create user for sub
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
    cy.get('a').contains('Your other workplaces').click();
    cy.get('a').contains(subsidiaryWorkplaceName).click();
    cy.get('a').contains('Workplace users').click();

    //Add a user
    createUserWithinWorkplace({ userFullName, username: loginId, password: mockPassword });

    //change owner in db
    cy.updateDataOwner({
      parentEstablishmentID: ParentEstablishment.id,
      subWorkplaceName: subsidiaryWorkplaceName,
      dataOwnerValue: 'Workplace',
    });
    cy.reload();
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
    cy.get('a').contains('Your other workplaces').click();
  });

  after(() => {
    cy.deleteOwnershipRequest(subsidiaryWorkplaceName);
    cy.deleteTestUserFromDb(userFullName);
    cy.deleteTestWorkplaceFromDb(subsidiaryWorkplaceName);
  });

  it('should make a request to become the data owner and then cancel the request', () => {
    cy.get(`[data-cy="${subsidiaryWorkplaceName}"]`).contains('Change data owner').click();

    cy.get('h1').contains('Change data owner').should('be.visible');
    cy.contains(ParentEstablishment.name);
    cy.contains(subsidiaryWorkplaceName);

    cy.getByLabel('Only their workplace details').click();
    cy.contains('Send change request').click();

    cy.get(`[data-testid="generic_alert"]`).contains("You've sent a change data owner request");
    cy.get(`[data-cy="${subsidiaryWorkplaceName}"]`).contains('Data request pending').click();

    cy.get('h1').contains('Your request to change ownership of data is pending').should('be.visible');

    cy.get('button').contains('Cancel data owner request').click();

    cy.get(`[data-testid="generic_alert"]`).contains('Request to change data owner has been cancelled');
    cy.get(`[data-cy="${subsidiaryWorkplaceName}"]`).contains('Change data owner');
  });

  it('should make a request to become the data owner and the subsidiary rejects the request', () => {
    cy.intercept('POST', 'api/logout').as('logout');
    cy.get(`[data-cy="${subsidiaryWorkplaceName}"]`).contains('Change data owner').click();

    cy.get('h1').contains('Change data owner').should('be.visible');
    cy.contains(ParentEstablishment.name);
    cy.contains(subsidiaryWorkplaceName);

    cy.getByLabel('Only their workplace details').click();
    cy.contains('Send change request').click();

    cy.get(`[data-testid="generic_alert"]`).contains("You've sent a change data owner request");
    cy.get('a').contains('Sign out').click();
    cy.wait('@logout');

    // log into sub
    cy.loginAsUser(loginId, mockPassword);
    cy.contains('Notifications').click();

    cy.get('h1').contains('Notifications').should('be.visible');
    cy.contains('Change data owner request').click();

    cy.get('h1').contains('Notification').should('be.visible');
    cy.contains('Data permissions if approved');
    cy.get('button').contains('Reject request').click();

    cy.get('h1').contains('Do you want to provide a reason for rejecting').should('be.visible');
    cy.getByLabel('No, continue without providing a reason').click();
    cy.get('button').contains('Continue').click();

    cy.get(`[data-testid="generic_alert"]`).contains(
      `Your decision to transfer ownership of data has been sent to ${ParentEstablishment.name}`,
    );
    cy.get('a').contains('Sign out').click();

    cy.wait('@logout');

    //log into parent
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
    cy.get('a').contains('Your other workplaces').click();
    cy.get(`[data-cy="${subsidiaryWorkplaceName}"]`).contains('Change data owner');
  });

  it('should make a request to become the data owner and the subsidiary approves the request', () => {
    cy.get(`[data-cy="${subsidiaryWorkplaceName}"]`).contains('Change data owner').click();

    cy.get('h1').contains('Change data owner').should('be.visible');
    cy.contains(ParentEstablishment.name);
    cy.contains(subsidiaryWorkplaceName);

    cy.getByLabel('Only their workplace details').click();
    cy.contains('Send change request').click();

    cy.get(`[data-testid="generic_alert"]`).contains("You've sent a change data owner request");
    cy.get('a').contains('Sign out').click();

    // log into sub
    cy.loginAsUser(loginId, mockPassword);
    cy.contains('Notifications').click();

    cy.get('h1').contains('Notifications').should('be.visible');
    cy.contains('Change data owner request').click();

    cy.get('h1').contains('Notification').should('be.visible');
    cy.contains('Data permissions if approved');
    cy.get('button').contains('Approve request').click();

    cy.get(`[data-testid="generic_alert"]`).contains(
      `Your decision to transfer ownership of data has been sent to ${ParentEstablishment.name}`,
    );
    cy.get('a').contains('Sign out').click();

    //log into parent
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
    cy.get('a').contains('Your other workplaces').click();
    cy.get(`[data-cy="${subsidiaryWorkplaceName}"]`).contains('Change data owner').should('not.exist');
  });
});
