const { build, fake, sequence } = require('@jackfranklin/test-data-bot');

const establishmentId = fake((f) => f.helpers.replaceSymbolWithNumber('####'));
const uid = fake((f) => f.random.uuid());
module.exports = build('user', {
  fields: {
    establishmentId: establishmentId,
    username: fake((f) => f.internet.userName()),
    userUid: uid,
    id: sequence(),
    uid: uid,
    isParent: false,
    role: 'Edit',
    establishment: {
      id: establishmentId,
      uid: fake((f) => f.random.uuid()),
      isSubsidiary: false,
      isParent: false,
    },
    dataPermissions: null,
    parentIsOwner: false,
  },
});
