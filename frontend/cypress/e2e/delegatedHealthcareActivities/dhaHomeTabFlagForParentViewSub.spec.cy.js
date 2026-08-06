import { ParentEstablishment, SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { runTestsForDHAHomeTabFlag } from './runTestsForDHAHomeTabFlag';
import { userPassword } from '../../support/configData';

describe('Delegated healthcare activities journey from home tab flag', { tags: '@dha' }, () => {
  const subsidaryToView = SubEstablishmentNotDataOwner;

  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, userPassword);

    cy.get('app-navigate-to-workplace-dropdown select').select(subsidaryToView.name);

    cy.url().should('contain', 'subsidiary');
    cy.get('h1').should('contain', subsidaryToView.name);
  });

  runTestsForDHAHomeTabFlag(subsidaryToView);
});
