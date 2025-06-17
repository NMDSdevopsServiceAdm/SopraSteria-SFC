/* eslint-disable no-undef */
/// <reference types="cypress" />
import { StandAloneEstablishment } from '../../../support/mockEstablishmentData';
import { onWorkplacePage } from '../../../support/page_objects/onWorkplacePage';

const workplaceSummaryPath = 'dashboard#workplace';

describe('Standalone home page as edit user', () => {
  const establishmentId = StandAloneEstablishment.id;
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

  const additionalJobRolesToAdd = [
    {
      job: 'Team leader',
      total: 1,
    },
  ];

  before(() => {
    cy.resetStartersLeaversVacancies(establishmentId);
    cy.resetWorkplaceCWPAnswers(establishmentId);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('editStandAloneUser'), Cypress.env('userPassword'));
    cy.get('[data-cy="tab-list"]').contains('Workplace').click();
    cy.reload();
  });

  afterEach(() => {
    cy.resetStartersLeaversVacancies(establishmentId);
    cy.resetWorkplaceCWPAnswers(establishmentId);
  });

  it('should see the standalone establishment workplace page', () => {
    cy.url().should('include', '#workplace');
    cy.get('[data-testid="standAloneDashboard"]').contains('Workplace');
  });

  it('should show all sections', () => {
    onWorkplacePage.allSectionsAreVisible();
  });

  it('All sections have a change link', () => {
    onWorkplacePage.expectRowExistAndChangable('serviceCapacity');
    onWorkplacePage.allSectionsAreChangeable();
  });

  it('can update the number of staff successfully', () => {
    cy.get('[data-testid="number-of-staff-top-row"]').contains('Change').click();
    cy.getByLabel('Number of staff').clear().type(6);
    cy.contains('button', 'Save and return').click();
    cy.get('[data-testid="number-of-staff-top-row"]').contains(6);
  });

  describe('current staff vacancies', () => {
    it('can add successfully', () => {
      cy.get('[data-testid="vacancies-top-row"]').contains('Add').click();

      cy.contains('button', 'Add job roles').click();
      cy.addJobRoles(jobRoles);
      cy.updateJobRoleTotal(jobRoles, 'type');

      cy.contains('button', 'Save and return').click();

      jobRoles.forEach((jobRole) => {
        cy.get('[data-testid="vacancies-top-row"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
      });
    });

    it('can change successfully', () => {
      // setup test
      cy.resetStartersLeaversVacancies(establishmentId);
      cy.updateVacancies({ establishmentID: establishmentId, jobId: 10, total: 1 });
      cy.updateVacancies({ establishmentID: establishmentId, jobId: 18, total: 1 });
      cy.updateVacancies({ establishmentID: establishmentId, jobId: 25, total: 1 });

      cy.reload();

      cy.get('[data-testid="vacancies-top-row"]').contains('Change').click();

      //update vacancies page
      cy.get('[data-testid="plus-button-job-0"]').click();

      cy.get('[data-testid="remove-button-Occupational therapist"]').contains('Remove').click();
      cy.contains('button', 'Add more job roles').click();

      // select job roles
      cy.addJobRoles(additionalJobRolesToAdd);

      const allJobRoles = jobRoles.concat(additionalJobRolesToAdd);

      cy.contains('button', 'Save and return').click();

      allJobRoles.forEach((jobRole) => {
        cy.get('[data-testid="vacancies-top-row"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
      });
    });
  });

  describe('new starters', () => {
    it('can add successfully', () => {
      cy.get('[data-testid="starters"]').contains('Add').click();

      cy.contains('button', 'Add job roles').click();
      cy.addJobRoles(jobRoles);
      cy.updateJobRoleTotal(jobRoles, 'type');

      cy.contains('button', 'Save and return').click();

      jobRoles.forEach((jobRole) => {
        cy.get('[data-testid="starters"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
      });
    });

    it('can change successfully', () => {
      // setup test
      cy.resetStartersLeaversVacancies(establishmentId);
      cy.updateStarters({ establishmentID: establishmentId, jobId: 10, total: 1 });
      cy.updateStarters({ establishmentID: establishmentId, jobId: 18, total: 1 });
      cy.updateStarters({ establishmentID: establishmentId, jobId: 25, total: 1 });

      cy.reload();

      cy.get('[data-testid="starters"]').contains('Change').click();

      //update starters page
      cy.get('[data-testid="plus-button-job-0"]').click();
      cy.get('[data-testid="remove-button-Occupational therapist"]').contains('Remove').click();
      cy.contains('button', 'Add more job roles').click();

      // select job roles
      cy.addJobRoles(additionalJobRolesToAdd);

      const allJobRoles = jobRoles.concat(additionalJobRolesToAdd);

      cy.contains('button', 'Save and return').click();

      allJobRoles.forEach((jobRole) => {
        cy.get('[data-testid="starters"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
      });
    });
  });

  describe('staff leavers', () => {
    it('can add successfully', () => {
      cy.get('[data-testid="leavers"]').contains('Add').click();

      cy.contains('button', 'Add job roles').click();
      cy.addJobRoles(jobRoles);
      cy.updateJobRoleTotal(jobRoles, 'type');

      cy.contains('button', 'Save and return').click();

      jobRoles.forEach((jobRole) => {
        cy.get('[data-testid="leavers"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
      });
    });

    it('can change successfully', () => {
      // setup test
      cy.resetStartersLeaversVacancies(establishmentId);
      cy.updateLeavers({ establishmentID: establishmentId, jobId: 10, total: 1 });
      cy.updateLeavers({ establishmentID: establishmentId, jobId: 18, total: 1 });
      cy.updateLeavers({ establishmentID: establishmentId, jobId: 25, total: 1 });

      cy.reload();

      cy.get('[data-testid="leavers"]').contains('Change').click();

      //update starters page
      cy.get('[data-testid="plus-button-job-0"]').click();
      cy.get('[data-testid="remove-button-Occupational therapist"]').contains('Remove').click();
      cy.contains('button', 'Add more job roles').click();

      // select job roles
      cy.addJobRoles(additionalJobRolesToAdd);

      const allJobRoles = jobRoles.concat(additionalJobRolesToAdd);

      cy.contains('button', 'Save and return').click();

      allJobRoles.forEach((jobRole) => {
        cy.get('[data-testid="leavers"]').contains(`${jobRole.total} x ${jobRole.job.toLocaleLowerCase()}`);
      });
    });
  });

  describe('Care workforce pathway workplace awareness and usage', () => {
    const reasons = [
      { id: 1, text: "To help define our organisation's values" },
      {
        id: 3,
        text: 'To help update our HR and learning and development policies',
      },
      {
        id: 5,
        text: 'To help identify learning and development opportunities for our staff',
      },
      { id: 10, text: 'For something else' },
    ];

    it('can update CareWorkforcePathway awareness and usage for the workplace', () => {
      cy.url().should('contain', workplaceSummaryPath);
      cy.get('[data-testid="care-workforce-pathway-awareness"]').contains('Add').click();

      // CWP awareness question page
      cy.get('h1').should('contain', 'How aware of the care workforce pathway is your workplace?');
      cy.getByLabel(/in practice/).click();
      cy.get('button').contains('Save').click();

      // CWP use question page
      cy.get('h1').should('contain', 'Is your workplace using the care workforce pathway?');
      cy.getByLabel(/No/).click();
      cy.get('button').contains('Save and return').click();

      // verify that answers are added to workplace summary
      cy.url().should('contain', workplaceSummaryPath);
      onWorkplacePage.expectRow('care-workforce-pathway-awareness').toHaveValue('Aware in practice');
      onWorkplacePage.expectRow('care-workforce-pathway-use').toHaveValue('No');

      // change CWP use to Yes with some reasons
      cy.get('[data-testid="care-workforce-pathway-use"]').contains('Change').click();
      cy.getByLabel(/Yes/).click();
      reasons.forEach((reason) => {
        cy.getByLabel(reason.text).click();
      });

      const mockOtherReasonText = 'Free text entered for "something else"';
      cy.getByLabel(/Tell us/).type(mockOtherReasonText);

      cy.get('button').contains('Save and return').click();

      // verify that workplace is updated with reasons
      const expectedReasonTexts = [reasons[0].text, reasons[1].text, reasons[2].text, mockOtherReasonText];
      onWorkplacePage.expectRow('care-workforce-pathway-use').toHaveMultipleValues(expectedReasonTexts);

      // change CWP awareness to Not aware
      cy.get('[data-testid="care-workforce-pathway-awareness"]').contains('Change').click();
      cy.getByLabel(/Not aware/).click();
      cy.get('button').contains('Save').click();

      // should return to workplace summary without seeing CWP use question. also should hide the CWP use row
      cy.url().should('contain', workplaceSummaryPath);

      onWorkplacePage.expectRow('care-workforce-pathway-awareness').toHaveValue('Not aware');
      onWorkplacePage.expectRow('care-workforce-pathway-use').notExist();
    });
  });
});
