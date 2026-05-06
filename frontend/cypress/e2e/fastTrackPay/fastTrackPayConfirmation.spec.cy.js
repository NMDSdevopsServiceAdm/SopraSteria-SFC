/* eslint-disable no-undef */
/// <reference types="cypress" />

import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';

describe('Fast-track pay updates by job roles', { tags: '@staffRecords' }, () => {
  const establishmentID = StandAloneEstablishment.id;

  before(() => {
    cy.archiveAllWorkersInWorkplace(establishmentID);

    cy.insertTestWorker({
      establishmentID,
      workerName: 'Care worker 1',
      mainJobFKValue: 10,
    });

    cy.insertTestWorker({
      establishmentID,
      workerName: 'Care worker 2',
      mainJobFKValue: 10,
    });
  });

  beforeEach(() => {
    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, Cypress.env('userPassword'));

    cy.intercept('GET', '**/worker/groupedByJobRole', {
      statusCode: 200,
      body: {
        groups: [
          {
            jobId: 10,
            title: 'Care worker',
            count: 2,
            workers: [{ uid: '1' }, { uid: '2' }],
            annualHourlyPay: { value: null, rate: null },
          },
        ],
      },
    }).as('getWorkers');

    cy.intercept('PUT', '**/workers', {
      statusCode: 200,
      body: {},
    }).as('updateWorkers');

    onHomePage.clickTab('Staff records');
  });
  it('should update pay for a job role', () => {
    cy.contains('Update pay for multiple staff').click();
    cy.contains('Fast-track pay updates by job roles').click();

    cy.wait('@getWorkers');

    cy.get('[data-testid="worker-row-0"]').within(() => {
      cy.get('[data-testid="amount-input-box-0"]').type('12');
      cy.get('[data-testid="hourly-radio-0"]').check();
    });

    cy.contains('button', 'Continue').click();

    cy.get('[data-testid="heading"]').should('contain', "You're about to update pay");

    cy.contains('Care worker (2 records)').should('exist');

    cy.contains('£12.50 hourly pay').should('exist');

    cy.contains('Change').should('exist');

    cy.contains('button', 'Save and return').click();

    cy.wait('@updateWorkers').then((interception) => {
      const body = interception.request.body;

      expect(body).to.be.an('array');
      expect(body[0].annualHourlyPay.rate).to.equal(12.5);
    });

    cy.contains('Pay updated in').should('exist');
  });
});
