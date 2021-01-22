const { oneOf, fake, build, perBuild } = require('@jackfranklin/test-data-bot');

module.exports.apiEstablishmentBuilder = build('Establishment', {
  fields: {
    LocalIdentifierValue: fake((f) => f.lorem.words(1)),
    NameValue: fake((f) => f.company.companyName()),
    address1: fake((f) => f.address.streetName()),
    address2: fake((f) => f.address.state()),
    address3: fake((f) => f.address.county()),
    town: fake((f) => f.address.city()),
    postcode: fake((f) => f.address.zipCode('??# #??')),
    EmployerTypeValue: oneOf(1, 3, 6, 7, 8),
    EmployerTypeOther: fake((f) => f.lorem.sentence()),
    shareWithCQC: false,
    shareWithLA: false,
    localAuthorities: perBuild(() => {
      return [
        {
          cssrId: fake((f) => f.random.number(1, 200)),
        },
      ];
    }),
    isRegulated: false,
    otherServices: [],
    mainService: {
      reportingID: fake((f) => f.random.number(1, 75)),
    },
    capacity: [],
    serviceUsers: [],
    NumberOfStaffValue: fake((f) => f.random.number(10, 300)),
    jobs: [],
    reasonsRorLeaving: '',
  },
});
