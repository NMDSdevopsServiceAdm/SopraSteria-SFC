const { oneOf, fake, build } = require('@jackfranklin/test-data-bot');

module.exports.apiTrainingBuilder = build('Training', {
  fields: {
    completed: fake((f) => f.helpers.replaceSymbolWithNumber('####-##-##')),
    expires: fake((f) => f.helpers.replaceSymbolWithNumber('####-##-##')),
    notes: fake((f) => f.lorem.sentence()),
    title: fake((f) => f.lorem.words()),
    accredited: oneOf('Yes', 'No', "Don't know"),
    category: {
      id: fake((f) => f.random.number({ min: 1, max: 40 })),
    },
  },
});
