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
    cy.openLoginPage();
  });

  it('should show the create account start page', () => {
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

  it('should be able to create a new account', () => {
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
    cy.loginAsUserBeforeApproval(loginId, mockPassword);
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

    // carry out delegated healthcare activities
    cy.contains('Do your non-nursing staff carry out delegated healthcare activities?');
    cy.getByLabel('Yes').check();
    cy.get('button').contains('Save and continue').click();

    // what kind of delegated healthcare activities
    cy.contains('What kind of delegated healthcare activities do your non-nursing staff carry out?');
    cy.getByLabel('Vital signs monitoring').check();
    cy.getByLabel('Airways and breathing care').check();
    cy.getByLabel('Feeding and digestive care').check();
    cy.get('button').contains('Save and continue').click();

    // Vacancies
    cy.get('h1').contains('Do you have any current staff vacancies?');
    cy.getByLabel('Yes').check();
    cy.get('button').contains('Save and continue').click();

    cy.get('h1').contains('Select job roles for the vacancies you want to add');
    cy.contains('button', 'Show all job roles').click();
    cy.getByLabel('Care worker').check();
    cy.getByLabel('Community support and outreach work').check();
    cy.get('button').contains('Save and continue').click();

    cy.get('h1').contains('How many current staff vacancies do you have?');
    cy.getByLabel('Care worker').type('2');
    cy.getByLabel('Community support and outreach work').type('2');
    cy.get('button').contains('Save and continue').click();

    // Starters
    cy.get('h1').contains('Have you had any starters');
    cy.getByLabel('Yes').check();
    cy.get('button').contains('Save and continue').click();

    cy.get('h1').contains('Select job roles for the starters you want to add');
    cy.contains('button', 'Show all job roles').click();
    cy.getByLabel('Nursing assistant').check();
    cy.getByLabel('Registered nurse').check();
    cy.get('button').contains('Save and continue').click();

    cy.get('h1').contains('How many starters have you had');
    cy.getByLabel('Nursing assistant').type('2');
    cy.getByLabel('Registered nurse').type('2');
    cy.get('button').contains('Save and continue').click();

    // Leavers
    cy.get('h1').contains('Have you had any leavers');
    cy.getByLabel('Yes').check();
    cy.get('button').contains('Save and continue').click();

    cy.get('h1').contains('Select job roles for the leavers you want to add');
    cy.contains('button', 'Show all job roles').click();
    cy.getByLabel('Team leader').check();
    cy.getByLabel('Support worker').check();
    cy.get('button').contains('Save and continue').click();

    cy.get('h1').contains('How many leavers have you had');
    cy.getByLabel('Team leader').type('2');
    cy.getByLabel('Support worker').type('2');
    cy.get('button').contains('Save and continue').click();

    // Repeat training
    cy.contains("Do new care workers have to repeat training they've done with previous employers?");
    cy.getByLabel('Yes, always').check();
    cy.get('button').contains('Save and continue').click();

    // Would you accept a Care Certificate...
    cy.contains("Would you accept a Care Certificate from a worker's previous employer?");
    cy.getByLabel('No, never').check();
    cy.get('button').contains('Save and continue').click();

    // Care workforce pathway aware
    cy.contains('How aware of the care workforce pathway is your workplace?');
    cy.getByLabel('Aware of how the care workforce pathway works in practice').check();
    cy.get('button').contains('Save and continue').click();

    // Using the care workforce pathway
    cy.contains('Is your workplace using the care workforce pathway?');
    cy.getByLabel('No, we do not currently use the pathway').check();
    cy.get('button').contains('Save and continue').click();

    // Cash loyalty bonus
    cy.contains('Do you pay care workers a cash loyalty bonus within their first 2 years of employment?');
    cy.getByLabel('Yes').check();
    cy.getByLabel('Amount (optional)').type('300.00');
    cy.get('button').contains('Save and continue').click();

    // Statutory Sick Pay
    cy.contains('Do you pay your care workers more than Statutory Sick Pay if they cannot work because of illness?');
    cy.getByLabel('No').check();
    cy.get('button').contains('Save and continue').click();

    // Workplace pensions
    cy.contains('Do you contribute more than the minimum 3% into workplace pensions for your care workers?');
    cy.getByLabel('Yes').check();
    cy.get('button').contains('Save and continue').click();

    // How many days leave
    cy.contains('How many days leave do your full-time care workers get each year?');
    cy.getByLabel('Number of days').type(25);
    cy.get('button').contains('Save and continue').click();

    // Share your data
    cy.getByLabel('Yes, I agree to you sharing our data with the CQC').check();
    cy.getByLabel('Yes, I agree to you sharing our data with local authorities').check();
    cy.get('button').contains('Save and continue').click();

    // Check answers
    cy.contains('Workplace summary').should('be.visible');
    cy.contains(workplaceName).should('be.visible');
    cy.contains('Check these details before you confirm them.').should('be.visible');
    cy.get('button').contains('Confirm workplace details').click();

    // Workplace tab
    cy.contains(workplaceName).should('be.visible');
    cy.contains("You've confirmed the workplace details that you added").should('be.visible');
  });
});
