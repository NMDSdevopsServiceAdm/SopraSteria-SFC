const expect = require('chai').expect;

const { convertWorkplaceAndUserDetails } = require('../../../utils/registrationsUtils');
const { registrationWithUser, convertedRegistrationResponse } = require('../mockdata/registration');

describe('registrationUtils', () => {
  describe('convertWorkplaceAndUserDetails', () => {
    it('should convert a registration with user into the correct format', () => {
      const returnedValue = convertWorkplaceAndUserDetails(registrationWithUser);

      expect(returnedValue).to.deep.equal(convertedRegistrationResponse);
    });

    it('should convert a registration without a user into the correct format', () => {
      const registrationWithoutUser = { ...registrationWithUser, users: [] };
      const {
        email,
        name,
        phone,
        securityQuestion,
        securityQuestionAnswer,
        ...convertedRegistrationResponseWithoutUser
      } = convertedRegistrationResponse;

      const returnedValue = convertWorkplaceAndUserDetails(registrationWithoutUser);

      expect(returnedValue).to.deep.equal(convertedRegistrationResponseWithoutUser);
    });
  });
});
