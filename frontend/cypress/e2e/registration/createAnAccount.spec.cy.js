import { MockNewEstablishment } from '../../support/mockEstablishmentData';
import {
  approveRegistrationRequestAsAdmin,
  fillInAddress,
  inputLocationOrPostcode,
} from '../../support/page_objects/createNewWorkplaceForms';
import { onHomePage } from '../../support/page_objects/onHomePage';
import { fillUserRegistrationForm } from '../../support/page_objects/userRegistrationForms';

/* eslint-disable no-undef */
/// <reference types="cypress" />

describe('Create account', () => {
  const userFullName = 'Test new workplace primary user for cypress';
  const loginId = 'cypress-test-user-0001';
  const mockPassword = 'Some-very-super-strong-p@ssw0rd';
  const workplaceName = 'Test workplace for cypress';

  before(() => {
    cy.deleteTestUserFromDb(userFullName);
    cy.deleteTestWorkplaceFromDb(workplaceName);
  });

  after(() => {
    cy.deleteTestUserFromDb(userFullName);
    cy.deleteTestWorkplaceFromDb(workplaceName);
  });

  beforeEach(() => {
    cy.visit('/');
  });

  it('should show the create acount start page', () => {
    cy.contains('Create an account').click({ force: true });
    cy.location('pathname').should('eq', '/registration/create-account');
    cy.get('[data-cy="account-heading"]').should('contain', 'Create an Adult Social Care Workforce Data Set account');
    cy.contains('Start now').click({ force: true });
    cy.location('pathname').should('eq', '/registration/regulated-by-cqc');
    cy.get('[data-cy="cqc-heading"]').should(
      'contain',
      'Is the main service you provide regulated by the Care Quality Commission?',
    );
    cy.go('back').then(() => {
      cy.contains('Start now').click({ force: true });

      cy.location('pathname').should('eq', '/registration/regulated-by-cqc');
    });

    cy.get('[data-testid="continueButton"]').click();
    cy.get('[data-cy="cqc-error"]').should(
      'contain',
      'Select yes if the main service you provide is regulated by the Care Quality Commission',
    );
    cy.get('[data-cy="error-summary"]').should('be.visible');
    cy.get('[data-cy="error-summary"]').should(
      'contain',
      'Select yes if the main service you provide is regulated by the Care Quality Commission',
    );
  });

  it.only('should be able to create a new account', () => {
    cy.contains('Create an account').click();
    cy.contains('Start now').click();
    cy.get('button').contains('Continue').click();

    // regulated by cqc
    cy.getByLabel('Yes').check();
    cy.get('button').contains('Continue').click();

    inputLocationOrPostcode(MockNewEstablishment.address.postcode);

    fillInAddress(MockNewEstablishment.name, MockNewEstablishment.address);

    // Employer type
    cy.getByLabel('Voluntary, charity, not for profit').check();
    cy.get('button').contains('Continue').click();

    // Main service
    cy.getByLabel('Domiciliary care services').check();
    cy.get('button').contains('Continue').click();

    // Number of staff
    cy.getByLabel('Number of staff').type(5);
    cy.get('button').contains('Continue').click();

    // Main user info
    cy.getByLabel('Full name').type(userFullName);
    cy.getByLabel('Job title').type('Manager');
    cy.getByLabel('Email address').type('test@example.com');
    cy.getByLabel('Phone number').type('0123456789');
    cy.get('button').contains('Continue').click();

    fillUserRegistrationForm({ username: loginId, password: mockPassword });

    cy.get('input#termsAndConditions').check();

    cy.get('button').contains('Submit details').click();

    cy.get('span').contains('Your account is now being checked by Skills for Care').should('be.visible');

    // try login as the new user
    cy.loginAsUser(loginId, mockPassword);
    cy.contains('Your registration request is awaiting approval').should('be.visible');

    // approve the registration request
    approveRegistrationRequestAsAdmin(workplaceName);

    // try login again as the new user
    cy.loginAsUser(loginId, mockPassword);
    cy.get('h1').contains('Welcome to your new account').should('be.visible');
    cy.getByLabel('No, I want to start adding data').check();
    cy.get('button').contains('Continue').click();

    cy.get('h1').contains('Test workplace for cypress').should('be.visible');
    onHomePage.allTabs('edit');

    cy.contains('Add more details to your workplace').click(); // on home page
    cy.contains('Start to add more details about your workplace').click(); // on workplace tab
    cy.get('button').contains('Continue').click(); // on add more details page

    // Other services
    cy.contains('Do you provide any other services?');
    cy.getByLabel('No').check();
    cy.get('button').contains('Save and continue').click();

    // Capacity of your services
    cy.getByLabel('Number of people using the service at the moment').type('12');
    cy.get('button').contains('Save and continue').click();

    // Who are your service users?
    cy.contains('Who are your service users?');
    cy.getByLabel('Older people with dementia').check();
    cy.get('button').contains('Save and continue').click();

    // Do you have any current staff vacancies?
    cy.getByLabel('Yes').check();
    cy.get('button').contains('Save and continue').click();

    // Select job roles for the vacancies
    cy.contains('Care providing roles').click();
    cy.getByLabel('Care worker').check();
    cy.get('button').contains('Save and continue').click();

    // How many current staff vacancies do you have?
    cy.get('button').contains('Save and continue').click();

    // Have you had any starters SINCE...
    cy.getByLabel('No').check();
    cy.get('button').contains('Save and continue').click();

    // Have you had any leavers SINCE...
    cy.getByLabel('I do not know').check();
    cy.get('button').contains('Save and continue').click();

    // Repeat training
    cy.getByLabel('Yes, always').check();
    cy.get('button').contains('Save and continue').click();

    // Would you accept a Care Certificate...
    cy.getByLabel('No, never').check();
    cy.get('button').contains('Save and continue').click();

    // Cash loyalty bonus
    cy.getByLabel('Yes').check();
    cy.getByLabel('Amount (optional)').type('300.00');
    cy.get('button').contains('Save and continue').click();

    // Statutory Sick Pay
    cy.getByLabel('No').check();
    cy.get('button').contains('Save and continue').click();

    // Workplace pensions
    cy.getByLabel('Yes').check();
    cy.get('button').contains('Save and continue').click();

    // How many days leave
    cy.getByLabel('Number of days').type(25);
    cy.get('button').contains('Save and continue').click();

    // Share your data
    cy.getByLabel('Yes, I agree to you sharing our data with the CQC').check();
    cy.getByLabel('Yes, I agree to you sharing our data with local authorities').check();
    cy.get('button').contains('Save and continue').click();

    // Check answers
    cy.contains('Check these details before you confirm them.').should('be.visible');
  });
});
