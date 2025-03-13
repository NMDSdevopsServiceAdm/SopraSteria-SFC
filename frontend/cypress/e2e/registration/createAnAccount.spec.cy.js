import { fillUserRegistrationForm } from '../../support/page_objects/userRegistrationForms';
import { onHomePage } from '../../support/page_objects/onHomePage';
import { MockNewEstablishment } from '../../support/mockEstablishmentData';
import {
  inputLocationOrPostcode,
  fillInAddress,
  approveRegistrationRequestAsAdmin,
} from '../../support/page_objects/createNewWorkplaceForms';

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
  });
});
