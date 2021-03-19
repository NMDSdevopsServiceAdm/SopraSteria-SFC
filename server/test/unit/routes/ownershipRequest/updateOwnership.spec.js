const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

const updateOwnership = require('../../../../routes/ownershipRequest/updateOwnership');
const { Establishment } = require('../../../../models/classes/establishment');
const ownership = require('../../../../data/ownership');

describe('routes/ownershipRequest/updateOwnership.js', () => {
  describe('update', () => {
    beforeEach(function () {});

    afterEach(function () {
      sinon.restore();
    });

    const request = {
      establishment: {
        id: 2320,
      },
    };

    describe('Parent requesting ownership', () => {
      let currentDataOwnerDetails = [
        {
          IsParent: false,
          ParentID: 479,
        },
      ];

      it('Gets the Ownership Requester details', () => {
        const ownershipChangeRequest = [
          {
            permissionRequest: 'Workplace',
          },
        ];

        const ownershipStub = sinon.stub(ownership, 'getownershipRequesterId');
        ownershipStub.withArgs(request.establishment.id).returns(currentDataOwnerDetails);

        updateOwnership.update(request, ownershipChangeRequest);

        ownershipStub.should.have.been.calledWith(request.establishment.id);
      });

      it.only('Updates the data owner to Parent with "Workplace" permission', () => {
        const establishmentStub = sinon.stub(Establishment, 'fetchAndUpdateEstablishmentDetails');

        const updateDetails = {
          dataOwner: 'Parent',
          dataPermissions: 'Workplace',
        };

        const ownershipChangeRequest = [
          {
            permissionRequest: 'Workplace',
          },
        ];

        let ownershipStub = sinon.stub(ownership, 'getownershipRequesterId');
        ownershipStub.withArgs(request.establishment.id).returns(currentDataOwnerDetails);

        updateOwnership.update(request, ownershipChangeRequest);

        establishmentStub.should.have.been.calledWith(request.establishment.id, updateDetails);
      });

      it('Updates the data owner to Parent with "Workplace and Staff" permission', () => {
        const establishmentStub = sinon.stub(Establishment, 'fetchAndUpdateEstablishmentDetails');

        const updateDetails = {
          dataOwner: 'Parent',
          dataPermissions: 'Workplace and Staff',
        };

        const checkOwnerChangeRequestResult = [
          {
            permissionRequest: 'Workplace and Staff',
          },
        ];

        let ownershipStub = sinon.stub(ownership, 'getownershipRequesterId');
        ownershipStub.withArgs(request.establishment.id).returns(currentDataOwnerDetails);

        updateOwnership.update(request, checkOwnerChangeRequestResult);

        establishmentStub.should.have.been.calledWith(currentDataOwnerDetails[0].ParentID, updateDetails);
      });
    });

    describe('Subsiduary requesting ownership', () => {
      let currentDataOwnerDetails = [
        {
          IsParent: false,
          SubEstablishmentID: 2320,
        },
      ];

      it('Gets the Ownership Requester details', () => {
        const checkOwnerChangeRequest = [
          {
            permissionRequest: 'Workplace',
          },
        ];

        const ownershipStub = sinon.stub(ownership, 'getownershipRequesterId');
        ownershipStub.withArgs(request.establishment.id).returns(currentDataOwnerDetails);

        updateOwnership.update(request, checkOwnerChangeRequest);

        ownershipStub.should.have.been.calledWith(request.establishment.id);
      });

      it('Updates the data owner to Workplace with "Workplace" permission', () => {
        const establishmentStub = sinon.stub(Establishment, 'fetchAndUpdateEstablishmentDetails');

        const updateDetails = {
          dataOwner: 'Workplace',
          dataPermissions: 'Workplace',
        };

        const checkOwnerChangeRequestResult = [
          {
            permissionRequest: 'Workplace',
          },
        ];

        let ownershipStub = sinon.stub(ownership, 'getownershipRequesterId');
        ownershipStub.withArgs(request.establishment.id).returns(currentDataOwnerDetails);

        updateOwnership.update(request, checkOwnerChangeRequestResult);

        establishmentStub.should.have.been.calledWith(request.establishment.id, updateDetails);
      });

      it('Updates the data owner to Workplace with "Workplace and Staff" permission', () => {
        const establishmentStub = sinon.stub(Establishment, 'fetchAndUpdateEstablishmentDetails');

        const updateDetails = {
          dataOwner: 'Workplace',
          dataPermissions: 'Workplace and Staff',
        };

        const checkOwnerChangeRequestResult = [
          {
            permissionRequest: 'Workplace and Staff',
          },
        ];

        let ownershipStub = sinon.stub(ownership, 'getownershipRequesterId');
        ownershipStub.withArgs(request.establishment.id).returns(currentDataOwnerDetails);

        updateOwnership.update(request, checkOwnerChangeRequestResult);

        establishmentStub.should.have.been.calledWith(request.establishment.id, updateDetails);
      });
    });
  });
});
