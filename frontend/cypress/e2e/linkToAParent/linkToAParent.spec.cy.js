import { userPassword } from '../../support/configData';
import { ParentEstablishment } from '../../support/mockEstablishmentData';

describe('link to a parent', { tags: '@home' }, () => {
  const userFullName = 'mock user for link to a parent';
  const subWorkplaceUsername = 'mock-user-link-parent';
  const subWorkplaceName = 'mock workplace to test link to parent';
  const mockWorkplacePostcode = 'AB1 2CD';

  let mockSubWorkplace = {};

  before(() => {
    cy.clearLinkToParentRequests();
    cy.deleteTestUserFromDb(userFullName);
    cy.deleteTestWorkplaceFromDb(subWorkplaceName);
    cy.createTestUserWithNewWorkplace(userFullName, subWorkplaceUsername, subWorkplaceName).then((workplaceData) => {
      mockSubWorkplace = workplaceData;
    });
  });

  beforeEach(() => {
    cy.clearLinkToParentRequests();
    cy.removeLinkToParent(mockSubWorkplace.id);
  });

  const sendLinkToParentRequest = () => {
    cy.loginAsUserFromFrontpage(subWorkplaceUsername, userPassword);
    cy.contains('a', 'Link to a parent workplace').click();

    cy.get('h1').should('contain', 'Link to a parent workplace');
    cy.getByLabel(/type the parent workplace's name/).type(ParentEstablishment.name);
    cy.contains('li', ParentEstablishment.name).click();

    cy.getByLabel('Your workplace details and your staff records').click();
    cy.contains('button', 'Send link request').click();
    cy.get('app-alert span').should(
      'contain',
      `You've sent a link request to ${ParentEstablishment.name}, ${ParentEstablishment.postcode}`,
    );
  };

  it('can link to a parent workplace', () => {
    sendLinkToParentRequest();

    cy.get('a').contains('Sign out').click();
    cy.loginAsUserFromFrontpage(ParentEstablishment.editUserLoginName, userPassword);

    cy.get('h1').should('contain', ParentEstablishment.name);
    cy.contains('a', 'Notification').click();
    cy.contains('a', 'Link request').click();

    cy.contains(`${subWorkplaceName}, ${mockWorkplacePostcode} want to link to you`).should('be.visible');
    cy.contains('button', 'Approve request').click();

    cy.get('h1').should('contain', ParentEstablishment.name);

    // verify that parent can view the sub workplace
    cy.contains('a', 'Your other workplaces').click();
    cy.contains('a', subWorkplaceName).click();
    cy.get('h1').should('contain', subWorkplaceName);
    cy.contains(`Workplace ID: ${mockSubWorkplace.nmdsId}`).should('be.visible');

    cy.get('a').contains('Sign out').click();

    // verify that sub workplace got a notification of request approved
    cy.loginAsUserFromFrontpage(subWorkplaceUsername, userPassword);
    cy.contains('a', 'Notification').click();
    cy.get('a').contains('Link request: approved').click();

    cy.contains(
      `Your request to link to ${ParentEstablishment.name}, ${ParentEstablishment.postcode}, has been approved.`,
    ).should('be.visible');
  });

  it('should get a notification when parent rejected the link request', () => {
    sendLinkToParentRequest();

    cy.get('a').contains('Sign out').click();
    cy.loginAsUserFromFrontpage(ParentEstablishment.editUserLoginName, userPassword);

    cy.get('h1').should('contain', ParentEstablishment.name);
    cy.contains('a', 'Notification').click();
    cy.contains('a', 'Link request').click();

    cy.contains(`${subWorkplaceName}, ${mockWorkplacePostcode} want to link to you`).should('be.visible');
    cy.contains('button', 'Reject request').click();

    cy.contains('Do you want to provide a reason for rejecting?').should('be.visible');
    cy.getByLabel('Yes, provide reason').click();
    cy.get('textarea').type('reason for rejecting request');

    cy.contains('button', 'Continue').click();

    // verify not linked to sub workplace
    cy.contains('a', 'Your other workplaces').click();
    cy.contains(subWorkplaceName).should('not.exist');

    cy.get('a').contains('Sign out').click();
    cy.loginAsUserFromFrontpage(subWorkplaceUsername, userPassword);
    cy.contains('a', 'Notification').click();
    cy.get('a').contains('Link to parent organisation').click();

    cy.contains(
      `${ParentEstablishment.name}, ${ParentEstablishment.postcode} has rejected your request to link to them.`,
    ).should('be.visible');
    cy.contains('reason for rejecting request').should('be.visible');
  });

  it('can unlink from a parent', () => {
    cy.setupLinkToParent(mockSubWorkplace.id, ParentEstablishment.id);

    cy.loginAsUserFromFrontpage(subWorkplaceUsername, userPassword);
    cy.contains('a', 'Remove the link to your parent workplace').click();

    cy.get('h1').should('contain', 'Remove the link to your parent workplace');
    cy.contains('button', 'Remove the link').click();
    cy.get('app-alert span').should(
      'contain',
      `You've removed your link to ${ParentEstablishment.name}, ${ParentEstablishment.postcode}`,
    );
  });
});
