export const inputLocationOrPostcode = (locationIdOrPostcode) => {
  cy.getByLabel('CQC location ID or postcode').type(locationIdOrPostcode);
  cy.get('button').contains('Find workplace').click();
};

export const fillInAddress = (name, address) => {
  const { address1, address2, address3, townOrCity, county, postcode } = address;
  cy.getByLabel(/No, I'll enter .* workplace details myself/).check();
  cy.get('button').contains('Continue').click();

  cy.getByLabel('Workplace name').type(name);
  cy.get('input#address1').type(address1);
  cy.get('input#address2').type(address2);
  cy.get('input#address3').type(address3);
  cy.get('input#townOrCity').type(townOrCity);
  cy.get('input#county').type(county);
  cy.get('input#postcode').type(postcode);

  cy.get('button').contains('Continue').click();
};

export const approveRegistrationRequestAsAdmin = (workplaceName) => {
  cy.loginAsAdmin();
  cy.get('a').contains('Registration requests').click();
  cy.get('a').contains(workplaceName).click();
  cy.contains(`Registration request: ${workplaceName}`).should('be.visible');
  cy.get('button').contains('Approve').click();
  cy.get('button').contains('Approve this request').click();
  cy.get('a').contains('Sign out').click();
};
