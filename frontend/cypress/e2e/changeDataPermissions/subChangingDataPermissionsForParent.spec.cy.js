/* eslint-disable no-undef */
/// <reference types="cypress" />
import { SubEstablishment } from '../../support/mockEstablishmentData';

describe(
  'Subsidiary changing data permissions for their parent to view their workplace',
  { tags: '@changeDataPermissions' },
  () => {
    beforeEach(() => {
      cy.loginAsUser(Cypress.env('editSubUser'), Cypress.env('userPassword'));
    });

    const parentName = SubEstablishment.parentName;
    const radioButtonLabels = [
      'Only your workplace details',
      'Your workplace details and your staff records',
      'No access to your data, linked only',
    ];

    radioButtonLabels.forEach((radioButtonLabel) => {
      it(`parent permission is changed to ${radioButtonLabel}`, () => {
        cy.intercept('POST', '/api/establishment/*/dataPermissions').as('dataPermissions');

        cy.get('a').contains('Change data permissions').click();

        //Change data permissions
        cy.contains(SubEstablishment.name);
        cy.contains(parentName);

        cy.getByLabel(radioButtonLabel).click();
        cy.contains('Save and return').click();

        cy.wait('@dataPermissions');

        cy.contains(`You've changed data permissions for ${parentName}`);
      });
    });
  },
);
