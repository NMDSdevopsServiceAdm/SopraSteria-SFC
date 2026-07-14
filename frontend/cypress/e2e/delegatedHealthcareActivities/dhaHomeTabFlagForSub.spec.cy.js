import { SubEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForDHAHomeTabFlag } from './runTestsForDHAHomeTabFlag';
import { userPassword } from '../../support/configData';

describe('Delegated healthcare activities journey from home tab flag', { tags: '@dha' }, () => {
  beforeEach(() => {
    cy.loginAsUser(SubEstablishment.editUserLoginName, userPassword);

    cy.url().should('contain', 'dashboard');
    cy.get('h1').should('contain', SubEstablishment.name);
  });

  runTestsForDHAHomeTabFlag(SubEstablishment);
});
