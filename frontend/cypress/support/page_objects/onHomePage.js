/* eslint-disable no-undef */
/// <reference types="cypress" />

export class HomePage {
  allTabs(userRole = 'edit') {
    if (userRole === 'edit') {
      cy.get('[data-cy="tab-list"]').contains('Staff records');
      cy.get('[data-cy="tab-list"]').contains('Training and qualifications');
    } else {
      cy.get('[data-cy="tab-list"]').contains('Staff records').should('not.exist');
      cy.get('[data-cy="tab-list"]').contains('Training and qualifications').should('not.exist');
    }
    cy.get('[data-cy="tab-list"]').contains('Home');
    cy.get('[data-cy="tab-list"]').contains('Workplace');
    cy.get('[data-cy="tab-list"]').contains('Benchmarks');
  }

  clickTab(tab) {
    cy.get('[data-cy="tab-list"]').contains(tab).click();
  }

  cards() {
    cy.get('[data-cy="cards-and-links"]').should('contain', 'Does your data meet funding requirements?');
    cy.get('[data-cy="cards-and-links"]').should('contain', 'See how you compare against other workplaces');
  }

  otherLinksDefault() {
    cy.get('[data-cy="home-other-links"]').should('contain', 'View the ASC-WDS Benefits Bundle');
    cy.get('[data-cy="home-other-links"]').should('contain', 'Get your ASC-WDS certificate');
    cy.get('[data-cy="home-other-links"]').should('contain', 'About ASC-WDS');
  }
}

export const onHomePage = new HomePage();
