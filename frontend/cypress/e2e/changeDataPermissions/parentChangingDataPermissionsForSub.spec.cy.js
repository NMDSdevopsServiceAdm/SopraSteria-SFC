/* eslint-disable no-undef */
/// <reference types="cypress" />
import { ParentEstablishment } from '../../support/mockEstablishmentData';

describe('Parent changing data permissions for a subsidiary', () => {
  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editParentUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Home').click();
    cy.get('a').contains('Your other workplaces').click();
  });

  const subsidiaryName = 'Workplace test 1';
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
      cy.contains(subsidiaryName);

      cy.getByLabel(radioButtonLabel).click();
      cy.contains('Save and return').click();

      cy.get('[data-cy="workplace-data-permission"]').contains(dataPermissions[index]);
      cy.contains(`You've changed data permissions for ${subsidiaryName}`);
    });
  });
});
