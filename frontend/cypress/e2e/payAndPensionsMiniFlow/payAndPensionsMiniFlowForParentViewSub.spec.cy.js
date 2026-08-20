import { userPassword } from '../../support/configData';
import { ParentEstablishment, SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { onHomePage } from '../../support/page_objects/onHomePage';
import { runTestsForPayAndPensionsMiniFlow } from './runTestsForPayAndPensionsMiniFlow';

describe('Pay and pensions mini flow from home summary flag', { tags: '@payAndPensions' }, () => {
  const subsidaryToView = SubEstablishmentNotDataOwner;

  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, userPassword);

    cy.get('app-navigate-to-workplace-dropdown select').select(subsidaryToView.name);

    cy.url().should('contain', 'subsidiary');
    onHomePage.clickTab('Home');
    cy.get('h1').should('contain', subsidaryToView.name);
  });

  runTestsForPayAndPensionsMiniFlow(subsidaryToView);
});
