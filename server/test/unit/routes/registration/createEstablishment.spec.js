const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');

const {
  initialiseEstablishment,
  loadEstablishmentData,
  saveEstablishmentToDatabase,
} = require('../../../../routes/registration/createEstablishment');
const models = require('../../../../models');
const { Establishment } = require('../../../../models/classes/establishment');

describe('createEstablishment', () => {
  let newEstablishment;
  let establishmentData;
  beforeEach(() => {
    newEstablishment = new Establishment('username');
    establishmentData = {
      addressLine1: '12 Somewhere Street',
      addressLine2: 'Somewhere',
      addressLine3: 'Somwhere but adressline 3',
      townCity: 'Valhalla',
      county: 'Berkshire',
      locationId: 'locationIdExample',
      postalCode: 'S125AA',
      isRegulated: false,
    };

    sinon.stub(models.services, 'findAll').callsFake(() => {
      return [{ id: 1, other: true }];
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('initialiseEstablishment', () => {
    it('should set address1 in newEstablishment as addressLine1 passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.address1).to.equal(establishmentData.addressLine1);
    });

    it('should set address2 in newEstablishment as addressLine2 passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.address2).to.equal(establishmentData.addressLine2);
    });

    it('should set address3 in newEstablishment as addressLine3 passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.address3).to.equal(establishmentData.addressLine3);
    });

    it('should set town in newEstablishment as townCity passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.town).to.equal(establishmentData.townCity);
    });

    it('should set county in newEstablishment as county passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.county).to.equal(establishmentData.county);
    });

    it('should set locationId in newEstablishment as townCity passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.locationId).to.equal(establishmentData.locationId);
    });

    it('should set postcode in newEstablishment as postalCode passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.postcode).to.equal(establishmentData.postalCode);
    });

    it('should set isRegulated in newEstablishment as isRegulated passed in', () => {
      initialiseEstablishment(newEstablishment, establishmentData);

      expect(newEstablishment.isRegulated).to.equal(establishmentData.isRegulated);
    });
  });

  describe('loadEstablishmentData', async () => {
    beforeEach(() => {
      initialiseEstablishment(newEstablishment, establishmentData);

      establishmentData = {
        ...establishmentData,
        locationName: 'Test Location Name',
        mainServiceId: 1,
        mainServiceOther: 'Other name',
        ustatus: 'PENDING',
        expiresSoonAlertDate: 90,
        numberOfStaff: 4,
      };
    });

    it('should set name in newEstablishment as locationName passed in', async () => {
      await loadEstablishmentData(newEstablishment, establishmentData);

      expect(newEstablishment.name).to.equal(establishmentData.locationName);
    });

    it('should set mainService object in newEstablishment with mainServiceId and mainServiceOther passed in', async () => {
      await loadEstablishmentData(newEstablishment, establishmentData);

      expect(newEstablishment.mainService.id).to.equal(establishmentData.mainServiceId);
      expect(newEstablishment.mainService.other).to.equal(establishmentData.mainServiceOther);
    });

    it('should set ustatus in newEstablishment as ustatus passed in', async () => {
      await loadEstablishmentData(newEstablishment, establishmentData);

      expect(newEstablishment.ustatus).to.equal(establishmentData.ustatus);
    });

    it('should set expiresSoonAlertDate in newEstablishment as expiresSoonAlertDate passed in', async () => {
      await loadEstablishmentData(newEstablishment, establishmentData);

      expect(newEstablishment.expiresSoonAlertDate).to.equal(establishmentData.expiresSoonAlertDate);
    });

    it('should set name in numberOfStaff as numberOfStaff passed in', async () => {
      await loadEstablishmentData(newEstablishment, establishmentData);

      expect(newEstablishment.numberOfStaff).to.equal(establishmentData.numberOfStaff);
    });
  });

  describe('saveEstablishmentToDatabase', async () => {
    let saveStub;

    beforeEach(async () => {
      establishmentData = {
        ...establishmentData,
        locationName: 'Test Location Name',
        mainServiceId: 1,
        mainServiceOther: undefined,
        ustatus: 'PENDING',
        expiresSoonAlertDate: 90,
        numberOfStaff: 4,
      };

      saveStub = sinon.stub(newEstablishment, 'save').callsFake(() => {
        return {
          id: 1234567,
          uid: 'c21321321312321321',
          nmdsId: 'J31323812',
        };
      });
    });

    it('should call the save function on newEstablishment when valid establishment passed in', async () => {
      await saveEstablishmentToDatabase('username', establishmentData, newEstablishment);

      expect(saveStub.called).to.equal(true);
    });

    it('should throw an Establishment data is invalid error when invalid establishment data passed in', async () => {
      establishmentData.mainServiceId = 'Invalid main service ID';

      let error = null;
      try {
        await saveEstablishmentToDatabase('username', establishmentData, newEstablishment);
      } catch (err) {
        error = err;
      }

      expect(error.errCode).to.equal(-700);
      expect(error.errMessage).to.equal('Establishment data is invalid');
    });

    it('should not call save function on newEstablishment when invalid establishment data passed in', async () => {
      establishmentData.mainServiceId = 'Invalid main service ID';

      try {
        await saveEstablishmentToDatabase('username', establishmentData, newEstablishment);
      } catch (err) {
        return;
      }

      expect(saveStub.called).to.equal(false);
    });
  });
});
