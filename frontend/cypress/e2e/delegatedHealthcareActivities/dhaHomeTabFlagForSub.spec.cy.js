import { SubEstablishment } from '../../support/mockEstablishmentData';
import { runTestsForDHAHomeTabFlag } from './runTestsForDHAHomeTabFlag';

describe('Delegated healthcare activities journey from home tab flag', () => {
  beforeEach(() => {
    cy.loginAsUser(SubEstablishment.editUserLoginName, Cypress.env('userPassword'));

    cy.url().should('contain', 'dashboard#home');
    cy.get('h1').should('contain', SubEstablishment.name);
  });

  runTestsForDHAHomeTabFlag(SubEstablishment);
});
