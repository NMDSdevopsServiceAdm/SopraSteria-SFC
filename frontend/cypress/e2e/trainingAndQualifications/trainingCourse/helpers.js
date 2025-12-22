/* eslint-disable no-undef */
/// <reference types="cypress" />

import { onHomePage } from '../../../support/page_objects/onHomePage';

export const clickIntoTrainingCourse = (courseName) => {
  cy.get('a').not(':contains("Remove")').contains(courseName).click();
};

export const clickIntoAddAndManageTrainingCourses = () => {
  onHomePage.clickTab('Training and qualifications');
  cy.contains('Add and manage training').click();
  cy.get('a').contains('Add and manage training courses').click();

  cy.get('h1').should('contain.text', 'Add and manage training courses for your workplace');
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
    completedDate,
    expiryDate,
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

  if (completedDate) {
    cy.get('[data-testid="completedDate"]').within(() => {
      shouldHaveDate(completedDate);
    });
  }

  if (expiryDate) {
    cy.get('[data-testid="expiresDate"]').within(() => {
      shouldHaveDate(expiryDate);
    });
  }
};

const shouldHaveDate = (dateString) => {
  const [year, month, day] = dateString.split('-').map((x) => parseInt(x));
  cy.getByLabel('Day').should('have.value', day);
  cy.getByLabel('Month').should('have.value', month);
  cy.getByLabel('Year').should('have.value', year);
};

export const clickIntoWorkerTAndQRecordPage = (workerName) => {
  cy.get('[data-cy="tab-list"]').contains('Training and qualifications').click();
  cy.get('[data-testid="training-worker-table"]').contains(workerName).click();
  cy.url().should('contain', 'training-and-qualifications-record');
};
