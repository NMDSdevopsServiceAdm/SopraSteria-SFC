const supertest = require('supertest');
const baseEndpoint = require('../../utils/baseUrl').baseurl;
const apiEndpoint = supertest(baseEndpoint);
const expect = require('chai').expect;

// Test the create establishments process

// mocked real postcode/location data
// http://localhost:3000/api/test/locations/random?limit=5
// const postcodes = require('../../mockdata/postcodes').data;
const establishment = require('../../models/classes/establishment');
const { Establishment } = require('../../../../models/classes/establishment');

describe('nmdsLookup', () => {

    let validPostcode = 'TW2 5EJ';
    let expectedNmdsLetter = 'G'

    const establishment = new Establishment('SirTestALot', null);
    establishment.postcode = validPostcode;
    establishment.theAuthority = 1
    establishment.theAuthority.id = 1

    let nmdsLetter = await getNmdsLetter(establishment)

    expect(nmdsLetter).to.equal(expectedNmdsLetter)
});
