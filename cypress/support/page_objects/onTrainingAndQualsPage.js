/* eslint-disable no-undef */
/// <reference types="cypress" />

export class TrainingAndQualsPage {
    sectionsAreVisible() {
        cy.get('[data-testid="trainingLinkPanel"]').should('exist');
        cy.get('[data-testid="trainingInfoPanel"]').should('exist');
        cy.get('[data-testid="trainingAndQualsSummary"]').should('exist');
    }
}

export const onTrainingAndQualsPage = new TrainingAndQualsPage();