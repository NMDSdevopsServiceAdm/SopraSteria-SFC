const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

const ownershipChange = require('../../../../routes/ownershipRequest/ownershipChange');
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
        establishmentId: 2320,
      };

      const currentDataOwnerDetails = [
        {
          IsParent: false,
          ParentID: 479,
        },
      ];

      it('Gets the Ownership Requester details', async () => {
        request.ownershipRequest = {
          permissionRequest: 'Workplace',
        };

        ownershipStub.withArgs(request.establishmentId).returns(currentDataOwnerDetails);

        await ownershipChange.updateEstablishmentDetails(request);

        ownershipStub.should.have.been.calledWith(request.establishmentId);
      });

      it('Updates the data owner to Parent with "Workplace" permission', async () => {
        const updateDetails = {
          dataOwner: 'Parent',
          dataPermissions: 'Workplace',
        };

        request.ownershipRequest = {
          permissionRequest: 'Workplace',
        };

        ownershipStub.withArgs(request.establishmentId).returns(currentDataOwnerDetails);

        await ownershipChange.updateEstablishmentDetails(request);

        establishmentStub.should.have.been.calledWith(request.establishmentId, updateDetails);
      });

      it('Updates the data owner to Parent with "Workplace and Staff" permission', async () => {
        const updateDetails = {
          dataOwner: 'Parent',
          dataPermissions: 'Workplace and Staff',
        };

        request.ownershipRequest = {
          permissionRequest: 'Workplace and Staff',
        };

        ownershipStub.withArgs(request.establishmentId).returns(currentDataOwnerDetails);

        await ownershipChange.updateEstablishmentDetails(request);

        establishmentStub.should.have.been.calledWith(request.establishmentId, updateDetails);
      });
    });

    describe('Subsiduary requesting ownership', () => {
      const request = {
        establishmentId: 479,
      };

      let currentDataOwnerDetails = [
        {
          IsParent: true,
          SubEstablishmentID: 2320,
        },
      ];

      it('Gets the Ownership Requester details', async () => {
        request.ownershipRequest = [
          {
            permissionRequest: 'Workplace',
          },
        ];

        ownershipStub.withArgs(request.establishmentId).returns(currentDataOwnerDetails);

        await ownershipChange.updateEstablishmentDetails(request);

        ownershipStub.should.have.been.calledWith(request.establishmentId);
      });

      it('Updates the data owner to Workplace with "Workplace" permission', async () => {
        const updateDetails = {
          dataOwner: 'Workplace',
          dataPermissions: 'Workplace',
        };

        request.ownershipRequest = {
          permissionRequest: 'Workplace',
        };

        ownershipStub.withArgs(request.establishmentId).returns(currentDataOwnerDetails);

        await ownershipChange.updateEstablishmentDetails(request);

        establishmentStub.should.have.been.calledWith(currentDataOwnerDetails.SubEstablishmentID, updateDetails);
      });

      it('Updates the data owner to Workplace with "Workplace and Staff" permission', async () => {
        const updateDetails = {
          dataOwner: 'Workplace',
          dataPermissions: 'Workplace and Staff',
        };

        request.ownershipRequest = {
          permissionRequest: 'Workplace and Staff',
        };

        ownershipStub.withArgs(request.establishmentId).returns(currentDataOwnerDetails);

        await ownershipChange.updateEstablishmentDetails(request);

        establishmentStub.should.have.been.calledWith(currentDataOwnerDetails.SubEstablishmentID, updateDetails);
      });
    });
  });
});
