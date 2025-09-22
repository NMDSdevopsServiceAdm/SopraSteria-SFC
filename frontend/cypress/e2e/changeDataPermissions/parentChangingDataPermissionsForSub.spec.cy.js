/* eslint-disable no-undef */
/// <reference types="cypress" />
import { ParentEstablishment, MockNewEstablishment } from '../../support/mockEstablishmentData';
import {
  approveRegistrationRequestAsAdmin,
  fillInAddress,
  inputLocationOrPostcode,
} from '../../support/page_objects/createNewWorkplaceForms';

describe('Parent changing data permissions for a subsidiary', () => {
  const subsidiaryWorkplaceName = MockNewEstablishment.name;

  before(() => {
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
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
    cy.get('a').contains('Your other workplaces').click();
  });

  after(() => {
    cy.deleteTestWorkplaceFromDb(subsidiaryWorkplaceName);
  });

  const dataPermissions = ['Workplace', 'Workplace and staff records', 'No access to data, linked only'];
  const radioButtonLabels = [
    'Only their workplace details',
    'Their workplace details and their staff records',
    'No access to their data, linked only',
  ];

  radioButtonLabels.forEach((radioButtonLabel, index) => {
    it(`subsidiary permission is changed to ${radioButtonLabel}`, () => {
      cy.get('[data-cy="workplace-data-owner"]').contains('Parent');

      const workplacePanel = cy.get('[ng-reflect-sub-workplace-number="0"]');

      workplacePanel.contains('Change data permissions').click();

      //Change data permissions
      cy.contains(ParentEstablishment.name);
      cy.contains(subsidiaryWorkplaceName);

      cy.getByLabel(radioButtonLabel).click();
      cy.contains('Save and return').click();

      cy.get('[data-cy="workplace-data-permission"]').contains(dataPermissions[index]);
      cy.contains(`You've changed data permissions for ${subsidiaryWorkplaceName}`);
    });
  });
});
