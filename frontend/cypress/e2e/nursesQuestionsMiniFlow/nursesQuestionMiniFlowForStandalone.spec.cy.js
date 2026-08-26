import { userPassword } from '../../support/configData';
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForNursesQuestionsMiniFlow } from './runTestForNursesQuestionsMiniFlow';

describe('Nurse question mini flow from home tab update banner', { tags: '@staffRecords' }, () => {
  beforeEach(() => {
    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, userPassword);

    cy.url().should('contain', 'dashboard');
    cy.get('h1').should('contain', StandAloneEstablishment.name);
  });

  runTestsForNursesQuestionsMiniFlow(StandAloneEstablishment);
});
