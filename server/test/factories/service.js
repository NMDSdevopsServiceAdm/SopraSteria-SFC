const { build, sequence } = require('@jackfranklin/test-data-bot');

module.exports = build('services', {
  fields: {
    id: sequence(),
    name: 'Carers support',
    category: 'Adult community care',
    iscqcregistered: false,
    isMain: true,
    other: false,
    reportingID: 13,
  }
});
