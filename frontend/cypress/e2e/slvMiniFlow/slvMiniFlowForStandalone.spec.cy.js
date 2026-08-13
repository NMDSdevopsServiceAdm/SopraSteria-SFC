/* eslint-disable no-undef */
/// <reference types="cypress" />
import { onWorkplacePage } from '../../support/page_objects/onWorkplacePage';
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { userPassword } from '../../support/configData';
import { onHomePage } from '../../support/page_objects/onHomePage';

describe('Starters Leavers Vacancies mini flow from home summary flag', { tags: '@workplace' }, () => {
  before(() => {
    cy.fillWorkplaceCWPAnswers(StandAloneEstablishment.id);
    cy.fillWorkplaceDHAAnswers(StandAloneEstablishment.id);
    cy.resetStartersLeaversVacancies(StandAloneEstablishment.id);
    cy.updateStaffTotalNumberToMatchActualWorkers(StandAloneEstablishment.id);
  });

  beforeEach(() => {
    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, userPassword);

    cy.url().should('contain', 'dashboard');
    cy.get('h1').should('contain', StandAloneEstablishment.name);
  });

  const jobRolesToAdd = [
    {
      job: 'Care worker',
      total: 2,
    },
    {
      job: 'Registered nurse',
      total: 3,
    },
  ];

  it('should show a message to guide user to a mini flow for adding starters leavers vacancies', () => {
    // TODO: change this message to to "Add your starters, leavers and vacancy data" message when merged with grey summary panel branch
    cy.get('[data-testid="summaryBox"]').contains("You've not added any vacancy and turnover data").click();
    cy.get('h1').should('contain.text', 'Add your starters, leavers and vacancy data');

    cy.get('[data-testid="starters"]').contains('Add').click();

    cy.contains('button', 'Add job roles').click();
    cy.addJobRoles(jobRolesToAdd);
    cy.updateJobRoleTotal(jobRolesToAdd, 'type');
    cy.contains('button', 'Save and return').click();

    cy.get('[data-testid="leavers"]').contains('Add').click();
    cy.contains(/No staff left on or after/).click();
    cy.contains('button', 'Save and return').click();

    cy.get('[data-testid="vacancies"]').contains('Add').click();
    cy.contains(/I do not know if/).click();
    cy.contains('button', 'Save and return').click();

    cy.get('app-alert span').should('contain', 'Starters, leavers and vacancy data added');

    onHomePage.clickTab('Workplace');
    onWorkplacePage.expectRow('starters').toHaveValue('2 x care worker');
    onWorkplacePage.expectRow('starters').toHaveValue('3 x registered nurse');
    onWorkplacePage.expectRow('leavers').toHaveValue('None');
    onWorkplacePage.expectRow('vacancies').toHaveValue('Not known');
  });
});
