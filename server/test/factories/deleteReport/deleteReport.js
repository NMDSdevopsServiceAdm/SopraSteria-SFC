const { build, fake } = require('@jackfranklin/test-data-bot');

const rawDataBuilder = build('rawData', {
  fields: {
    uid: fake((f) => f.random.uuid()),
    id: fake((f) => f.random.number()),
    NameValue: fake((f) => f.lorem.sentence()),
    nmdsId: '',
    isRegulated: false,
    address1: fake((f) => f.address.streetAddress()),
    address2: fake((f) => f.address.secondaryAddress()),
    address3: null,
    town: fake((f) => f.address.city()),
    county: fake((f) => f.address.county()),
    postcode: fake((f) => f.address.zipCode('??# #??')),
    locationId: fake((f) => f.helpers.replaceSymbolWithNumber('#-########')),
    updated: '2019-10-18T11:29:58.477Z',
    EmployerTypeValue: null,
    EmployerTypeOther: null,
    workers: [],
    mainService: { name: 'Day care and day services' },
  },
});
module.exports.rawDataBuilder = rawDataBuilder;
