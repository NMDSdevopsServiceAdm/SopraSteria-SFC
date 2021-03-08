const expect = require('chai').expect;

const servicesPropertyClass = require('../../../../../../models/classes/establishment/properties/servicesProperty')
  .ServicesProperty;

describe('servicesProperty Property', () => {
  describe('restoreFromJson()', () => {
    it('should return JSON', async () => {
      const servicesProperty = new servicesPropertyClass();
      const document = {
        services: {
          value: 'Yes',
          services: [{ id: 2 }, { id: 11 }, { id: 17, other: null }],
        },
        allMyServices: [
          { id: 1, name: 'Carers support', category: 'Adult community care', other: false },
          { id: 2, name: 'Community support and outreach', category: 'Adult community care', other: false },
          {
            id: 3,
            name: 'Disability adaptations / assistive technology services',
            category: 'Adult community care',
            other: false,
          },
          { id: 4, name: 'Information and advice services', category: 'Adult community care', other: false },
          { id: 5, name: 'Occupational / employment-related services', category: 'Adult community care', other: false },
          { id: 6, name: 'Other adult community care service', category: 'Adult community care', other: true },
          { id: 7, name: 'Short breaks / respite care', category: 'Adult community care', other: false },
          { id: 8, name: 'Social work and care management', category: 'Adult community care', other: false },
          { id: 9, name: 'Day care and day services', category: 'Adult day', other: false },
          { id: 10, name: 'Other adult day care services', category: 'Adult day', other: true },
          { id: 11, name: 'Domestic services and home help', category: 'Adult domiciliary', other: false },
          { id: 18, name: 'Other adult domiciliary care service', category: 'Adult domiciliary', other: true },
          { id: 12, name: 'Other adult residential care services', category: 'Adult residential', other: true },
          { id: 13, name: 'Sheltered housing', category: 'Adult residential', other: false },
          { id: 14, name: 'Any childrens / young peoples services', category: 'Other', other: true },
          { id: 15, name: 'Any other services', category: 'Other', other: true },
          { id: 17, name: 'Other healthcare service', category: 'Other', other: true },
        ],
        mainService: {
          id: 1,
        },
      };
      await servicesProperty.restoreFromJson(document);
      expect(servicesProperty.property).to.deep.equal({
        value: 'Yes',
        services: [
          { id: 2, name: 'Community support and outreach', category: 'Adult community care', other: undefined },
          { id: 11, name: 'Domestic services and home help', category: 'Adult domiciliary', other: undefined },
          { id: 17, name: 'Other healthcare service', category: 'Other', other: undefined },
        ],
      });
    });
  });
  describe.only('restorePropertyFromSequelize()', () => {
    it('should restore from sequelize', async () => {
      const servicesProperty = new servicesPropertyClass();
      const document = {
        otherServicesValue: 'Yes',
        otherServices: [
          { id: 2, name: 'Community support and outreach', category: 'Adult community care', other: false },
          { id: 11, name: 'Domestic services and home help', category: 'Adult domiciliary', other: false },
          { id: 17, name: 'Other healthcare service', category: 'Other', other: null },
        ],
        allMyServices: [
          { id: 1, name: 'Carers support', category: 'Adult community care', other: false },
          { id: 2, name: 'Community support and outreach', category: 'Adult community care', other: false },
          {
            id: 3,
            name: 'Disability adaptations / assistive technology services',
            category: 'Adult community care',
            other: false,
          },
          { id: 4, name: 'Information and advice services', category: 'Adult community care', other: false },
          { id: 5, name: 'Occupational / employment-related services', category: 'Adult community care', other: false },
          { id: 6, name: 'Other adult community care service', category: 'Adult community care', other: true },
          { id: 7, name: 'Short breaks / respite care', category: 'Adult community care', other: false },
          { id: 8, name: 'Social work and care management', category: 'Adult community care', other: false },
          { id: 9, name: 'Day care and day services', category: 'Adult day', other: false },
          { id: 10, name: 'Other adult day care services', category: 'Adult day', other: true },
          { id: 11, name: 'Domestic services and home help', category: 'Adult domiciliary', other: false },
          { id: 18, name: 'Other adult domiciliary care service', category: 'Adult domiciliary', other: true },
          { id: 12, name: 'Other adult residential care services', category: 'Adult residential', other: true },
          { id: 13, name: 'Sheltered housing', category: 'Adult residential', other: false },
          { id: 14, name: 'Any childrens / young peoples services', category: 'Other', other: true },
          { id: 15, name: 'Any other services', category: 'Other', other: true },
          { id: 17, name: 'Other healthcare service', category: 'Other', other: true },
        ],
        mainService: {
          id: 1,
        },
      };
      await servicesProperty.restoreFromSequelize(document);
      expect(servicesProperty.property).to.deep.equal({
        value: 'Yes',
        services: [
          { id: 2, name: 'Community support and outreach', category: 'Adult community care', other: undefined },
          { id: 11, name: 'Domestic services and home help', category: 'Adult domiciliary', other: undefined },
          { id: 17, name: 'Other healthcare service', category: 'Other', other: undefined },
        ],
      });
    });
  });
});
