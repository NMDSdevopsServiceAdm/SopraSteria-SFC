const expect = require('chai').expect;
const sinon = require('sinon');

const {
  getPermissions,
  getEstablishmentType,
  ownsData,
  getViewingPermissions,
} = require('../../../../models/cache/singletons/permissions-v2');
const models = require('../../../../models');

describe('permissions-v2', () => {
  let req;
  beforeEach(() => {
    sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
      return { hasParent: false, hasRequestedToBecomeAParent: false };
    });

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

  afterEach(() => {
    sinon.restore();
  });

  describe('getPermissions()', () => {
    describe('Admin', () => {
      beforeEach(() => {
        req.role = 'Admin';
      });

      it('should return admin permissions when req.role is admin', async () => {
        const returnedPermissions = await getPermissions(req);

        expect(returnedPermissions).to.deep.equal([
          'canDownloadWdfReport',
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
          'canBecomeAParent',
          'canLinkToParent',
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

      it('should return edit permissions when edit user which owns data', async () => {
        const returnedPermissions = await getPermissions(req);

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
          'canBecomeAParent',
          'canLinkToParent',
        ]);
      });

      it('should return canAddEstablishment permission when isParent which owns data', async () => {
        req.establishment.isParent = true;
        req.isParent = true;

        const returnedPermissions = await getPermissions(req);

        expect(returnedPermissions).to.include('canAddEstablishment');
      });

      it('should not return canDeleteEstablishment permission when isParent which owns data', async () => {
        req.establishment.isParent = true;
        req.isParent = true;

        const returnedPermissions = await getPermissions(req);

        expect(returnedPermissions).not.to.include('canDeleteEstablishment');
      });

      it('should return canDeleteEstablishment permission when isSubsidiary', async () => {
        req.establishment.isSubsidiary = true;

        const returnedPermissions = await getPermissions(req);

        expect(returnedPermissions).to.include('canDeleteEstablishment');
      });

      it('should not return canAddEstablishment permission when isSubsidiary', async () => {
        req.establishment.isSubsidiary = true;

        const returnedPermissions = await getPermissions(req);

        expect(returnedPermissions).not.to.include('canAddEstablishment');
      });

      describe('canLinkToParent', async () => {
        beforeEach(() => {
          sinon.restore();
        });

        it('should return canLinkToParent permission when hasParent, hasRequestedToBecomeAParent and req.isParent is false', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return { hasParent: false, hasRequestedToBecomeAParent: false };
          });

          req.isParent = false;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).to.include('canLinkToParent');
        });

        it('should not return canLinkToParent permission when req.isParent is true', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return { hasParent: false, hasRequestedToBecomeAParent: false };
          });

          req.isParent = true;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canLinkToParent');
        });

        it('should not return canLinkToParent permission when hasParent is true', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return { hasParent: true, hasRequestedToBecomeAParent: false };
          });

          req.isParent = true;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canLinkToParent');
        });

        it('should not return canLinkToParent permission when hasRequestedToBecomeAParent is true', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return { hasParent: true, hasRequestedToBecomeAParent: false };
          });

          req.isParent = true;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canLinkToParent');
        });
      });

      describe('canRemoveParentAssociation', async () => {
        beforeEach(() => {
          sinon.restore();
        });

        it('should return canRemoveParentAssociation permission when hasParent is true and req.isParent is false', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return { hasParent: true, hasRequestedToBecomeAParent: false };
          });

          req.isParent = false;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).to.include('canRemoveParentAssociation');
        });

        it('should not return canRemoveParentAssociation permission when req.isParent is true', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return { hasParent: false, hasRequestedToBecomeAParent: false };
          });

          req.isParent = true;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canRemoveParentAssociation');
        });

        it('should not return canRemoveParentAssociation permission when hasParent is false', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return { hasParent: false, hasRequestedToBecomeAParent: false };
          });

          req.isParent = false;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canRemoveParentAssociation');
        });

        it('should not return canRemoveParentAssociation permission hasParent is true and is parent is true', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return { hasParent: true, hasRequestedToBecomeAParent: false };
          });

          req.isParent = true;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canRemoveParentAssociation');
        });
      });

      describe('canDownloadWdfReport', async () => {
        it('should return canDownloadWdfReport permission when req.isParent is true', async () => {
          req.isParent = true;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).to.include('canDownloadWdfReport');
        });

        it('should not return canDownloadWdfReport permission when req.isParent is false', async () => {
          req.isParent = true;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).to.include('canDownloadWdfReport');
        });
      });
    });

    describe('Read user', () => {
      beforeEach(() => {
        req.role = 'Read';
      });

      it('should return read permissions when read user which owns data', async () => {
        const returnedPermissions = await getPermissions(req);

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
