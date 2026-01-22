const { oneOf, fake, build } = require('@jackfranklin/test-data-bot');
const { TrainingCourseDeliveredBy, Enum } = require('../../../../reference/databaseEnumTypes');

module.exports.apiTrainingBuilder = build('Training', {
  fields: {
    completed: fake((f) => f.helpers.replaceSymbolWithNumber('####-##-##')),
    expires: fake((f) => f.helpers.replaceSymbolWithNumber('####-##-##')),
    notes: fake((f) => f.lorem.sentence()),
    title: fake((f) => f.lorem.words()),
    accredited: oneOf('Yes', 'No', "Don't know"),
    category: {
      id: fake((f) => f.datatype.number({ min: 1, max: 40 })),
    },
    deliveredBy: TrainingCourseDeliveredBy.ExternalProvider,
    trainingProvider: oneOf(null, { id: 1, bulkdUploadCode: 1 }, { id: 63, bulkdUploadCode: 999 }),
    howWasItDelivered: oneOf(...Enum.TrainingCourseDeliveryMode),
    doesNotExpire: false,
    validityPeriodInMonth: fake((f) => f.datatype.number({ min: 1, max: 24 })),
  },
});
