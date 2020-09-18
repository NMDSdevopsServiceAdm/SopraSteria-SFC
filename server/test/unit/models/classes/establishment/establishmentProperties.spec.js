const { NameProperty } = require('../../../../../models/classes/establishment/properties/nameProperty');

const expect = require('chai').expect;

const EstablishmentPropertyManager = require('../../../../../models/classes/establishment/establishmentProperties')
  .EstablishmentPropertyManager;

describe('EstablishmentPropertyManager', () => {
  const properties = [
    'NameProperty',
    'MainServiceProperty',
    'EmployerTypeProperty',
    'StaffProperty',
    'ServicesProperty',
    'ServiceUsersProperty',
    'CapacityProperty',
    'ShareWithProperty',
    'ShareWithLAProperty',
    'VacanciesProperty',
    'StartersProperty',
    'LeaversProperty',
    'LocalIdentifierProperty',
    'LocationIdProperty',
    'Address1Property',
    'Address2Property',
    'Address3Property',
    'TownProperty',
    'CountyProperty',
    'PostcodeProperty',
    'IsRegulatedProperty',
  ];
  it('should have the correct property types', () => {
    const establishmentProperties = new EstablishmentPropertyManager();
    expect(establishmentProperties._thisManager._propertyTypes.length).to.deep.equal(21);
    establishmentProperties._thisManager._propertyTypes.forEach((propertyType) => {
      expect(typeof propertyType).to.deep.equal('function');
      expect(properties).to.include(propertyType.name);
    });
  });
  it('should not have any properties', () => {
    const establishmentProperties = new EstablishmentPropertyManager();
    expect(establishmentProperties._thisManager.properties.length).to.deep.equal(0);
    expect(establishmentProperties._thisManager.properties).to.deep.equal([]);
  });
  it('should not have any modified properties', () => {
    const establishmentProperties = new EstablishmentPropertyManager();
    expect(establishmentProperties._thisManager._modifiedProperties.length).to.deep.equal(0);
    expect(establishmentProperties._thisManager._modifiedProperties).to.deep.equal([]);
  });
  it('should not have any audit events', () => {
    const establishmentProperties = new EstablishmentPropertyManager();
    expect(establishmentProperties._thisManager._auditEvents).to.deep.equal(null);
  });
  it('should not have any additional models', () => {
    const establishmentProperties = new EstablishmentPropertyManager();
    expect(establishmentProperties._thisManager._additionalModels).to.deep.equal(null);
  });
});
