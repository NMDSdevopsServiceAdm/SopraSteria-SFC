import { onHomePage } from '../../support/page_objects/onHomePage';

export const runTestsForPayAndPensionsMiniFlow = (mockEstablishmentData) => {
  const establishmentId = mockEstablishmentData.id;
  const payAndPensionFlagMessage = "We've added some Workplace questions";

  const mainServiceWithPayAndPensionGroup1 = { id: 20, name: 'Domiciliary care services' };
  const mainServiceWithPayAndPensionGroup2 = { id: 7, name: 'Short breaks, respite care' };
  const mainServiceWithPayAndPensionGroup3 = { id: 9, name: 'Day care and day services' };

  describe('pay and pensions', () => {
    describe('main service with payAndPensionGroup as 2', () => {
      before(() => {
        cy.resetPayAndPensionWorkplaceQuestions(establishmentId);
        cy.setWorkplaceMainService(establishmentId, mainServiceWithPayAndPensionGroup2.id);
        cy.reload();
      });

      after(() => {
        cy.resetPayAndPensionWorkplaceQuestions(establishmentId);
      });

      it('should show a flag for the new workplace questions in the home page summary panel', () => {
        cy.get('[data-testid="workplace-row"]').should('contain', payAndPensionFlagMessage);
      });

      it('should direct users to the new questions and go through the flow', () => {
        cy.get('[data-testid="workplace-row"]').should('contain', payAndPensionFlagMessage).click();

        //pension contribution
        cy.get('h1').should(
          'contain',
          'Does your company contribute more than the minimum 3% into workplace pensions for care and support workers?',
        );

        cy.getByLabel('Yes').click();
        cy.get('button').contains('Save and continue').click();

        //opt out of pensions
        cy.get('h1').should('contain', 'Are any of your staff currently opted out of their workplace pension?');

        cy.getByLabel('Yes').click();
        cy.get('button').contains('Save and continue').click();

        //sleep ins
        cy.get('h1').should('contain', 'Does your workplace offer sleep-ins?');

        cy.getByLabel('Yes').click();
        cy.get('button').contains('Save and continue').click();

        //pay for sleep ins
        cy.get('h1').should('contain', 'How do you pay care and support workers for a sleep-in?');

        cy.getByLabel('Hourly rate').click();
        cy.get('button').contains('Save and continue').click();

        //home
        cy.get(`[data-testid="generic_alert"]`).contains('Your information has been saved in Workplace');
        cy.get('[data-testid="workplace-row"]').should('not.contain', payAndPensionFlagMessage);
      });
    });

    describe('main service with payAndPensionGroup as 3', () => {
      before(() => {
        cy.resetPayAndPensionWorkplaceQuestions(establishmentId);
        cy.setWorkplaceMainService(establishmentId, mainServiceWithPayAndPensionGroup3.id);
        cy.reload();
      });

      after(() => {
        cy.resetPayAndPensionWorkplaceQuestions(establishmentId);
      });

      it('should not show a flag for the new workplace questions in the home page summary panel', () => {
        cy.get('[data-testid="workplace-row"]').should('not.contain', payAndPensionFlagMessage);
      });
    });
  });
};
