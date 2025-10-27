/* eslint-disable no-undef */
/// <reference types="cypress" />
import { SubEstablishment } from '../../support/mockEstablishmentData';

describe('Subsidiary changing data permissions for their parent to view their workplace', () => {
  beforeEach(() => {
    cy.reload();
    cy.loginAsUser(Cypress.env('editSubUser'), Cypress.env('userPassword'));
  });

  const parentName = SubEstablishment.parentName;
  const radioButtonLabels = [
    'Only your workplace details',
    'Your workplace details and your staff records',
    'No access to your data, linked only',
  ];

  radioButtonLabels.forEach((radioButtonLabel, index) => {
    it(`parent permission is changed to ${radioButtonLabel}`, () => {
      cy.get('a').contains('Change data permissions').click();

      //Change data permissions
      cy.contains(SubEstablishment.name);
      cy.contains(parentName);

      cy.getByLabel(radioButtonLabel).click();
      cy.contains('Save and return').click();

      cy.contains(`You've changed data permissions for ${parentName}`);
    });
  });
});
