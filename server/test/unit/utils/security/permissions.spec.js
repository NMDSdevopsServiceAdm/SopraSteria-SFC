const expect = require('chai').expect;
const sinon = require('sinon');

const {
  getPermissions,
  getEstablishmentType,
  ownsData,
  getViewingPermissions,
} = require('../../../../utils/security/permissions');
const models = require('../../../../models');

describe('permissions', () => {
  let req;
  beforeEach(() => {
    sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
      return {
        mainService: { id: 1 },
        dataOwnershipRequested: false,
        get: (field) => {
          if (field === 'hasParent') return false;
          if (field === 'hasRequestedToBecomeAParent') return false;
          if (field === 'IsRegulated') return false;
        },
      };
    });

    sinon.stub(models.user, 'getCanManageWdfClaims').callsFake(() => {
      return { CanManageWdfClaimsValue: false };
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
          'canViewEstablishment',
          'canViewWdfReport',
          'canViewUser',
          'canViewListOfUsers',
          'canDownloadWdfReport',
          'canAddUser',
          'canBulkUpload',
          'canChangePermissionsForSubsidiary',
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
          'canChangeDataOwner',
          'canDeleteEstablishment',
          'canDeleteAllEstablishments',
          'canRunLocalAuthorityAdminReport',
          'canViewWdfSummaryReport',
          'canSearchUsers',
          'canSearchEstablishment',
        ]);
      });

      it('should not return canViewNinoDob when req.role is admin', async () => {
        const returnedPermissions = await getPermissions(req);

        expect(returnedPermissions).not.to.include('canViewNinoDob');
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
          'canViewNinoDob',
          'canAddUser',
          'canBulkUpload',
          'canChangePermissionsForSubsidiary',
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
          'canChangeDataOwner',
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
          models.establishment.getInfoForPermissions.restore();
        });

        it('should return canLinkToParent permission when hasParent, hasRequestedToBecomeAParent and req.isParent is false', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 1 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return false;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
          });

          req.isParent = false;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).to.include('canLinkToParent');
        });

        it('should not return canLinkToParent permission when req.isParent is true', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 1 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return false;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
          });

          req.isParent = true;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canLinkToParent');
        });

        it('should not return canLinkToParent permission when hasParent is true', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 1 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return true;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
          });

          req.isParent = true;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canLinkToParent');
        });

        it('should not return canLinkToParent permission when hasRequestedToBecomeAParent is true', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 1 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return false;
                if (field === 'hasRequestedToBecomeAParent') return true;
                if (field === 'IsRegulated') return false;
              },
            };
          });

          req.isParent = true;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canLinkToParent');
        });
      });

      describe('canRemoveParentAssociation', async () => {
        beforeEach(() => {
          models.establishment.getInfoForPermissions.restore();
        });

        it('should return canRemoveParentAssociation permission when hasParent is true and req.isParent is false', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 1 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return true;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
          });

          req.isParent = false;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).to.include('canRemoveParentAssociation');
        });

        it('should not return canRemoveParentAssociation permission when req.isParent is true', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 1 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return false;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
          });

          req.isParent = true;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canRemoveParentAssociation');
        });

        it('should not return canRemoveParentAssociation permission when hasParent is false', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 1 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return false;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
          });

          req.isParent = false;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canRemoveParentAssociation');
        });

        it('should not return canRemoveParentAssociation permission hasParent is true and is parent is true', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 1 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return true;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
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

      describe('canBecomeAParent', async () => {
        beforeEach(() => {
          models.establishment.getInfoForPermissions.restore();
        });

        it('should return canBecomeAParent permission when hasParent and req.isParent is false', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 1 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return false;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
          });

          req.isParent = false;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).to.include('canBecomeAParent');
        });

        it('should not return canBecomeAParent permission when req.isParent is true', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 1 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return false;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
          });

          req.isParent = true;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canBecomeAParent');
        });

        it('should not return canBecomeAParent permission when hasParent is true and isParent is false', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 1 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return true;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
          });

          req.isParent = false;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canBecomeAParent');
        });

        it('should not return canBecomeAParent permission when hasParent is true', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 1 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return true;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
          });

          req.isParent = true;

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canBecomeAParent');
        });
      });

      describe('canChangeDataOwner', async () => {
        it('should return canChangeDataOwner permission when dataOwnershipRequested is false', async () => {
          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).to.include('canBecomeAParent');
        });

        it('should not return canChangeDataOwner permission when dataOwnershipRequested is true', async () => {
          models.establishment.getInfoForPermissions.restore();
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 1 },
              dataOwnershipRequested: true,
              get: (field) => {
                if (field === 'hasParent') return false;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
          });
          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canChangeDataOwner');
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
          'canViewNinoDob',
        ]);
      });

      describe('canViewBenchmarks', async () => {
        beforeEach(() => {
          models.establishment.getInfoForPermissions.restore();
        });

        it('should return canViewBenchmarks permission when isRegulated and main service id is in [24, 25, 20]', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 20 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return false;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return true;
              },
            };
          });

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).to.include('canViewBenchmarks');
        });

        it('should not return canViewBenchmarks permission when main service id is in [24, 25, 20] but isRegulated is false', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 20 },
              dataOwnershipRequested: false,
              get: (field) => {
                if (field === 'hasParent') return false;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
          });

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canViewBenchmarks');
        });

        it('should not return canViewBenchmarks permission when isRegulated but main service id is not in [24, 25, 20]', async () => {
          sinon.stub(models.establishment, 'getInfoForPermissions').callsFake(() => {
            return {
              mainService: { id: 12 },
              get: (field) => {
                if (field === 'hasParent') return false;
                if (field === 'hasRequestedToBecomeAParent') return false;
                if (field === 'IsRegulated') return false;
              },
            };
          });

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canViewBenchmarks');
        });
      });

      describe('canManageWdfClaims', async () => {
        it('should not include canManageWdfClaims in returned array when canManageWdfClaims is false', async () => {
          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).not.to.include('canManageWdfClaims');
        });

        it('should include canManageWdfClaims in returned array when is Wdf user', async () => {
          models.user.getCanManageWdfClaims.restore();
          sinon.stub(models.user, 'getCanManageWdfClaims').callsFake(() => {
            return { CanManageWdfClaimsValue: true };
          });

          const returnedPermissions = await getPermissions(req);

          expect(returnedPermissions).to.include('canManageWdfClaims');
        });
      });
    });

    describe('None user', async () => {
      beforeEach(() => {
        req.role = 'None';
      });

      it('should return array with canManageWdfClaims when is Wdf user', async () => {
        models.user.getCanManageWdfClaims.restore();
        sinon.stub(models.user, 'getCanManageWdfClaims').callsFake(() => {
          return { CanManageWdfClaimsValue: true };
        });

        const returnedPermissions = await getPermissions(req);

        expect(returnedPermissions).to.deep.equal(['canManageWdfClaims']);
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
    let establishmentInfo;
    beforeEach(() => {
      establishmentInfo = {
        hasParent: false,
        hasRequestedToBecomeAParent: false,
        isRegulated: true,
        mainServiceId: 1,
        dataOwnershipRequested: false,
      };
    });

    describe('canViewBenchmarks', () => {
      it('should return only dataPermissionNone() if user has no viewing permissions without canViewBenchmarks', () => {
        const permissions = getViewingPermissions('None', establishmentInfo);
        expect(permissions).to.deep.equal(['canRemoveParentAssociation']);
      });

      it('should return only dataPermissionNone() if user has no viewing permissions with canViewBenchmarks if regulated and has correct main service', () => {
        establishmentInfo.mainServiceId = 20;

        const permissions = getViewingPermissions('None', establishmentInfo);
        expect(permissions).to.deep.equal(['canRemoveParentAssociation', 'canViewBenchmarks']);
      });
    });

    it('should return only dataPermissionNone() if user has no viewing permissions', () => {
      const permissions = getViewingPermissions('None', establishmentInfo);
      expect(permissions).to.deep.equal(['canRemoveParentAssociation']);
    });

    it('should return dataPermissionWorkplace() if user has workplace only viewing permissions', () => {
      const permissions = getViewingPermissions('Workplace', establishmentInfo);
      expect(permissions).to.deep.equal([
        'canRemoveParentAssociation',
        'canChangePermissionsForSubsidiary',
        'canViewEstablishment',
        'canViewWdfReport',
        'canViewUser',
        'canViewListOfUsers',
        'canChangeDataOwner',
      ]);
    });

    describe('canChangeDataOwner', () => {
      it('should return only dataPermissionWorkplace() if user has no viewing permissions without canChangeDataOwner', () => {
        establishmentInfo.dataOwnershipRequested = true;

        const permissions = getViewingPermissions('Workplace', establishmentInfo);
        expect(permissions).to.deep.equal([
          'canRemoveParentAssociation',
          'canChangePermissionsForSubsidiary',
          'canViewEstablishment',
          'canViewWdfReport',
          'canViewUser',
          'canViewListOfUsers',
        ]);
      });

      it('should return only dataPermissionWorkplace() if user has no viewing permissions with canChangeDataOwner if no request has been sent already', () => {
        const permissions = getViewingPermissions('Workplace', establishmentInfo);
        expect(permissions).to.deep.equal([
          'canRemoveParentAssociation',
          'canChangePermissionsForSubsidiary',
          'canViewEstablishment',
          'canViewWdfReport',
          'canViewUser',
          'canViewListOfUsers',
          'canChangeDataOwner',
        ]);
      });
    });

    it('should return dataPermissionWorkplaceAndStaff() if user has workplace and staff viewing permissions', () => {
      const permissions = getViewingPermissions('Workplace and Staff', establishmentInfo);
      expect(permissions).to.deep.equal([
        'canRemoveParentAssociation',
        'canChangePermissionsForSubsidiary',
        'canViewEstablishment',
        'canViewWdfReport',
        'canViewUser',
        'canViewListOfUsers',
        'canChangeDataOwner',
        'canViewListOfWorkers',
        'canViewWorker',
      ]);
    });
  });
});
