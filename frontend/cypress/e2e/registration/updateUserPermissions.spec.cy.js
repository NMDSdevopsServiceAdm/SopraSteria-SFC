import { userPassword } from '../../support/configData';

const { StandAloneEstablishment } = require('../../support/mockEstablishmentData');
const { onHomePage } = require('../../support/page_objects/onHomePage');
describe('update user permissions', { tags: '@registration' }, () => {
  const mockUsers = [
    {
      fullname: 'Mock user edit to read',
      username: 'mock-user-edit-to-read',
      role: 'Edit',
    },
    {
      fullname: 'Mock user read with staff records',
      username: 'mock-user-read-staff-records',
      role: 'Edit',
    },
    {
      fullname: 'Mock user read to edit',
      username: 'mock-user-read-to-edit',
      role: 'Read',
    },
    {
      fullname: 'Mock user new primary',
      username: 'mock-user-new-primary',
      role: 'Edit',
    },
  ];

  const editToReadUser = mockUsers[0];
  const staffRecordsUser = mockUsers[1];
  const readToEditUser = mockUsers[2];
  const newPrimaryUser = mockUsers[3];

  before(() => {
    mockUsers.forEach((mockUser) => {
      cy.deleteTestUserFromDb(mockUser.fullname);
      cy.addTestUser(mockUser.fullname, mockUser.username, StandAloneEstablishment.id, mockUser.role);
    });
  });

  beforeEach(() => {
    cy.loginAsUserFromFrontpage(StandAloneEstablishment.editUserLoginName, userPassword);
  });

  after(() => {
    mockUsers.forEach((mockUser) => {
      cy.deleteTestUserFromDb(mockUser.fullname);
    });
  });

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
