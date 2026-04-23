import { StandAloneEstablishment } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';
describe('Fast Track Pay Updates flow', () => {
  const workplaceUid = '123';

  beforeEach(() => {
    cy.loginAsUser(StandAloneEstablishment.editUserLoginName, Cypress.env('userPassword'));
    cy.insertTestWorker({
      establishmentID: StandAloneEstablishment.id,
      workerName: 'Care worker',
    });

    cy.intercept('GET', '**/api/establishment/*/worker/groupedByJobRole', {
      statusCode: 200,
      body: {
        groups: [
          {
            jobId: 1,
            title: 'Care worker',
            count: 2,
            workers: [{ uid: '1' }, { uid: '2' }],
            annualHourlyPay: { value: null, rate: null },
          },
        ],
      },
    }).as('getWorkers');

    cy.intercept('PUT', '**/api/establishment/*/workers', {
      statusCode: 200,
      body: {},
    }).as('updateWorkers');

    onHomePage.clickTab('Staff records');

    cy.contains('Update pay for multiple staff').click();

    //  cy.visit(`/workplace/${workplaceUid}/staff-record/fast-track-pay-updates`);

    // cy.wait('@getWorkers');

    // cy.get('[data-testid="amount-input-box-0"]').should('exist');
  });

  // it('should complete full pay update journey', () => {
  //   cy.get('[data-testid="amount-input-box-0"]').type('10');
  //   cy.get('[data-testid="hourly-radio-0"]').check();

  //   cy.contains('button', 'Continue').click();

  //   cy.url().should('include', 'fast-track-confirmation-page');

  //   cy.contains('Care worker').should('exist');

  //   cy.contains('button', 'Save and return').click();

  //   cy.wait('@updateWorkers').then((interception) => {
  //     const body = interception.request.body;

  //     expect(body).to.be.an('array');
  //     expect(body[0].annualHourlyPay.rate).to.equal(10);
  //   });

  //   cy.url().should('include', 'update-pay-for-multiple-staff');

  //   cy.contains('Pay updated in').should('exist');
  // });
});
