import { SubEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForPayAndPensionsMiniFlow } from './runTestsForPayAndPensionsMiniFlow';

describe('Pay and pensions mini flow from home summary flag', { tags: '@payAndPensions' }, () => {
  beforeEach(() => {
    cy.loginAsUser(SubEstablishment.editUserLoginName, Cypress.env('userPassword'));

    cy.url().should('contain', 'dashboard');
    cy.get('h1').should('contain', SubEstablishment.name);
  });

  runTestsForPayAndPensionsMiniFlow(SubEstablishment);
});
