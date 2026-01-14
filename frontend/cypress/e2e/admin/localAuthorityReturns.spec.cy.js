describe('Local authority returns page', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
    cy.get('a[href="/sfcadmin/local-authorities-return"]').click();
  });

  it('can be viewed', () => {
    cy.get('h2').should('contain', 'Local authority returns');
  });

  describe('Monitor returns page', () => {
    it('can be viewed', () => {
      cy.contains('Monitor returns').click();
      cy.get('h2').should('contain', 'Monitor returns');
    });
  });

  describe('Set start and end dates page', () => {
    it('can be viewed', () => {
      cy.contains('Set start and end dates').click();
      cy.get('h1').should('contain', 'Set start and end dates');
    });
  });

  describe('Status summary page', () => {
    it('can be viewed', () => {
      cy.contains('Status summary').click();
      cy.get('h2').should('contain', 'Status summary');
    });
  });
});
