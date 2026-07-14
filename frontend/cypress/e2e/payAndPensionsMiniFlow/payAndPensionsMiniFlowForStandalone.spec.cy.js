import { userPassword } from '../../support/configData';
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForPayAndPensionsMiniFlow } from './runTestsForPayAndPensionsMiniFlow';

describe('Pay and pensions mini flow from home summary flag', { tags: '@payAndPensions' }, () => {
  beforeEach(() => {
    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, userPassword);

    cy.url().should('contain', 'dashboard');
    cy.get('h1').should('contain', StandAloneEstablishment.name);
  });

  runTestsForPayAndPensionsMiniFlow(StandAloneEstablishment);
});
