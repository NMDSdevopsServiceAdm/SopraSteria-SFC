/* eslint-disable no-undef */
/// <reference types="cypress" />

export const clickIntoTrainingCourse = (courseName) => {
  cy.get('a').not(':contains("Remove")').contains(courseName).click();
};

export const fillInCourseDetails = (courseDetails) => {
  const { courseName, accredited, deliveredBy, providerName, howWasItDelivered, doesNotExpire, validityPeriodInMonth } =
    courseDetails;

  cy.getByLabel('Training course name').as('courseName').clear();
  cy.get('@courseName').type(courseName);
  const accreditedLabel = accredited === "Don't know" ? 'I do not know' : accredited;
  cy.getByLabel(accreditedLabel).click();
  cy.getByLabel(deliveredBy).click();

  if (deliveredBy === 'External provider') {
    cy.getByLabel('Provider name').as('providerName').clear();
    cy.get('@providerName').type(providerName);
  }

  cy.getByLabel(howWasItDelivered).click();

  if (doesNotExpire) {
    cy.getByLabel('This training does not expire').click();
  } else {
    cy.getByLabel(/How many months/).type(validityPeriodInMonth);
  }
};

export const expectPageToHaveDetails = (details) => {
  const {
    courseName,
    trainingRecordTitle,
    accredited,
    deliveredBy,
    providerName,
    howWasItDelivered,
    doesNotExpire,
    validityPeriodInMonth,
  } = details;

  if (courseName) {
    cy.getByLabel('Training course name').should('have.value', courseName);
  } else if (trainingRecordTitle) {
    cy.getByLabel('Training record name').should('have.value', trainingRecordTitle);
  }

  const accreditedLabel = accredited === "Don't know" ? 'I do not know' : accredited;
  cy.getByLabel(accreditedLabel).should('be.checked');
  cy.getByLabel(deliveredBy).should('be.checked');

  if (deliveredBy === 'External provider') {
    cy.getByLabel('Provider name').should('have.value', providerName);
  }

  cy.getByLabel(howWasItDelivered).should('be.checked');

  if (doesNotExpire) {
    cy.getByLabel('This training does not expire').should('be.checked');
  } else {
    cy.getByLabel(/How many months/).should('have.value', validityPeriodInMonth.toString());
  }
};
