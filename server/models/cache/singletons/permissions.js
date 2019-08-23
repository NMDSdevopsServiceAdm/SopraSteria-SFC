const AppConfig = require('../../../config/appConfig');

let ALL_PERMISSIONS = [
  {
    code: 'canAddUser',
    description: 'add a user',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff','Workplace'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canAddEstablishment',
    description: 'add establishment - PARENT CAN ADD A SUB AT ANY TIME OWNERSHIP AUTOMATIC',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff','Workplace'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canAddWorker',
    description: 'add a worker',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canBulkUpload',
    description: 'bulk upload',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canChangePermissionsForSubsidiary',
    description: 'change permissions for subsidiary views',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canDeleteEstablishment',
    description: 'delete an establishment',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canDeleteUser',
    description: 'delete an user',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff','Workplace'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canDeleteWorker',
    description: 'delete a worker',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canEditUser',
    description: 'edit a user',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff','Workplace'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canEditWorker',
    description: 'edit a worker',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canViewEstablishment',
    description: 'view establishment',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff','Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff','Workplace'],
  },
  {
    code: 'canViewWdfReport',
    description: 'WDF report',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff','Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff','Workplace'],
  },
  {
    code: 'canViewWorker',
    description: 'view worker',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff'],
    subOwnedByParentAccessBySub: ['Workplace and Staff'],
  },
  {
    code: 'canCountWorkers',
    description: 'For WDF report, ability to show the staff count (grey bar)',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff','Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff','Workplace'],
  },
  {
    code: 'canViewVisuals',
    description: 'NEW yet to be built - Data Visualisation and key facts (total staff, total leavers, total starters/total establishment/staff turnover rate)',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff','Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff','Workplace'],
  },
  {
    code: 'canViewLastUpdateTime',
    description: 'NEW yet to be built - Data Visualisation and key facts (total staff, total leavers, total starters/total establishment/staff turnover rate)',
    role: ['Edit', 'Read'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff','Workplace'],
    subOwnedByParentAccessBySub: ['Workplace and Staff','Workplace'],
  },
  {
    code: 'canViewNotifications',
    description: 'NEW yet to be built - notifications area',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canSortEstablishments',
    description: 'NEW yet to be built - order establishment (alphabetical/size etc)',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff','Workplace'],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canSortWorkers',
    description: 'NEW yet to be built - order establishment (alphabetical/size etc)',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff'],
    subOwnedByParentAccessBySub: ['Workplace and Staff'],
  },
  {
    code: 'canTransferWorker',
    description: 'NEW yet to be built - move workers between subsidiaries',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: [],
    subOwnedByParentAccessBySub: [],
  },
  {
    code: 'canViewListOfWorkers',
    description: 'View list of workers',
    role: ['Edit'],
    subOwnedByWorkplaceAccessByParent: ['Workplace and Staff'],
    subOwnedByParentAccessBySub: ['Workplace and Staff'],
  },
];

class PermissionCache {
  constructor() {}

  static async initialize() {

  }

  static myPermissions(requestData){

    const estabType = this.getEstablishmentType(requestData.establishment);
    let permissions = [];
    const isLoggedInAsParent = requestData.isParent;

    if(estabType == "Standalone") {
      // console.log("1")
      permissions = this.filterByRole(this.getRoleEnum(requestData.role));
    } else if (!isLoggedInAsParent && estabType == "Subsidiary" && this.getParentOwnerStatus(requestData.parentIsOwner) === 'Workplace') {
      // console.log("2")
      permissions = this.filterByRole(this.getRoleEnum(requestData.role));
    } else if (!isLoggedInAsParent && estabType == "Subsidiary" && this.getParentOwnerStatus(requestData.parentIsOwner) === 'Parent') {
      // console.log("3")
       if(requestData.role === 'Read'){
        permissions = this.filterByRole(this.getRoleEnum(requestData.role));
      }else{
        permissions = this.filterBySubOwnedByParent(requestData.dataPermissions);
      }
    } else if (isLoggedInAsParent && this.getEstablishmentStatus(requestData.establishment, requestData.establishmentId) === 'Primary') {
      // console.log("4")
      permissions = this.filterByRole(this.getRoleEnum(requestData.role));
    } else if (isLoggedInAsParent && this.getEstablishmentStatus(requestData.establishment, requestData.establishmentId) === 'Subsidiary' && this.getParentOwnerStatus(requestData.parentIsOwner) == 'Parent') {
      // console.log("5")
      permissions = this.filterByRole(this.getRoleEnum(requestData.role));
    } else if (isLoggedInAsParent && this.getEstablishmentStatus(requestData.establishment, requestData.establishmentId) === 'Subsidiary' && this.getParentOwnerStatus(requestData.parentIsOwner) == 'Workplace') {
      // console.log("6")
      permissions = this.filterBysubOwnedByWorkplace(requestData.dataPermissions);
    }

    return permissions.map(thisPerm => {
            return {
                code: thisPerm.code,
                description: thisPerm.description,
                role: thisPerm.role
        };
    });
  }

  static filterByRole(role){
    return ALL_PERMISSIONS
    .filter(x =>
        (role == "Edit" && x.role.includes("Edit") || x.role.includes("Read")) ||
        x.role.includes(role)
    );
  }

  static filterBysubOwnedByWorkplace(dataPermissions){
    return ALL_PERMISSIONS
    .filter(x => {
      console.log(`WA DEBUG TBC - (${dataPermissions}): `, x);
      return x.subOwnedByWorkplaceAccessByParent.includes(dataPermissions);
    });
  }

  static filterBySubOwnedByParent(dataPermissions){
    return ALL_PERMISSIONS
    .filter(x => x.subOwnedByParentAccessBySub.includes(dataPermissions));
  }

  static getRoleEnum(role){
    return (role == 'Edit' || role == 'Admin') ? "Edit" : "Read";
  }

  static getEstablishmentStatus(establishment, id){
     return (id !== establishment.id) ? "Subsidiary" : "Primary";
  }

  static getDataPermissions(dataPermissions){
    return dataPermissions;
  }

  static getParentOwnerStatus(parentIsOwner){
    return parentIsOwner ? "Parent" : "Workplace";
  }

  static getEstablishmentType(establishment){
    if(establishment.isSubsidiary){
      return "Subsidiary";
    }else if(establishment.isParent){
      return "Parent";
    }else if(!establishment.isSubsidiary && !establishment.isParent){
      return "Standalone";
    }
  }
}

if (AppConfig.ready) {
    PermissionCache.initialize()
    .then()
    .catch(err => {
      console.error("Failed to initialise PermissionCache: ", err);
    });
} else {
    AppConfig.on(AppConfig.READY_EVENT, () => {
        PermissionCache.initialize()
        .then()
        .catch(err => {
          console.error("Failed to initialise PermissionCache: ", err);
        });
    });
}

exports.PermissionCache = PermissionCache;
