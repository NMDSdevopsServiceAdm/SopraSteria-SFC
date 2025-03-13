/* eslint-disable no-undef */
/// <reference types="cypress" />
import { SubEstablishment } from '../../../support/establishmentData';
import { onHomePage } from '../../../support/page_objects/onHomePage';

describe('Sub home page as read only user', () => {
  before(() => {
    cy.wait(2000);
  });

  beforeEach(() => {
    cy.loginAsUser(Cypress.env('readOnlySubUser'), Cypress.env('userPassword'));
  });

  it('should see the sub establishment home page', () => {
    cy.contains(SubEstablishment.parentName);
    cy.contains(SubEstablishment.name);
  });

  it('should show all tabs', () => {
    onHomePage.allTabs('read');
  });

  it('should show funding data link', () => {
    cy.get('[data-cy="cards-and-links"]').should('contain', 'Does your data meet funding requirements?');
  });

  it('should not show bulk upload link', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Bulk upload your data');
  });

  it('should not show remove link to parent organisation', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Remove the link to your parent workplace');
  });

  it('should not show set data permissions', () => {
    cy.get('[data-cy="home-other-links"]').should('not.contain', 'Set data permissions');
  });
});
