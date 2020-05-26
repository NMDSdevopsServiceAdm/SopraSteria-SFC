const { build, fake } = require('@jackfranklin/test-data-bot');

const establishmentId = fake(f => f.helpers.replaceSymbolWithNumber('####'));

module.exports = build('user', {
  fields: {
    establishmentId: establishmentId,
    username: fake(f => f.internet.userName()),
    userUid: fake(f => f.random.uuid()),
    isParent: false,
    role: 'Edit',
    establishment: {
      id: establishmentId,
      uid: fake(f => f.random.uuid()),
      isSubsidiary: false,
      isParent: false
    },
    dataPermissions: null,
    parentIsOwner: false
  }
});
