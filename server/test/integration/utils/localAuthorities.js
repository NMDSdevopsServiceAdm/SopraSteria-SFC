const Random = require('./random');
const supertest = require('supertest');

let allLocalAuthorities = null;

const getReferenceAuthorities = async (apiEndpoint) => {
  if (allLocalAuthorities === null) {
    const laS = await apiEndpoint.get('/localAuthority').expect('Content-Type', /json/).expect(200);
    allLocalAuthorities = laS.body;
  }
};

exports.lookupRandomAuthority = async (apiEndpoint) => {
  await getReferenceAuthorities(apiEndpoint);
  const randomIndex = Random.randomInt(0, allLocalAuthorities.length - 1);
  return allLocalAuthorities[randomIndex].custodianCode;
};
