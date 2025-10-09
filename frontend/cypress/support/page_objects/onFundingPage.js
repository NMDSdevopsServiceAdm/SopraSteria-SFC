/* eslint-disable no-undef */
/// <reference types="cypress" />

import { WorkplacePage } from './onWorkplacePage';

const getFundingEligibilityStartDate = () => {
  const today = new Date();
  const yearStartMonth = 3; // April
  if (today.getMonth() < yearStartMonth) {
    return new Date(Date.UTC(today.getFullYear() - 1, yearStartMonth, 1));
  } else {
    return new Date(Date.UTC(today.getFullYear(), yearStartMonth, 1));
  }
};
const periodStartDate = getFundingEligibilityStartDate();
const yearStart = periodStartDate.getFullYear();

export class FundingPage {
  expectWorkplaceToBeEligible() {
    cy.get('div[data-testid="workplace-row"]').within(() => {
      cy.contains(`Your data has met the funding requirements for ${yearStart} to ${yearStart + 1}`).should(
        'be.visible',
      );
      cy.get('img[src*="green-tick"]').should('be.visible');
    });
  }

  expectWorkplaceRowToShowEligibilityMessage() {
    cy.get('div[data-testid="workplace-row"]').within(() => {
      cy.contains(`Your data has met the funding requirements for ${yearStart} to ${yearStart + 1}`).should(
        'be.visible',
      );
      cy.get('img[src*="green-tick"]').should('be.visible');
    });
  }
}

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

  expectRowToHaveConfirmationMessage = (testIdForRow, message = 'Is this still correct?') => {
    return cy
      .get(`[data-testid="${testIdForRow}"]`)
      .next('app-wdf-field-confirmation')
      .within(() => {
        cy.contains(message).should('be.visible');
        cy.get('button').contains('Yes, it is').should('be.visible');
        cy.get('a').contains('No, change it').should('be.visible');
      });
  };

  getConfirmationMessageForRow = (testIdForRow) => {
    return cy.get(`[data-testid="${testIdForRow}"]`).next('app-wdf-field-confirmation');
  };

  expectRowNotToHaveWarning = (testIdForRow) => {
    return cy.get(`[data-testid="${testIdForRow}"]`).next().find('img[src*="red-flag"]').should('not.exist');
  };
}

export const onFundingPage = new FundingPage();
export const onFundingWorkplacePage = new FundingWorkplacePage();
