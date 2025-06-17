/* eslint-disable no-undef */
/// <reference types="cypress" />

export class WorkplacePage {
  static testIdsForRows = [
    'vacancies',
    'starters',
    'leavers',
    'number-of-staff-top-row',
    'employerType',
    'mainService',
    'otherServices',
    'serviceCapacity',
    'serviceUsers',
    'repeat-training',
    'accept-care-certificate',
    'care-workforce-pathway-awareness',
    'cash-loyalty-bonus-spend',
    'offer-more-than-statutory-sick-pay',
    'higher-pension-contributions',
    'number-of-days-leave',
    'permissions-section',
  ];

  allSectionsAreVisible() {
    cy.get('[data-testid="workplace-section"]').should('exist');
    cy.get('[data-testid="services-section"]').should('exist');
    cy.get('[data-testid="vacancies-and-turnover-section"]').should('exist');
    cy.get('[data-testid="recruitment-and-benefits-section"]').should('exist');
    cy.get('[data-testid="permissions-section"]').should('exist');
  }

  allSectionsAreChangeable() {
    WorkplacePage.testIdsForRows.forEach((testId) => {
      this.expectRowExistAndChangable(testId);
    });
  }

  expectRow = (testIdForRow) => {
    return {
      toHaveValue: (expectedValue) => this.expectRowToHaveValue(testIdForRow, expectedValue),
      toHaveMultipleValues: (expectedValues) => this.expectRowToHaveMultipleValues(testIdForRow, expectedValues),
      notExist: () => this.expectRowNotExist(testIdForRow),
    };
  };

  expectRowExistAndChangable = (testIdForRow) => {
    return cy.get(`[data-testid="${testIdForRow}"]`).within(() => {
      return cy
        .get('.govuk-summary-list__value')
        .invoke('text')
        .then((rowValue) => {
          if (rowValue.trim() === '-') {
            cy.get('a').should('contain', 'Add');
          } else {
            cy.get('a').should('contain', 'Change');
          }
        });
    });
  };

  expectRowToHaveValue = (testIdForRow, expectedValue) => {
    return cy.get(`[data-testid="${testIdForRow}"]`).within(() => {
      cy.get('.govuk-summary-list__value').should('contain', expectedValue);
    });
  };

  expectRowToHaveMultipleValues = (testIdForRow, expectedValues) => {
    const cyChain = this.expectRowToHaveValue(testIdForRow, expectedValues[0]);
    expectedValues.slice(1).forEach((value) => {
      cyChain.and('contain', value);
    });
    return cyChain;
  };

  expectRowNotExist = (testIdForRow) => {
    return cy.get(`[data-testid="${testIdForRow}"]`).should('not.exist');
  };
}

export const onWorkplacePage = new WorkplacePage();
