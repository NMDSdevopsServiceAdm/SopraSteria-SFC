'use strict';
const expect = require('chai').expect;
const sinon = require('sinon');
const _db = require('../../../models');
const db = require('../../../utils/datastore');
//include Esatblishment class
const Esatblishment = require('../../../models/classes/establishment').Establishment;

let parentRecords = [
  {
    NameValue: 'Gorsefield Residential Home',
    postcode: 'ST6 7EA',
  },
  {
    NameValue: 'Little Haven',
    postcode: 'ST6 6JX',
  },
  {
    NameValue: 'PeteDev',
    postcode: 'PO5 1HB',
  },
  {
    NameValue: 'Skills for Care',
    postcode: 'L2 7FP',
  },
  {
    NameValue: 'St Michaels',
    postcode: 'ST6 6JX',
  },
  {
    NameValue: 'WOZiTech Cares Updated',
    postcode: 'LN11 9JG',
  },
  {
    NameValue: 'PS Testing Home 2',
    postcode: 'TQ3 2SF',
  },
  {
    NameValue: 'sopra',
    postcode: 'SE23 2PX',
  },
  {
    NameValue: 'Goldendale House',
    postcode: 'ST6 6JX',
  },
  {
    NameValue: 'The Larkins',
    postcode: 'ST6 8TX',
  },
  {
    NameValue: 'PS Testing Home 1',
    postcode: 'TQ3 2SF',
  },
];

let parentDetailsData = [
  {
    localIdentifier: 'My establishment',
    name: 'Sunset health care',
    id: 432,
    isRegulated: true,
    nmdsId: 'H1002354',
    address1: 'Unit 1A, Sunset House',
    address2: 'Sunset Lane',
    address3: '',
    postcode: 'LS1 1AA',
    town: 'Leeds',
    county: 'Leeds',
    provId: '',
    locationId: '1-1000210669',
    provid: '',
    shareWith: {
      enabled: true,
      with: 'CQC; Local Authority;',
    },
  },
];

describe('/server/models/class/establishment.js', () => {
  describe('getParentDetails', () => {
    sinon.stub(Esatblishment, 'fetchAllParentsAndPostcode').callsFake(() => {
      return parentRecords;
    });
    it('should return parent name and postcode', async () => {
      const getParentDetails = await Esatblishment.fetchAllParentsAndPostcode();
      if (getParentDetails) {
        expect(getParentDetails.length).to.equal(11);
      }
    });
  });
});

describe('/server/models/class/establishment.js', () => {
  describe('getParentDetails', () => {
    const thisEstablishment = new Esatblishment();
    sinon.stub(thisEstablishment, 'fetchParentDetails').callsFake(() => {
      return parentDetailsData;
    });
    it('should return parent details', async () => {
      const getParentDetails = await thisEstablishment.fetchParentDetails(432);
      if (getParentDetails) {
        expect(getParentDetails[0].name).to.equal('Sunset health care');
      }
    });
  });
});
