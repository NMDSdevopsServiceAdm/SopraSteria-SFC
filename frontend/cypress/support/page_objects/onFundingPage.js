/* eslint-disable no-undef */
/// <reference types="cypress" />

import { WorkplacePage } from './onWorkplacePage';

export class FundingWorkplacePage extends WorkplacePage {
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
}

export const onFundingWorkplacePage = new FundingWorkplacePage();
