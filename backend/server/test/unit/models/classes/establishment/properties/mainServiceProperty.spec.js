const expect = require('chai').expect;
const sinon = require('sinon');
const models = require('../../../../../../models/');

const mainServicePropertyClass =
  require('../../../../../../models/classes/establishment/properties/mainServiceProperty').MainServiceProperty;

describe('mainServiceProperty', () => {
  const services = [
    {
      id: 1,
      reportingID: 13,
      name: 'Carers support',
      canDoDelegatedHealthcareActivities: null,
      payAndPensionsGroup: 3,
      other: false,
    },
    {
      id: 2,
      reportingID: 15,
      name: 'Community support and outreach',
      canDoDelegatedHealthcareActivities: true,
      payAndPensionsGroup: 3,
      other: false,
    },
  ];

  afterEach(() => {
    sinon.restore();
  });

  describe('restoreFromJson()', () => {
    it('should return correctly', async () => {
      sinon.stub(models.services, 'findAll').callsFake(() => {
        return services;
      });

      const mainServiceProperty = new mainServicePropertyClass();
      const document = {
        mainService: {
          id: 2,
          name: 'Community support and outreach',
          canDoDelegatedHealthcareActivities: true,
          payAndPensionsGroup: 3,
        },
      };

      await mainServiceProperty.restoreFromJson(document);
      expect(mainServiceProperty.property).to.deep.equal({
        id: 2,
        name: 'Community support and outreach',
        canDoDelegatedHealthcareActivities: true,
        payAndPensionsGroup: 3,
        other: undefined,
      });
    });

    it('should restore correctly when null', async () => {
      const mainServiceProperty = new mainServicePropertyClass();
      const document = {
        mainService: null,
      };

      await mainServiceProperty.restoreFromJson(document);
      expect(mainServiceProperty.property).to.deep.equal(null);
    });
  });

  describe('restorePropertyFromSequelize()', () => {
    it('should restore correctly ', () => {
      const mainServiceProperty = new mainServicePropertyClass();
      const document = {
        mainService: {
          id: 2,
          name: 'Community support and outreach',
          canDoDelegatedHealthcareActivities: true,
          payAndPensionsGroup: 3,
          other: false,
        },
      };

      const restored = mainServiceProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal({
        id: 2,
        name: 'Community support and outreach',
        canDoDelegatedHealthcareActivities: true,
        payAndPensionsGroup: 3,
        other: undefined,
      });
    });

    it('should restore correctly when null ', () => {
      const mainServiceProperty = new mainServicePropertyClass();
      const document = {
        mainService: null,
      };

      const restored = mainServiceProperty.restorePropertyFromSequelize(document);
      expect(restored).to.deep.equal(undefined);
    });
  });

  describe('savePropertyToSequelize()', () => {
    it('should save correctly', () => {
      const mainServiceProperty = new mainServicePropertyClass();
      mainServiceProperty.property = {
        id: 2,
        name: 'Community support and outreach',
        canDoDelegatedHealthcareActivities: true,
        payAndPensionsGroup: 3,
        other: false,
      };

      const result = mainServiceProperty.savePropertyToSequelize();
      expect(result).to.deep.equal({
        MainServiceFKValue: 2,
        MainServiceFkOther: null,
      });
    });
  });

  describe('isEqual()', () => {
    it('should return true', () => {
      const mainServiceProperty = new mainServicePropertyClass();

      const result = mainServiceProperty.isEqual(services, services);
      expect(result).to.equal(true);
    });

    it('should return false', () => {
      const mainServiceProperty = new mainServicePropertyClass();

      const result = mainServiceProperty.isEqual(services, services.pop());
      expect(result).to.equal(false);
    });
  });

  describe('toJSON()', () => {
    it('should return false when wdfEffectiveDate is true', () => {
      const mainServiceProperty = new mainServicePropertyClass();
      mainServiceProperty.property = {
        id: 2,
        name: 'Community support and outreach',
        canDoDelegatedHealthcareActivities: true,
        payAndPensionsGroup: 3,
        other: false,
      };

      const result = mainServiceProperty.toJSON(false, true, true);
      expect(result).to.deep.equal(false);
    });

    it('should return the object when withHistory is false', () => {
      const mainServiceProperty = new mainServicePropertyClass();
      mainServiceProperty.property = {
        id: 2,
        name: 'Community support and outreach',
        canDoDelegatedHealthcareActivities: true,
        payAndPensionsGroup: 3,
        other: false,
      };

      const result = mainServiceProperty.toJSON(false, true, false);
      expect(result).to.deep.equal({
        mainService: {
          id: 2,
          name: 'Community support and outreach',
          canDoDelegatedHealthcareActivities: true,
          payAndPensionsGroup: 3,
          other: false,
        },
      });
    });

    it('should return the property with property history', () => {
      const mainServiceProperty = new mainServicePropertyClass();
      mainServiceProperty.property = {
        id: 2,
        name: 'Community support and outreach',
        canDoDelegatedHealthcareActivities: true,
        payAndPensionsGroup: 3,
        other: false,
      };

      const result = mainServiceProperty.toJSON(true, true, false);
      expect(result).to.deep.equal({
        mainService: {
          currentValue: {
            id: 2,
            name: 'Community support and outreach',
            canDoDelegatedHealthcareActivities: true,
            payAndPensionsGroup: 3,
            other: false,
          },
          lastSavedBy: null,
          lastChangedBy: null,
          lastSaved: null,
          lastChanged: null,
        },
      });
    });
  });
});
