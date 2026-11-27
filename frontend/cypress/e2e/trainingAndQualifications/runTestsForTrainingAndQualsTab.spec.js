import { ParentEstablishment } from '../../support/mockEstablishmentData';

export const runTestsForTrainingAndQualsTab = (mockEstablishmentData) => {
  describe('Training and qualifications tab', () => {
    it('should show the training and qualifications page', () => {
      cy.get('a').contains('Manage training and qualification records').should('be.visible');
      cy.get('a').contains('Build and manage your list of courses').should('be.visible');
      cy.get('a').contains('Add multiple training records').should('be.visible');
      cy.get('a').contains('Set mandatory training categories').should('be.visible');
      cy.get('a').contains('Change when expiry alerts appear').should('be.visible');

      cy.get('a').contains('Manage training and qualification records').click();

      cy.url().should('contains', 'manage-training-and-qualification-records');
      cy.get('[data-testid="trainingAndQualsSummary"]').should('exist');
      cy.contains('Download training report');

      if (mockEstablishmentData.id === ParentEstablishment.id) {
        cy.contains('Download parent training report');
      }
    });

    describe('"Add and manage training" sub-menu after the button has been clicked', () => {
      it('should show the "Add multiple training records" item with the correct link', () => {
        cy.contains('Add multiple training records').click();
        cy.url().should('include', 'add-multiple-training/select-staff');
        cy.get('span').should('contain', 'Add multiple training records');
      });

      it('should show the "Build and manage your list of courses" item', () => {
        cy.contains('Build and manage your list of courses').click();
        cy.get('h1').should('contain', 'Add and manage training courses');
      });

      it('should show the "Set mandatory training categories" item with the correct link', () => {
        cy.contains('Set mandatory training categories').click();
        cy.url().should('include', 'add-and-manage-mandatory-training');
        cy.get('span').should('contain', 'Add a mandatory training category');
      });

      it('should show the "Change when expiry alerts appear" item with the correct link', () => {
        cy.contains('Change when expiry alerts appear').click();
        cy.url().should('include', 'change-expires-soon-alerts');
        cy.get('h1').should('contain', 'Manage expiry alerts');
      });
    });
  });
};
