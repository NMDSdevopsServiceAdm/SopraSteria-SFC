import { ParentEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForDHAHomeTabFlag } from './runTestsForDHAHomeTabFlag';

describe('Delegated healthcare activities journey from home tab flag', { tags: '@dha' }, () => {
  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, Cypress.env('userPassword'));

    cy.url().should('contain', 'dashboard');
    cy.get('h1').should('contain', ParentEstablishment.name);
  });

  runTestsForDHAHomeTabFlag(ParentEstablishment);
});
