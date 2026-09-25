/* eslint-disable no-undef */
/// <reference types="cypress" />
import { userPassword } from '../../support/configData';
import { StandAloneEstablishment } from '../../support/mockEstablishmentData';

describe('Become a parent', { tags: '@parent' }, () => {
  beforeEach(() => {
    cy.clearLinkToParentRequests();
    cy.resetBecomeAParentRequest(StandAloneEstablishment.id);
  });

  afterEach(() => {
    cy.resetBecomeAParentRequest(StandAloneEstablishment.id);
  });

  it('should request to become a parent and have the request rejected', () => {
    cy.intercept('POST', 'api/logout').as('logout');

    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, userPassword);

    cy.contains('a', "Become a parent and manage other workplaces' data").click();
    cy.contains('h1', "Become a parent and manage other workplaces' data").should('be.visible');

    cy.contains('button', 'Send parent request').click();

    cy.get('[data-testid="generic_alert"]')
      .contains('You’ve sent a request to become a parent workplace')
      .should('be.visible');

    cy.contains("Become a parent and manage other workplaces' data (request pending)").should('be.visible');

    // Sign out as the workplace user and review the request as admin
    cy.get('a').contains('Sign out').click({ force: true });
    cy.wait('@logout');

    cy.loginAsAdmin();

    cy.contains('a', 'Parent requests').click();
    cy.contains('h2', 'Parent requests').should('be.visible');

    cy.contains('a', StandAloneEstablishment.name).click();
    cy.contains('h2', `Parent request: ${StandAloneEstablishment.name}`).should('be.visible');

    cy.contains('button', 'Reject').click();

    // Sign back in as the workplace user and verify the rejected state
    cy.get('a').contains('Sign out').click({ force: true });

    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, userPassword);

    cy.contains("Become a parent and manage other workplaces' data (request pending)").should('not.exist');

    cy.contains('a', "Become a parent and manage other workplaces' data").should('be.visible');
  });

  it('should request to become a parent and have the request approved', () => {
    cy.intercept('POST', 'api/logout').as('logout');

    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, userPassword);

    cy.contains('a', "Become a parent and manage other workplaces' data").click();
    cy.contains('h1', "Become a parent and manage other workplaces' data").should('be.visible');

    cy.contains('button', 'Send parent request').click();

    cy.get('[data-testid="generic_alert"]')
      .contains('You’ve sent a request to become a parent workplace')
      .should('be.visible');

    cy.contains("Become a parent and manage other workplaces' data (request pending)").should('be.visible');

    // Sign out as the workplace user and approve the request as admin
    cy.get('a').contains('Sign out').click({ force: true });
    cy.wait('@logout');

    cy.loginAsAdmin();

    cy.contains('a', 'Parent requests').click();
    cy.contains('h2', 'Parent requests').should('be.visible');

    cy.contains('a', StandAloneEstablishment.name).click();
    cy.contains('h2', `Parent request: ${StandAloneEstablishment.name}`).should('be.visible');

    cy.intercept('POST', '**/api/admin/parent-approval').as('approveParent');

    cy.contains('button', 'Approve').click();

    cy.get('[role="dialog"]').should('be.visible').contains('button', 'Approve this request').click();

    cy.wait('@approveParent').its('response.statusCode').should('eq', 200);

    cy.checkBecomeAParentApproved(StandAloneEstablishment.id);

    cy.get('a').contains('Sign out').click({ force: true });

    Cypress.session.clearAllSavedSessions();

    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, userPassword);
    cy.visitDashboardTab('home');

    cy.contains("Become a parent and manage other workplaces' data (request pending)").should('not.exist');

    cy.get('[data-testid="parentApprovedBanner"]')
      .should('be.visible')
      .and('contain', 'Your request to become a parent has been approved');
  });
});
