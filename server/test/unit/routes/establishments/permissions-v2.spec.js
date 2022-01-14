const expect = require('chai').expect;
const {
  getPermissions,
  getEstablishmentType,
  ownsData,
  getViewingPermissions,
} = require('../../../../models/cache/singletons/permissions-v2');

describe('permissions-v2', () => {
  let req;
  beforeEach(() => {
    req = {
      role: 'Edit',
      parentIsOwner: false,
      isParent: false,
      establishment: {
        isSubsidiary: false,
        isParent: false,
      },
    };
  });

  describe('getPermissions()', () => {
    describe('Admin', () => {
      beforeEach(() => {
        req.role = 'Admin';
      });

      it('should return admin permissions when req.role is admin', () => {
        const returnedPermissions = getPermissions(req);

        expect(returnedPermissions).to.deep.equal([
          'canViewEstablishment',
          'canViewWdfReport',
          'canViewUser',
          'canViewListOfUsers',
          'canDownloadWdfReport',
          'canViewBenchmarks',
          'canViewNinoDob',
          'canAddUser',
          'canBulkUpload',
          'canChangePermissionsForSubsidiary',
          'canChangeDataOwner',
          'canDeleteUser',
          'canEditUser',
          'canViewListOfWorkers',
          'canViewWorker',
          'canAddWorker',
          'canEditWorker',
          'canDeleteWorker',
          'canTransferWorker',
          'canEditEstablishment',
          'canRunLocalAuthorityReport',
          'canLinkToParent',
          'canBecomeAParent',
          'canDeleteEstablishment',
          'canDeleteAllEstablishments',
          'canRunLocalAuthorityAdminReport',
          'canViewWdfSummaryReport',
          'canSearchUsers',
          'canSearchEstablishment',
        ]);
      });
    });

    describe('Edit user', () => {
      beforeEach(() => {
        req.role = 'Edit';
      });

      it('should return edit permissions when edit user which owns data', () => {
        const returnedPermissions = getPermissions(req);

        expect(returnedPermissions).to.deep.equal([
          'canViewEstablishment',
          'canViewWdfReport',
          'canViewUser',
          'canViewListOfUsers',
          'canDownloadWdfReport',
          'canViewBenchmarks',
          'canViewNinoDob',
          'canAddUser',
          'canBulkUpload',
          'canChangePermissionsForSubsidiary',
          'canChangeDataOwner',
          'canDeleteUser',
          'canEditUser',
          'canViewListOfWorkers',
          'canViewWorker',
          'canAddWorker',
          'canEditWorker',
          'canDeleteWorker',
          'canTransferWorker',
          'canEditEstablishment',
          'canRunLocalAuthorityReport',
          'canLinkToParent',
          'canBecomeAParent',
        ]);
      });

      it('should return canAddEstablishment permission when isParent which owns data', () => {
        req.establishment.isParent = true;
        req.isParent = true;

        const returnedPermissions = getPermissions(req);

        expect(returnedPermissions).to.include('canAddEstablishment');
      });

      it('should not return canRemoveParentAssociation permission when isParent which owns data', () => {
        req.establishment.isParent = true;
        req.isParent = true;

        const returnedPermissions = getPermissions(req);

        expect(returnedPermissions).not.to.include('canRemoveParentAssociation');
        expect(returnedPermissions).not.to.include('canDeleteEstablishment');
      });

      it('should return canRemoveParentAssociation and canDeleteEstablishment permission when isSubsidiary', () => {
        req.establishment.isSubsidiary = true;

        const returnedPermissions = getPermissions(req);

        expect(returnedPermissions).to.include('canRemoveParentAssociation');
        expect(returnedPermissions).to.include('canDeleteEstablishment');
      });

      it('should not return canAddEstablishment permission when isSubsidiary', () => {
        req.establishment.isSubsidiary = true;

        const returnedPermissions = getPermissions(req);

        expect(returnedPermissions).not.to.include('canAddEstablishment');
      });
    });

    describe('Read user', () => {
      beforeEach(() => {
        req.role = 'Read';
      });

      it('should return read permissions when read user which owns data', () => {
        const returnedPermissions = getPermissions(req);

        expect(returnedPermissions).to.deep.equal([
          'canViewEstablishment',
          'canViewWdfReport',
          'canViewUser',
          'canViewListOfUsers',
          'canDownloadWdfReport',
          'canViewBenchmarks',
          'canViewNinoDob',
        ]);
      });
    });
  });

  describe('getEstablishmentType()', () => {
    it('should return "Standalone" if workplace is a standalone workplace', () => {
      const establishment = {
        isSubsidiary: false,
        isParent: false,
      };
      const estabType = getEstablishmentType(establishment);
      expect(estabType).to.deep.equal('Standalone');
    });

    it('should return "Subsidiary" if workplace is a subsidiary workplace', () => {
      const establishment = {
        isSubsidiary: true,
        isParent: false,
      };
      const estabType = getEstablishmentType(establishment);
      expect(estabType).to.deep.equal('Subsidiary');
    });

    it('should return "Parent" if workplace is a parent workplace', () => {
      const establishment = {
        isSubsidiary: false,
        isParent: true,
      };
      const estabType = getEstablishmentType(establishment);
      expect(estabType).to.deep.equal('Parent');
    });
  });

  describe('ownsData()', () => {
    it('should return true if standalone workplace', () => {
      const req = {};
      const ownEstData = ownsData('Standalone', req);
      expect(ownEstData).to.be.true;
    });

    it('should return true if sub workplace where sub owns the data', () => {
      const req = {
        parentIsOwner: false,
        isParent: false,
      };
      const ownEstData = ownsData('Subsidiary', req);
      expect(ownEstData).to.be.true;
    });

    it('should return true if sub workplace and parent user where parent owns the data', () => {
      const req = {
        parentIsOwner: true,
        isParent: true,
      };
      const ownEstData = ownsData('Subsidiary', req);
      expect(ownEstData).to.be.true;
    });

    it('should return true if parent workplace and parent user where parent owns the data', () => {
      const req = {
        parentIsOwner: false,
        isParent: true,
      };
      const ownEstData = ownsData('Parent', req);
      expect(ownEstData).to.be.true;
    });

    it('should return false if sub workplace and sub user where parent owns the data', () => {
      const req = {
        parentIsOwner: true,
        isParent: false,
      };
      const ownEstData = ownsData('Subsidiary', req);
      expect(ownEstData).to.be.false;
    });

    it('should return false if sub workplace and parent user where sub owns the data', () => {
      const req = {
        parentIsOwner: false,
        isParent: true,
      };
      const ownEstData = ownsData('Subsidiary', req);
      expect(ownEstData).to.be.false;
    });
  });

  describe('getViewingPermissions()', () => {
    it('should return only dataPermissionNone() if user has no viewing permissions', () => {
      const permissions = getViewingPermissions('None');
      expect(permissions).to.deep.equal(['canRemoveParentAssociation', 'canViewBenchmarks']);
    });

    it('should return dataPermissionWorkplace() if user has workplace only viewing permissions', () => {
      const permissions = getViewingPermissions('Workplace');
      expect(permissions).to.deep.equal([
        'canRemoveParentAssociation',
        'canViewBenchmarks',
        'canChangePermissionsForSubsidiary',
        'canChangeDataOwner',
        'canViewEstablishment',
        'canViewWdfReport',
        'canViewUser',
        'canViewListOfUsers',
      ]);
    });

    it('should return dataPermissionWorkplaceAndStaff() if user has workplace and staff viewing permissions', () => {
      const permissions = getViewingPermissions('Workplace and Staff');
      expect(permissions).to.deep.equal([
        'canRemoveParentAssociation',
        'canViewBenchmarks',
        'canChangePermissionsForSubsidiary',
        'canChangeDataOwner',
        'canViewEstablishment',
        'canViewWdfReport',
        'canViewUser',
        'canViewListOfUsers',
        'canViewListOfWorkers',
        'canViewWorker',
      ]);
    });
  });
});
