import { CWPAwarenessAnswers } from '../careWorkforcePathwayData';

export const answerCWPAwarenessQuestion = (answer = CWPAwarenessAnswers[0]) => {
  cy.get('h1').should('contain', 'How aware of the care workforce pathway is your workplace?');
  cy.getByLabel(answer.title).click();
  cy.get('button').contains(/Save/).click();
};

export const answerCWPUseQuestion = (use = 'Yes', reasons = [], otherReasonsText = '') => {
  cy.get('h1').should('contain', 'Is your workplace using the care workforce pathway?');
  cy.getByLabel(use).click();
  reasons.forEach((reason) => {
    cy.getByLabel(reason.text).click();
  });
  if (otherReasonsText) {
    cy.getByLabel(/Tell us/).type(otherReasonsText);
  }
  cy.get('button').contains(/Save/).click();
};
