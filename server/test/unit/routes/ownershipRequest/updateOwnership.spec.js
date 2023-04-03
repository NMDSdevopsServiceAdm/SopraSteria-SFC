const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

const updateOwnership = require('../../../../routes/ownershipRequest/ownershipChange').updateOwnership;
const { Establishment } = require('../../../../models/classes/establishment');
const ownership = require('../../../../data/ownership');

describe('routes/ownershipRequest/ownershipChange.js', () => {
  describe('update', () => {
    let ownershipStub;
    let establishmentStub;

    beforeEach(function () {
      ownershipStub = sinon.stub(ownership, 'getownershipRequesterId');
      establishmentStub = sinon.stub(Establishment, 'fetchAndUpdateEstablishmentDetails');
    });

    afterEach(function () {
      sinon.restore();
    });

    describe('Parent requesting ownership', () => {
      const request = {
        establishment: {
          id: 2320,
        },
      };

      const currentDataOwnerDetails = [
        {
          IsParent: false,
          ParentID: 479,
        },
      ];

      it('Gets the Ownership Requester details', async () => {
        const ownershipChangeRequest = [
          {
            permissionRequest: 'Workplace',
          },
        ];

        ownershipStub.withArgs(request.establishment.id).returns(currentDataOwnerDetails);

        await updateOwnership.update(request, ownershipChangeRequest);

        ownershipStub.should.have.been.calledWith(request.establishment.id);
      });

      it('Updates the data owner to Parent with "Workplace" permission', async () => {
        const updateDetails = {
          dataOwner: 'Parent',
          dataPermissions: 'Workplace',
        };

        const ownershipChangeRequest = [
          {
            permissionRequest: 'Workplace',
          },
        ];

        ownershipStub.withArgs(request.establishment.id).returns(currentDataOwnerDetails);

        await updateOwnership.update(request, ownershipChangeRequest);

        establishmentStub.should.have.been.calledWith(request.establishment.id, updateDetails);
      });

      it('Updates the data owner to Parent with "Workplace and Staff" permission', async () => {
        const updateDetails = {
          dataOwner: 'Parent',
          dataPermissions: 'Workplace and Staff',
        };

        const checkOwnerChangeRequestResult = [
          {
            permissionRequest: 'Workplace and Staff',
          },
        ];

        ownershipStub.withArgs(request.establishment.id).returns(currentDataOwnerDetails);

        await updateOwnership.update(request, checkOwnerChangeRequestResult);

        establishmentStub.should.have.been.calledWith(request.establishment.id, updateDetails);
      });
    });

    describe('Subsiduary requesting ownership', () => {
      const request = {
        establishment: {
          id: 479,
        },
      };

      let currentDataOwnerDetails = [
        {
          IsParent: true,
          SubEstablishmentID: 2320,
        },
      ];

      it('Gets the Ownership Requester details', async () => {
        const checkOwnerChangeRequest = [
          {
            permissionRequest: 'Workplace',
          },
        ];

        ownershipStub.withArgs(request.establishment.id).returns(currentDataOwnerDetails);

        await updateOwnership.update(request, checkOwnerChangeRequest);

        ownershipStub.should.have.been.calledWith(request.establishment.id);
      });

      it('Updates the data owner to Workplace with "Workplace" permission', async () => {
        const updateDetails = {
          dataOwner: 'Workplace',
          dataPermissions: 'Workplace',
        };

        const checkOwnerChangeRequestResult = [
          {
            permissionRequest: 'Workplace',
          },
        ];

        ownershipStub.withArgs(request.establishment.id).returns(currentDataOwnerDetails);

        await updateOwnership.update(request, checkOwnerChangeRequestResult);

        establishmentStub.should.have.been.calledWith(currentDataOwnerDetails.SubEstablishmentID, updateDetails);
      });

      it('Updates the data owner to Workplace with "Workplace and Staff" permission', async () => {
        const updateDetails = {
          dataOwner: 'Workplace',
          dataPermissions: 'Workplace and Staff',
        };

        const checkOwnerChangeRequestResult = [
          {
            permissionRequest: 'Workplace and Staff',
          },
        ];

        ownershipStub.withArgs(request.establishment.id).returns(currentDataOwnerDetails);

        await updateOwnership.update(request, checkOwnerChangeRequestResult);

        establishmentStub.should.have.been.calledWith(currentDataOwnerDetails.SubEstablishmentID, updateDetails);
      });
    });
  });
});
