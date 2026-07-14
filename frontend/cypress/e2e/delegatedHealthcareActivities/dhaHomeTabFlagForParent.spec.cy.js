import { ParentEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForDHAHomeTabFlag } from './runTestsForDHAHomeTabFlag';
import { userPassword } from '../../support/configData';

describe('Delegated healthcare activities journey from home tab flag', { tags: '@dha' }, () => {
  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, userPassword);

    cy.url().should('contain', 'dashboard');
    cy.get('h1').should('contain', ParentEstablishment.name);
  });

  runTestsForDHAHomeTabFlag(ParentEstablishment);
});
