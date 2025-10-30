/* eslint-disable no-undef */
/// <reference types="cypress" />

import { WorkplacePage } from './onWorkplacePage';

export class FundingWorkplacePage extends WorkplacePage {
  static testIdsForAllFundingRows = [
    'numberOfStaff',
    'employerType',
    'mainService',
    'serviceCapacity',
    'serviceUsers',
    'vacancies',
    'starters',
    'leavers',
  ];

  expectRow(testIdForRow) {
    const methods = super.expectRow(testIdForRow);
    return {
      ...methods,
      toHaveWarningMessage: (expectedValue) => this.expectRowToHaveWarningMessage(testIdForRow, expectedValue),
      notToHaveWarning: () => this.expectRowNotToHaveWarning(testIdForRow),
    };
  }

  expectRowToHaveWarningMessage = (testIdForRow, warningMessage) => {
    return cy
      .get(`[data-testid="${testIdForRow}"]`)
      .next()
      .within(() => {
        cy.get('img').invoke('attr', 'src').should('include', 'red-flag');
        cy.contains(warningMessage).should('be.visible');
      });
  };

  expectRowNotToHaveWarning = (testIdForRow) => {
    return cy.get(`[data-testid="${testIdForRow}"]`).next().find('img[src*="red-flag"]').should('not.exist');
  };

  expectRowToHaveConfirmationMessage = (testIdForRow, message = 'Is this still correct?') => {
    return this.getConfirmationMessageForRow(testIdForRow).within(() => {
      cy.contains(message).should('be.visible');
      cy.get('button').contains('Yes, it is').should('be.visible');
      cy.get('a').contains('No, change it').should('be.visible');
    });
  };

  getConfirmationMessageForRow = (testIdForRow) => {
    return cy.get(`[data-testid="${testIdForRow}"]`).next('app-wdf-field-confirmation');
  };
}

export const onFundingWorkplacePage = new FundingWorkplacePage();
