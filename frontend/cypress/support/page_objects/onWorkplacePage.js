/* eslint-disable no-undef */
/// <reference types="cypress" />

export class WorkplacePage {
  // legacy stuff
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

  // store testId for div rows
  static mainServiceTestId = 'mainService';
  static DHAQuestion1TestId = 'carryOutDelegatedHealthcareActivities';
  static DHAQuestion2TestId = 'know-what-delegated-healthcare-activities';

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

  allSectionsAreNotChangeable() {
    WorkplacePage.testIdsForRows.forEach((testId) => {
      this.expectRowExistAndNotChangable(testId);
    });
  }

  expectRow(testIdForRow) {
    return {
      toHaveValue: (expectedValue) => this.expectRowToHaveValue(testIdForRow, expectedValue),
      toHaveMultipleValues: (expectedValues) => this.expectRowToHaveMultipleValues(testIdForRow, expectedValues),
      notExist: () => this.expectRowNotExist(testIdForRow),
    };
  }

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

  expectRowExistAndNotChangable = (testIdForRow) => {
    cy.get(`[data-testid="${testIdForRow}"]`).as('testId');

    return cy.get('@testId').within(() => {
      return cy
        .get('.govuk-summary-list__value')
        .invoke('text')
        .then((rowValue) => {
          if (rowValue.trim() === '-') {
            cy.get('@testId').should('not.contain', 'Add');
          } else {
            cy.get('@testId').should('not.contain', 'Change');
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

  clickIntoQuestion = (testIdForRow) => {
    return cy.get(`[data-testid="${testIdForRow}"]`).within(() => {
      cy.get('a')
        .contains(/Add|Change/)
        .click();
    });
  };

  answerNumberOfStaffQuestion = (numberOfStaff) => {
    cy.getByLabel('Number of staff').as('numberOfStaffInput').clear();
    // wait for .clear() to finish before typing new answer
    cy.get('@numberOfStaffInput').should('have.value', '').type(numberOfStaff);
    cy.get('button').contains(/Save/).click();
  };

  clickIntoMainServiceQuestionAndAnswer = (nameOfNewMainService) => {
    this.clickIntoQuestion(WorkplacePage.mainServiceTestId);
    this.answerMainServiceQuestion(nameOfNewMainService);
  };

  answerMainServiceQuestion = (nameOfNewMainService) => {
    const headingForFirstQuestion = 'Is your new main service regulated by the Care Quality Commission (CQC)?';

    cy.get('h1').should('contain', headingForFirstQuestion);
    cy.getByLabel('No').click();
    cy.get('button').contains('Continue').click();

    cy.get('h1').should('contain', 'Select your main service');
    cy.getByLabel(nameOfNewMainService).click();
    cy.get('button').contains(/Save/).click();
  };

  answerServiceCapacity = (totalNumber, numberBeingUsed) => {
    cy.getByLabel('How many places do you have at the moment?').clear().type(totalNumber);
    cy.getByLabel('Number of those places that are being used').clear().type(numberBeingUsed);
    cy.contains('button', 'Save and return').click();
  };

  answerServiceUsersQuestion = (serviceUsers) => {
    serviceUsers = serviceUsers ?? ['Older people with dementia', 'Adults with dementia'];

    cy.get('h1').should('contain.text', 'Who are your service users?');
    for (const serviceUser of serviceUsers) {
      cy.getByLabel(serviceUser).check();
    }

    cy.contains('button', 'Save and return').click();
  };

  answerDHAQuestion1 = (doStaffCarryOutDHA) => {
    cy.get('h1').should('contain', 'Do your non-nursing staff carry out delegated healthcare activities?');
    cy.getByLabel(doStaffCarryOutDHA).click();
    cy.get('button').contains(/Save/).click();
  };

  answerDHAQuestion2 = (whatKindOfDHAs) => {
    cy.get('h1').should('contain', 'What kind of delegated healthcare activities do your non-nursing staff carry out?');
    whatKindOfDHAs.forEach((activityName) => {
      cy.getByLabel(activityName).click();
    });
    cy.get('button').contains(/Save/).click();
  };

  answerDHAQuestions = (doStaffCarryOutDHA, whatKindOfDHAs) => {
    this.clickIntoQuestion(WorkplacePage.DHAQuestion1TestId);
    this.answerDHAQuestion1(doStaffCarryOutDHA);

    if (!Array.isArray(whatKindOfDHAs)) {
      return;
    }

    this.answerDHAQuestion2(whatKindOfDHAs);
    cy.get('h1').should('contain', 'Workplace');
  };
}

export const onWorkplacePage = new WorkplacePage();
