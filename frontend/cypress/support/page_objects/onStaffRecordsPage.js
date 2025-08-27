/* eslint-disable no-undef */
/// <reference types="cypress" />

export class StaffRecordsPage {
  clickIntoWorker = (workerName) => {
    cy.contains('a', workerName).click();
    cy.get('[data-testid="section-heading"]').should('contain.text', workerName);
  };
}

export class StaffRecordSummaryPage {
  answerDHAQuestion = (carryOutDHA) => {
    cy.get('h1').should('contain.text', 'Do they carry out delegated healthcare activities?');
    cy.getByLabel(carryOutDHA).click();
    cy.get('button').contains(/Save/).click();
  };

  // staff record summary page don't use testid for most rows, so use the field name to locate the row instead
  expectRow = (nameOfRow) => {
    return {
      toHaveValue: (expectedValue) => this.expectRowToHaveValue(nameOfRow, expectedValue),
      notExist: () => this.expectRowNotExist(nameOfRow),
    };
  };

  expectRowToHaveValue = (nameOfRow, expectedValue) => {
    return cy.contains('div.govuk-summary-list__row', nameOfRow).within(() => {
      cy.get('.govuk-summary-list__value').should('contain', expectedValue);
    });
  };

  expectRowNotExist = (nameOfRow) => {
    return cy.contains('div.govuk-summary-list__row', nameOfRow).should('not.exist');
  };

  clickIntoQuestion = (nameOfRow) => {
    return cy.contains('div.govuk-summary-list__row', nameOfRow).within(() => {
      cy.get('a')
        .contains(/Add|Change/)
        .click();
    });
  };
}

export const onStaffRecordsPage = new StaffRecordsPage();
export const onStaffRecordSummaryPage = new StaffRecordSummaryPage();
