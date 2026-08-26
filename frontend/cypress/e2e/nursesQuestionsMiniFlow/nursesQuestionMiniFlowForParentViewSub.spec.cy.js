import { userPassword } from '../../support/configData';
import { ParentEstablishment, SubEstablishmentNotDataOwner } from '../../support/mockEstablishmentData';
import { runTestsForNursesQuestionsMiniFlow } from './runTestForNursesQuestionsMiniFlow';

describe('Pay and pensions mini flow from home tab update banner', { tags: '@staffRecords' }, () => {
  const subsidaryToView = SubEstablishmentNotDataOwner;

  beforeEach(() => {
    cy.loginAsUser(ParentEstablishment.editUserLoginName, userPassword);

    cy.get('app-navigate-to-workplace-dropdown select').select(subsidaryToView.name);

    cy.url().should('contain', 'subsidiary');
    cy.get('h1').should('contain', subsidaryToView.name);
  });

  runTestsForNursesQuestionsMiniFlow(subsidaryToView);
});
