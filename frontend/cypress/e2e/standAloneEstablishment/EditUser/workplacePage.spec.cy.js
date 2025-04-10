/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onWorkplacePage } from '../../../support/page_objects/onWorkplacePage';

describe('Standalone home page as edit user', () => {
  const jobRoles = [
    {
      job: 'Care worker',
      total: 2,
    },
    {
      job: 'Senior care worker',
      total: 1,
    },
  ];

  before(() => {
    cy.resetStartersLeaversVacancies(180);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Workplace').click();
    cy.reload();
  });

  it('should see the standalone establishment workplace page', () => {
    cy.url().should('include', '#workplace');
    cy.get('[data-testid="standAloneDashboard"]').contains('Workplace');
  });

  it('should show all sections', () => {
    onWorkplacePage.allSectionsAreVisible();
  });

  xit('All sections have a change link', () => {
    onWorkplacePage.allSectionsAreChangeable();
  });

  it('can update the number of staff successfully', () => {
    cy.get('[data-testid="number-of-staff-top-row"]').contains('Change').click();
    cy.getByLabel('Number of staff').clear().type(6);
    cy.contains('button', 'Save and return').click();
    cy.get('[data-testid="number-of-staff-top-row"]').contains(6);
  });

  it('can add current staff vacancies successfully', () => {
    cy.get('[data-testid="vacancies-top-row"]').contains('Add').click();

    addJobRoles(jobRoles);

    jobRoles.forEach((jobRole) => {
      cy.get('[data-testid="vacancies-top-row"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
    });
  });

  it('can add new starters successfully', () => {
    cy.get('[data-testid="starters"]').contains('Add').click();

    addJobRoles(jobRoles);

    jobRoles.forEach((jobRole) => {
      cy.get('[data-testid="starters"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
    });
  });

  it('can add staff leavers successfully', () => {
    cy.get('[data-testid="leavers"]').contains('Add').click();

    addJobRoles(jobRoles);

    jobRoles.forEach((jobRole) => {
      cy.get('[data-testid="leavers"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
    });
  });

  const addJobRoles = (jobRoles) => {
    if (jobRoles?.length > 0) {
      cy.getByLabel('Yes').click();
      cy.contains('button', 'Continue').click();
      cy.contains('button', 'Show all job roles').click();

      jobRoles.forEach((jobRole) => {
        cy.getByLabel(jobRole.job).click();
      });

      cy.contains('button', 'Continue').click();

      jobRoles.forEach((jobRole) => {
        cy.getByLabel(jobRole.job).clear().type(jobRole.total);
      });

      cy.contains('button', 'Save and return').click();
    }
  };
});

