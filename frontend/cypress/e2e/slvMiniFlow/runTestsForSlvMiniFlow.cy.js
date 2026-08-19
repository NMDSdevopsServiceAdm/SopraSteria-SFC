import { SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';
import { onWorkplacePage } from '../../support/page_objects/onWorkplacePage';

export const runTestsForSLVMiniFlow = (mockEstablishmentData) => {
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

  describe('Add Starters Leavers Vacancies mini flow from home summary flag', { tags: '@workplace' }, () => {
    before(() => {
      cy.resetStartersLeaversVacancies(mockEstablishmentData.id);
    });

    it(
      'should show a message to guide user to a mini flow for adding starters leavers vacancies',
      { tags: '@workplace' },
      () => {
        if (mockEstablishmentData.id === SubEstablishmentNotDataOwner.id) {
          cy.get('app-navigate-to-workplace-dropdown select').select(mockEstablishmentData.name);
          cy.url().should('contain', 'subsidiary');
        }

        cy.get('h1').should('contain', mockEstablishmentData.name);

        cy.get('[data-testid="summaryBox"]').contains('Add your starters, leavers and vacancy data').click();
        cy.get('h1').should('contain.text', 'Add your starters, leavers and vacancy data');

        cy.get('[data-testid="starters"]').contains('Add').click();

        cy.contains('button', 'Select job roles').click();
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
      },
    );
  });

  describe('Update Starters Leavers Vacancies mini flow from home summary flag', { tags: '@workplace' }, () => {
    before(() => {
      cy.resetStartersLeaversVacancies(mockEstablishmentData.id);
      cy.insertDummyAnswerForStartersLeaversVacancies(mockEstablishmentData.id);
    });

    it('should show a message to guide user to a mini flow to update starters leavers vacancies', () => {
      if (mockEstablishmentData.id === SubEstablishmentNotDataOwner.id) {
        cy.get('app-navigate-to-workplace-dropdown select').select(mockEstablishmentData.name);
        cy.url().should('contain', 'subsidiary');
      }

      cy.get('h1').should('contain', mockEstablishmentData.name);

      cy.get('[data-testid="summaryBox"]').contains('Update your starters, leavers and vacancy data').click();
      cy.get('h1').should('contain.text', 'Update your starters, leavers and vacancy data');

      cy.get('[data-testid="starters"]').contains('Review and confirm').click();

      // TODO: get the button with correct text "Select job roles" when merged with related branch
      // cy.contains('button', 'Select job roles').click();
      cy.contains('button', /job roles/).click();

      cy.addJobRoles(jobRolesToAdd);
      cy.updateJobRoleTotal(jobRolesToAdd, 'type');
      cy.contains('button', 'Save and return').click();

      cy.get('[data-testid="leavers"]').contains('Review and confirm').click();
      cy.contains(/No staff left on or after/).click();
      cy.contains('button', 'Save and return').click();

      cy.get('[data-testid="vacancies"]').contains('Review and confirm').click();
      cy.contains(/I do not know if/).click();
      cy.contains('button', 'Save and return').click();

      cy.get('app-alert span').should('contain', 'Starters, leavers and vacancy information saved');

      onHomePage.clickTab('Workplace');
      onWorkplacePage.expectRow('starters').toHaveValue('2 x care worker');
      onWorkplacePage.expectRow('starters').toHaveValue('3 x registered nurse');
      onWorkplacePage.expectRow('leavers').toHaveValue('None');
      onWorkplacePage.expectRow('vacancies').toHaveValue('Not known');
    });
  });
};
