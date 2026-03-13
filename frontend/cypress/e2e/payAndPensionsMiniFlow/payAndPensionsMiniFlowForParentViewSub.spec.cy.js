import { ParentEstablishment, SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { runTestsForPayAndPensionsMiniFlow } from './runTestsForPayAndPensionsMiniFlow';

describe('Pay and pensions mini flow from home summary flag', { tags: '@payAndPensions' }, () => {
  const subsidaryToView = SubEstablishmentNotDataOwner;

  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, Cypress.env('userPassword'));

    cy.get('app-navigate-to-workplace-dropdown select').select(subsidaryToView.name);

    cy.url().should('contain', 'subsidiary');
    cy.get('h1').should('contain', subsidaryToView.name);
  });

  runTestsForPayAndPensionsMiniFlow(subsidaryToView);
});
