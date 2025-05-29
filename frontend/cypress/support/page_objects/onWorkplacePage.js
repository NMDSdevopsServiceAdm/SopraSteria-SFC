/* eslint-disable no-undef */
/// <reference types="cypress" />

export class WorkplacePage {
  allSectionsAreVisible() {
    cy.get('[data-testid="workplace-section"]').should('exist');
    cy.get('[data-testid="services-section"]').should('exist');
    cy.get('[data-testid="vacancies-and-turnover-section"]').should('exist');
    cy.get('[data-testid="recruitment-and-benefits-section"]').should('exist');
    cy.get('[data-testid="permissions-section"]').should('exist');
  }

  allSectionsAreChangeable() {
    if (
      cy.get('[data-testid="workplace-name-and-address"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="workplace-name-and-address"]').contains('Change');
    } else {
      cy.get('[data-testid="workplace-name-and-address"]').contains('Add');
    }

    if (
      cy.get('[data-testid="employerType"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="employerType"]').contains('Change');
    } else {
      cy.get('[data-testid="employerType"]').contains('Add');
    }

    if (
      cy.get('[data-testid="mainService"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="mainService"]').contains('Change');
    } else {
      cy.get('[data-testid="mainService"]').contains('Add');
    }

    if (
      cy.get('[data-testid="otherServices"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="otherServices"]').contains('Change');
    } else {
      cy.get('[data-testid="otherServices"]').contains('Add');
    }

    if (
      cy.get('[data-testid="serviceCapacity"]').within(() => {
        cy.get('.govuk-summary-list__value').should('not.equal', '-').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="serviceCapacity"]').contains('Change');
    } else {
      cy.get('[data-testid="serviceCapacity"]').contains('Add');
    }

    if (
      cy.get('[data-testid="serviceUsers"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="serviceUsers"]').contains('Change');
    } else {
      cy.get('[data-testid="serviceUsers"]').contains('Add');
    }

    if (
      cy.get('[data-testid="vacancies"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="vacancies"]').contains('Change');
    } else {
      cy.get('[data-testid="vacancies"]').contains('Add');
    }

    if (
      cy.get('[data-testid="starters"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="starters"]').contains('Change');
    } else {
      cy.get('[data-testid="starters"]').contains('Add');
    }

    if (
      cy.get('[data-testid="leavers"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="leavers"]').contains('Change');
    } else {
      cy.get('[data-testid="leavers"]').contains('Add');
    }

    if (
      cy.get('[data-testid="repeat-training"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="repeat-training"]').contains('Change');
    } else {
      cy.get('[data-testid="repeat-training"]').contains('Add');
    }

    if (
      cy.get('[data-testid="accept-care-certificate"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="accept-care-certificate"]').contains('Change');
    } else {
      cy.get('[data-testid="accept-care-certificate"]').contains('Add');
    }

    if (
      cy.get('[data-testid="cash-loyalty-bonus-spend"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="cash-loyalty-bonus-spend"]').contains('Change');
    } else {
      cy.get('[data-testid="cash-loyalty-bonus-spend"]').contains('Add');
    }

    if (
      cy.get('[data-testid="offer-more-than-statutory-sick-pay"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="offer-more-than-statutory-sick-pay"]').contains('Change');
    } else {
      cy.get('[data-testid="offer-more-than-statutory-sick-pay"]').contains('Add');
    }

    if (
      cy.get('[data-testid="higher-pension-contributions"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="higher-pension-contributions"]').contains('Change');
    } else {
      cy.get('[data-testid="higher-pension-contributions"]').contains('Add');
    }

    if (
      cy.get('[data-testid="number-of-days-leave"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="number-of-days-leave"]').contains('Change');
    } else {
      cy.get('[data-testid="number-of-days-leave"]').contains('Add');
    }

    if (
      cy.get('[data-testid="permissions-section"]').within(() => {
        cy.get('.govuk-summary-list__value').invoke('text').length;
      })
    ) {
      cy.get('[data-testid="permissions-section"]').contains('Change');
    } else {
      cy.get('[data-testid="permissions-section"]').contains('Add');
    }
  }
}

export const onWorkplacePage = new WorkplacePage();
