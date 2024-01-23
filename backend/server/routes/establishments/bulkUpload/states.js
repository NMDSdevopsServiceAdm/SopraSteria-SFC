'use strict';

const buStates = [
  'READY',
  'DOWNLOADING',
  'UPLOADING',
  'UPLOADED',
  'VALIDATING',
  'FAILED',
  'WARNINGS',
  'PASSED',
  'COMPLETING',
  'UNKNOWN',
].reduce((acc, item) => {
  acc[item] = item;

  return acc;
}, Object.create(null));

module.exports = {
  buStates,
};
