import { userPassword } from '../../support/configData';

const { StandAloneEstablishment } = require('../../support/mockEstablishmentData');
const { onHomePage } = require('../../support/page_objects/onHomePage');

describe('update user permissions', { tags: '@registration' }, () => {
  const editToReadUser = {
    fullname: 'Mock user edit to read',
    username: 'mock-user-edit-to-read',
    role: 'Edit',
  };

  const staffRecordsUser = {
    fullname: 'Mock user read with staff records',
    username: 'mock-user-read-staff-records',
    role: 'Edit',
  };

  const readToEditUser = {
    fullname: 'Mock user read to edit',
    username: 'mock-user-read-to-edit',
    role: 'Read',
  };

  const newPrimaryUser = {
    fullname: 'Mock user new primary',
    username: 'mock-user-new-primary',
    role: 'Edit',
  };

  beforeEach(() => {
    cy.deleteTestUserFromDb('Mock changed name');

    cy.loginAsUserFromFrontpage(StandAloneEstablishment.editUserLoginName, userPassword);
  });

  afterEach(() => {
    cy.deleteTestUserFromDb(editToReadUser.fullname);
    cy.deleteTestUserFromDb(staffRecordsUser.fullname);
    cy.deleteTestUserFromDb(readToEditUser.fullname);
    cy.deleteTestUserFromDb(newPrimaryUser.fullname);
  });

  describe('changing a users role', () => {
    it('should change an edit user to read only', () => {
      addTestUser(editToReadUser);

      goToPermissionsPage(editToReadUser.fullname);

      cy.getByLabel('Edit').should('be.checked');

      cy.getByLabel('Read only').check().should('be.checked');

      cy.contains('button', 'Continue').click();

      cy.get('h1').should('contain', 'User details');

      expectRow('Permissions').toHaveValue('Read only');
    });

    it('should change an edit user to read only with access to staff records', () => {
      addTestUser(staffRecordsUser);

      goToPermissionsPage(staffRecordsUser.fullname);

      cy.getByLabel('Edit').should('be.checked');

      cy.getByLabel('Read only').check().should('be.checked');

      cy.getByLabel('Also allow this user to view staff records (optional)')
        .check({ force: true })
        .should('be.checked');

      cy.contains('button', 'Continue').click();

      cy.get('h1').should('contain', 'User details');

      // Verify the updated user can access staff records
      cy.contains('a', 'Sign out').click();

      cy.loginAsUserFromFrontpage(staffRecordsUser.username, userPassword);

      onHomePage.clickTab('Staff records');

      cy.url().should('contain', 'dashboard#staff-records');
    });

    it('should change a read only user to edit', () => {
      addTestUser(readToEditUser);

      goToPermissionsPage(readToEditUser.fullname);

      cy.getByLabel('Read only').should('be.checked');

      cy.getByLabel('Edit').check().should('be.checked');

      cy.contains('button', 'Continue').click();

      cy.get('h1').should('contain', 'User details');

      expectRow('Permissions').toHaveValue('Edit');

      cy.contains('a', 'Sign out').click();

      cy.loginAsUserFromFrontpage(readToEditUser.username, userPassword);

      onHomePage.allTabs('edit');
    });
  });

  describe('changing the primary user', () => {
    it('should make an edit user the new primary user', () => {
      addTestUser(newPrimaryUser);

      goToPermissionsPage(newPrimaryUser.fullname);

      cy.getByLabel('Edit').should('be.checked');

      cy.getByLabel('Make primary user').check({ force: true }).should('be.checked');

      cy.contains('button', 'Continue').click();

      cy.get('h1').should('contain', 'User details');

      cy.contains(`${newPrimaryUser.fullname} is the new primary user`).should('be.visible');

      expectRow('Permissions').toHaveValue('Primary edit');
    });
  });

  const addTestUser = (user) => {
    cy.deleteTestUserFromDb(user.fullname);

    cy.addTestUser(user.fullname, user.username, StandAloneEstablishment.id, user.role);
  };

  const goToUser = (fullname) => {
    cy.contains('a', 'Users').click();

    cy.url().should('contain', '/users');
    cy.get('h1').should('contain', 'User');

    cy.contains('a', fullname).click();

    cy.get('h1').should('contain', 'User details');
  };

  const goToPermissionsPage = (fullname) => {
    goToUser(fullname);

    cy.contains('.govuk-summary-list__row', 'Permissions').within(() => {
      cy.contains('a', 'Change').click();
    });

    cy.url().should('contain', '/permissions');
    cy.get('h1').should('contain', 'Permissions');
    cy.contains(fullname).should('be.visible');
  };

  const expectRow = (rowKey) => {
    const toHaveValue = (expectedValue) => {
      cy.contains('.govuk-summary-list__key', rowKey)
        .siblings('.govuk-summary-list__value')
        .should('contain.text', expectedValue);
    };

    return { toHaveValue };
  };
});
