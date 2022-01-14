const AppConfig = require('../../../config/appConfig');
const Establishment = require('../../../models/classes/establishment');
const models = require('../../../models');

let ALL_PERMISSIONS = [
  {
    code: 'canAddUser',
    description: 'add a user',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canAddEstablishment',
    description: 'add establishment - PARENT CAN ADD A SUB AT ANY TIME OWNERSHIP AUTOMATIC',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff', 'Workplace'],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canBulkUpload',
    description: 'bulk upload',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canChangePermissionsForSubsidiary',
    description: 'change permissions for subsidiary views',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff', 'Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff', 'Workplace'],
    isAdmin: false,
  },
  {
    code: 'canChangeDataOwner',
    description: 'change data owner',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff', 'Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff', 'Workplace'],
    isAdmin: false,
  },
  {
    code: 'canDeleteEstablishment',
    description: 'delete an establishment',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canDeleteAllEstablishments',
    description: 'delete an establishment',
    role: [],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: true,
  },
  {
    code: 'canDeleteUser',
    description: 'delete an user',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canEditUser',
    description: 'edit a user',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canViewEstablishment',
    description: 'view establishment',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff', 'Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff', 'Workplace'],
    isAdmin: false,
  },
  {
    code: 'canViewWdfReport',
    description: 'WDF report',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff', 'Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff', 'Workplace'],
    isAdmin: false,
  },
  {
    code: 'canViewListOfWorkers',
    description: 'View list of workers',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff'],
    subOwnedByParentAccessBySub: ['Workplace and Staff'],
    isAdmin: false,
  },
  {
    code: 'canCountWorkers',
    description: 'For WDF report, ability to show the staff count (grey bar)',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff', 'Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff', 'Workplace'],
    isAdmin: false,
  },
  {
    code: 'canViewWorker',
    description: 'view worker',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff'],
    subOwnedByParentAccessBySub: ['Workplace and Staff'],
    isAdmin: false,
  },
  {
    code: 'canAddWorker',
    description: 'add a worker',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [''],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canEditWorker',
    description: 'edit a worker',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [''],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canDeleteWorker',
    description: 'delete a worker',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [''],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canViewVisuals',
    description:
      'NEW yet to be built - Data Visualisation and key facts (total staff, total leavers, total starters/total establishment/staff turnover rate)',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff', 'Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff', 'Workplace'],
    isAdmin: false,
  },
  {
    code: 'canViewLastUpdateTime',
    description:
      'NEW yet to be built - Data Visualisation and key facts (total staff, total leavers, total starters/total establishment/staff turnover rate)',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff', 'Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff', 'Workplace'],
    isAdmin: false,
  },
  {
    code: 'canViewNotifications',
    description: 'NEW yet to be built - notifications area',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canSortEstablishments',
    description: 'NEW yet to be built - order establishment (alphabetical/size etc)',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff', 'Workplace'],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canSortWorkers',
    description: 'NEW yet to be built - order establishment (alphabetical/size etc)',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff'],
    subOwnedByParentAccessBySub: ['Workplace and Staff'],
    isAdmin: false,
  },
  {
    code: 'canTransferWorker',
    description: 'NEW yet to be built - move workers between subsidiaries',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canEditEstablishment',
    description: 'Edit establishment',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canViewUser',
    description: 'View user',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff', 'Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff', 'Workplace'],
    isAdmin: false,
  },
  {
    code: 'canViewListOfUsers',
    description: 'View list of users',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff', 'Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff', 'Workplace'],
    isAdmin: false,
  },
  {
    code: 'canRunLocalAuthorityReport',
    description: 'Run the Local Authority Report',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canRunLocalAuthorityAdminReport',
    description: 'Run the Admin Local Authority Report (across all Local Authorities)',
    role: [],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: true,
  },
  {
    code: 'canViewWdfSummaryReport',
    description: 'Run the WDF Summary Report',
    role: [],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: true,
  },
  {
    code: 'canSearchUsers',
    description: 'Search across all users',
    role: [],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: true,
  },
  {
    code: 'canSearchEstablishment',
    description: 'Search across all establishments',
    role: [],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: true,
  },
  {
    code: 'canLinkToParent',
    description: 'Link to any parent',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canBecomeAParent',
    description: 'Become a parent',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canRemoveParentAssociation',
    description: 'Remove Parent Association',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: ['Workplace and Staff', 'Workplace', 'None'],
    isAdmin: false,
  },
  {
    code: 'canDownloadWdfReport',
    description: 'download wdf report',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: false,
  },
  {
    code: 'canViewBenchmarks',
    description: 'Can the Establishment view Benchmarks tab',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff', 'Workplace', 'None'],
    subOwnedByParentAccessBySub: ['Workplace and Staff', 'Workplace', 'None'],
    isAdmin: false,
  },
  {
    code: 'canViewNinoDob',
    description: 'Can view NINO and DOB as admin',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
    isAdmin: true,
  },
];

class PermissionCache {
  constructor() {}

  static async initialize() {}

  static async myPermissions(req) {
    const estabType = this.getEstablishmentType(req.establishment);
    let permissions = [];
    const isLoggedInAsParent = req.isParent;

    if (req.role === 'Admin') {
      // console.log("0")
      permissions = this.filterForAdminRole();
    } else if (estabType === 'Standalone') {
      // console.log("1")
      permissions = this.filterByRole(this.getRoleEnum(req.role));
    } else if (
      !isLoggedInAsParent &&
      estabType == 'Subsidiary' &&
      this.getParentOwnerStatus(req.parentIsOwner) === 'Workplace'
    ) {
      // console.log("2")
      permissions = this.filterByRole(this.getRoleEnum(req.role));
    } else if (
      !isLoggedInAsParent &&
      estabType == 'Subsidiary' &&
      this.getParentOwnerStatus(req.parentIsOwner) === 'Parent'
    ) {
      // console.log("3")
      if (req.dataPermissions !== 'None' && req.role === 'Read') {
        permissions = this.filterByRole(this.getRoleEnum(req.role));
      } else {
        permissions = this.filterBySubOwnedByParent(req.dataPermissions);
      }
    } else if (
      isLoggedInAsParent &&
      this.getEstablishmentStatus(req.establishment, req.establishmentId) === 'Primary'
    ) {
      // console.log("4")
      permissions = this.filterByRole(this.getRoleEnum(req.role));
    } else if (
      isLoggedInAsParent &&
      this.getEstablishmentStatus(req.establishment, req.establishmentId) === 'Subsidiary' &&
      this.getParentOwnerStatus(req.parentIsOwner) == 'Parent'
    ) {
      // console.log("5")
      permissions = this.filterByRole(this.getRoleEnum(req.role));
    } else if (
      isLoggedInAsParent &&
      this.getEstablishmentStatus(req.establishment, req.establishmentId) === 'Subsidiary' &&
      this.getParentOwnerStatus(req.parentIsOwner) == 'Workplace'
    ) {
      // console.log("6")
      if (req.dataPermissions !== 'None' && req.role === 'Read') {
        permissions = this.filterByRole(this.getRoleEnum(req.role));
      } else {
        permissions = this.filterBysubOwnedByWorkplace(req.dataPermissions);
      }
    }

    if (estabType !== 'Subsidiary' && req.role !== 'Admin') {
      permissions = permissions.filter((perm) => perm.code !== 'canDeleteEstablishment');
    }

    const theirPermissions = permissions.map((thisPerm) => {
      return {
        code: thisPerm.code,
        description: thisPerm.description,
        role: thisPerm.role,
      };
    });

    if (req.role === 'Admin') {
      const adminPermissions = this.filterByAdminOnly();
      adminPermissions.forEach((thisPerm) => {
        theirPermissions.push({
          code: thisPerm.code,
          description: thisPerm.description,
          role: thisPerm.role,
        });
      });
    }

    const thisEstablishment = new Establishment.Establishment(req.username);
    try {
      await thisEstablishment.restore(req.establishmentId);
    } catch (error) {
      throw new Error(error);
    }
    const becomeAParentRequest = await models.Approvals.becomeAParentRequests(req.establishmentId);

    const permissionLevels = theirPermissions.map((permission) => {
      if (permission.code === 'canLinkToParent') {
        return {
          [permission.code]: !isLoggedInAsParent && !thisEstablishment.parentId && becomeAParentRequest === null,
        };
      }
      if (permission.code === 'canRemoveParentAssociation') {
        return {
          [permission.code]: !isLoggedInAsParent && thisEstablishment.parentId && req.role !== 'Read',
        };
      }
      if (permission.code === 'canDownloadWdfReport') {
        return {
          [permission.code]: (isLoggedInAsParent && req.role === 'Edit') || req.role === 'Admin',
        };
      }
      if (permission.code === 'canBecomeAParent') {
        return {
          [permission.code]: !isLoggedInAsParent && !thisEstablishment.parentId,
        };
      }
      if (permission.code === 'canViewBenchmarks') {
        // only selected mainservices can view Benchmarks
        return {
          [permission.code]: [24, 25, 20].includes(thisEstablishment.mainService.id) && thisEstablishment.isRegulated,
        };
      }
      if (permission.code === 'canChangeDataOwner' && thisEstablishment.dataOwnershipRequested !== null) {
        return { [permission.code]: false };
      }
      if (permission.code === 'canViewNinoDob') {
        return { [permission.code]: !req.isAdmin };
      }
      return { [permission.code]: true };
    });

    return permissionLevels;
  }

  static filterForAdminRole() {
    return ALL_PERMISSIONS;
  }

  static filterByRole(role) {
    return ALL_PERMISSIONS.filter(
      (x) =>
        x.isAdmin === false &&
        ((role == 'Edit' && x.role.includes('Edit')) || x.role.includes('Read') || x.role.includes(role)),
    );
  }

  static filterBysubOwnedByWorkplace(dataPermissions) {
    return ALL_PERMISSIONS.filter(
      (x) => x.isAdmin === false && x.subOwnedByWorkplaceAccessByParent.includes(dataPermissions),
    );
  }

  static filterBySubOwnedByParent(dataPermissions) {
    return ALL_PERMISSIONS.filter(
      (x) => x.isAdmin === false && x.subOwnedByParentAccessBySub.includes(dataPermissions),
    );
  }

  static filterByAdminOnly() {
    return ALL_PERMISSIONS.filter((x) => x.isAdmin === true);
  }

  static getRoleEnum(role) {
    return role == 'Edit' || role == 'Admin' ? 'Edit' : 'Read';
  }

  static getEstablishmentStatus(establishment, id) {
    return id !== establishment.id ? 'Subsidiary' : 'Primary';
  }

  static getDataPermissions(dataPermissions) {
    return dataPermissions;
  }

  static getParentOwnerStatus(parentIsOwner) {
    return parentIsOwner ? 'Parent' : 'Workplace';
  }

  static getEstablishmentType(establishment) {
    if (establishment.isSubsidiary) {
      return 'Subsidiary';
    } else if (establishment.isParent) {
      return 'Parent';
    } else if (!establishment.isSubsidiary && !establishment.isParent) {
      return 'Standalone';
    }
  }
}

if (AppConfig.ready) {
  PermissionCache.initialize()
    .then()
    .catch((err) => {
      console.error('Failed to initialise PermissionCache: ', err);
    });
} else {
  AppConfig.on(AppConfig.READY_EVENT, () => {
    PermissionCache.initialize()
      .then()
      .catch((err) => {
        console.error('Failed to initialise PermissionCache: ', err);
      });
  });
}

exports.PermissionCache = PermissionCache;
